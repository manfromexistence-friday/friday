import io
from flask import Flask, request, jsonify, Response
from gtts import gTTS
from langdetect import detect
import whisper as openai_whisper  # Changed from 'import whisper'
from io import BytesIO
import logging
import soundfile as sf
import numpy as np
import gtts.lang  # Import this directly

app = Flask(__name__)
logger = logging.getLogger(__name__)

# Cache for the Whisper model
_model = None
def get_whisper_model():
    global _model
    if (_model is None):
        _model = openai_whisper.load_model("tiny")  # Updated to use openai_whisper
    return _model

@app.route('/tts', methods=['POST'])
def tts():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            logger.warning("Invalid TTS request: %s", request.data)
            return jsonify({"error": "Text is required"}), 400

        text = data['text']
        logger.info("Processing TTS request for text: %s", text[:50])

        # Detect language
        detected_lang = detect(text)
        supported_langs = gtts.lang.tts_langs()
        lang = detected_lang.split('-')[0]
        if lang not in supported_langs:
            logger.warning("Detected language %s not supported by gTTS, falling back to 'en'", lang)
            lang = 'en'

        # Generate TTS audio
        tts = gTTS(text=text, lang=lang, slow=False)
        mp3_buffer = BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)
        audio_data = mp3_buffer.read()

        # Use Whisper for word-level timestamps
        # We need to convert MP3 to the format Whisper expects
        try:
            import librosa
            import soundfile as sf
            
            # Create a temporary file to store MP3 data
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=True) as temp_mp3:
                temp_mp3.write(audio_data)
                temp_mp3.flush()
                
                # Load using librosa which handles MP3 format
                audio_array, sample_rate = librosa.load(temp_mp3.name, sr=16000)  # Whisper expects 16kHz
            
            # Process with Whisper
            model = get_whisper_model()
            result = model.transcribe(
                audio_array, 
                word_timestamps=True,
                language=lang
            )
            
            # Extract word timings
            word_timings = []
            if 'segments' in result:
                for segment in result['segments']:
                    for word in segment.get('words', []):
                        word_timings.append({
                            'word': word['word'].strip(),
                            'start': round(word['start'], 3),
                            'end': round(word['end'], 3)
                        })
            
        except Exception as whisper_error:
            logger.error(f"Error processing word timings with Whisper: {whisper_error}")
            word_timings = []  # Fallback to empty timings

        # Prepare response with both audio and timings
        response = {
            'audio': audio_data.hex(),
            'timings': word_timings,
            'language': lang
        }

        logger.info("TTS audio generated for language: %s, size: %d bytes, timings: %d words",
                    lang, len(audio_data), len(word_timings))
        
        return jsonify(response)

    except Exception as e:
        logger.error("Error in TTS generation: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run()