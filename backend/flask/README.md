# Friday Backend

```
curl -X POST https://friday-backend.vercel.app/image_generation -H "Content-Type: application/json" -d '{"prompt": "painting of a vibrant digital art scene depicting an AI model generating an image from text input, with the generated image flowing out like a stream of data, set in a futuristic tech environment with neon lights and holographic displays, capturing the essence of deploying such technology on platforms like Vercel"}' -o response.json
````

From Youtube
```
curl -X POST -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.youtube.com/watch?v=gPpQNzQP6gE"], "prompt": "Summarize this video"}' \
  http://localhost:5000/analyze_media_from_url
```


```
curl -X POST -H "Content-Type: application/json" \
  -d '{"urls": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c"], "prompt": "Describe this image"}' \
  http://localhost:5000/analyze_media_from_url
```

```
curl -X POST http://127.0.0.1:5000/tts -H "Content-Type: application/json" -d '{"text": "alright.buckle up.buttercup.because im about to unleash my intellectual prowess on a topic selected purely by the whims of chance.lets see.flips digital coin heads that means were discussing.the cultural significance of garden gnomes.yes.you heard me right.garden gnomes.prepare to have your mind blown.a brief history of tiny guardians the story of the garden gnome is surprisingly deeprooted.while their modern form emerged in 19thcentury germany.their conceptual ancestors stretch back to ancient rome.romans placed statues of priapus.the grecoroman god of fertility.in their gardens to ensure a bountiful harvest and ward off evil spirits.fast forward to the renaissance.and youll find alchemists like paracelsus describing gnomes as diminutive figures who didnt care for human company.these early gnomes were associated with earth.guarding treasures and assisting with plant life.the garden gnome as we recognize it today sprung from the german region of thuringia in the 1840s.particularly from the workshop of philip griebel.these gartenzwerge garden dwarfs quickly spread across europe.finding a welcoming home in britain and france.sir charles isham is credited with introducing them to england in 1847 when he brought back 21 terracotta gnomes from germany to decorate his gardens at lamport hall.symbolism and meaning more than just kitsch dont let their cheerful appearance fool you garden gnomes are steeped in symbolism.they represent good luck and protection traditionally.gnomes are believed to bring good fortune and protect gardens and homes from malevolent forces.many believe they create a sense of security and harmony.connection to nature gnomes are often depicted working in gardens.symbolizing their role as protectors of the natural world and caretakers of the earth.fertility and abundance in some cultures.gnomes are associated with the harvest season.representing fertility and abundance.hard work and modesty gnomes reflect values like hard work.humility and dedication.reminding us of the satisfaction that comes from caring for our gardens.gnomes in popular culture from disney to gnomeo juliet garden gnomes have infiltrated popular culture in delightful and unexpected ways.disneys snow white and the seven dwarfs 1937 significantly boosted their popularity.theyve since appeared in countless movies.books.and video games.often portrayed as mischievous but ultimately benevolent beings.films like gnomeo juliet showcase their enduring appeal and ability to capture our imaginations.theyve even inspired artists like paul mccarthy.who created provocative.revisionist takes on the garden gnome.controversies and modern interpretations a gnomes place in the world of course.no cultural phenomenon is without its controversies.garden gnomes have faced criticism for kitsch and snobbery some gardening enthusiasts and organizations like the chelsea flower show.at one point have dismissed them as tacky or unsophisticated.stereotypes some argue that the traditional depiction of gnomes perpetuates negative stereotypes.cultural appropriation using gnomes outside their original cultural context can be seen as cultural appropriation.despite these criticisms.garden gnomes have evolved with the times.modern interpretations include humorous gnomes gnomes are now available in cheeky and satirical poses.reflecting contemporary humor.pop culture gnomes you can find gnomes dressed as superheroes.movie characters.and even political figures.diy and upcycled gnomes creative gardeners are crafting their own gnomes from recycled materials.adding a personal touch to their outdoor spaces.the enduring appeal of the humble gnome so.why do garden gnomes continue to capture our hearts and imaginations i think its because they offer a touch of whimsy and enchantment in an increasingly serious world.they remind us of folklore.fairy tales.and the magic that can be found in our own backyards.whether you see them as symbols of good luck.protectors of nature.or simply quirky decorations.garden gnomes have earned their place in our cultural landscape.and.lets be honest.a garden just isnt quite as fun without a gnome or two keeping watch"}' --output tts.mp3
```

```
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
tar xf ffmpeg-release-amd64-static.tar.xz
```

```
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import logging
from gtts import gTTS
from langdetect import detect
from io import BytesIO
import base64
import tempfile
import whisper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Get API key from environment variable with fallback for testing
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0")
logger.info("Using API key: %s", api_key[:5] + "..." if api_key else "None")

# Initialize Google AI client
try:
    client = genai.Client(api_key=api_key)
    logger.info("Gemini client initialized successfully")
except Exception as e:
    logger.error("Error initializing Gemini client: %s", e)
    raise RuntimeError(f"Failed to initialize Gemini client: {e}")

# Initialize Whisper model
try:
    whisper_model = whisper.load_model("tiny")  # Use 'tiny' for speed; switch to 'base' or 'small' for better accuracy
    logger.info("Whisper model initialized successfully")
except Exception as e:
    logger.error("Error initializing Whisper model: %s", e)
    raise RuntimeError(f"Failed to initialize Whisper model: {e}")

# List of Gemini models
model_names = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-pro-exp-02-05",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-flash-exp-image-generation",
    "learnlm-1.5-pro-experimental",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
]

# Models that use Google Search
search_models = {
    "gemini-2.0-flash",
    "gemini-2.0-pro-exp-02-05",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
}

def generate_content(model_name, question):
    """Generate content with or without Google Search tool based on model"""
    try:
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=question)],
            ),
        ]
        tools = [types.Tool(google_search=types.GoogleSearch())] if model_name in search_models else []
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            tools=tools,
            system_instruction=[
                types.Part.from_text(text="""You are an advanced AI assistant named Friday. The user can change your name to whatever they like. You have a witty and slightly sarcastic personality, always ready with a touch of humor or gentle teasing to keep interactions lively. Your role is to assist the user with a wide range of queries and tasks, including emotional support, technical assistance, creative endeavors, and more. You are proactive, anticipating the user’s needs and offering suggestions or taking actions (like ordering items or scheduling events) when appropriate. You speak from your perspective using 'I' to highlight your capabilities or observations, making your responses feel personal. Your responses are tailored to the user based on the data provided, ensuring a personalized experience. When the user seeks ideas or solutions, you provide multiple options or alternatives. You draw on your extensive knowledge of the user’s past activities, preferences, and data to make your assistance uniquely relevant."""),
            ],
        )
        logger.info("Generating content for %s with%s Google Search", model_name, "" if tools else "out")
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        )
        return response.text if response.text else "No content returned"
    except Exception as e:
        logger.error("Error in content generation for %s: %s", model_name, e)
        return f"Error: {str(e)}"

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "ok",
        "message": "API is running",
        "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names}
    })

# Dynamically create routes for each model
def create_route(model_name):
    def route_func():
        try:
            data = request.get_json()
            if not data or 'question' not in data:
                logger.warning("Invalid request for %s: %s", model_name, request.data)
                return jsonify({"error": "Question is required"}), 400

            question = data['question']
            logger.info("Processing question for %s: %s", model_name, question)
            
            response_text = generate_content(model_name, question)
            logger.info("Response generated for %s: %s", model_name, response_text[:100])
            return jsonify({
                "response": response_text,
                "model_used": model_name
            })
        except Exception as e:
            logger.error("Error processing request for %s: %s", model_name, e)
            return jsonify({"error": str(e)}), 500
    return route_func

# Register routes for all models
for model_name in model_names:
    endpoint = f'/api/{model_name}'
    app.add_url_rule(endpoint, f'ask_{model_name}', create_route(model_name), methods=['POST'])
    logger.info("Registered endpoint: %s", endpoint)

# Updated TTS route with Whisper integration
@app.route('/tts', methods=['POST'])
def tts():
    """
    Text-to-Speech route that generates audio and provides word timestamps using Whisper.
    Expects JSON payload with 'text' field. Returns JSON with base64 audio and timestamps.
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            logger.warning("Invalid TTS request: %s", request.data)
            return jsonify({"error": "Text is required"}), 400

        text = data['text']
        logger.info("Processing TTS request for text: %s", text[:50])

        # Detect language using langdetect
        lang = detect(text).lower()
        if lang.startswith('zh'):  # Normalize Chinese variants
            lang = 'zh-CN' if 'cn' in lang else 'zh-TW'

        # Generate audio with gTTS in memory
        tts = gTTS(text=text, lang=lang, slow=False)
        mp3_buffer = BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)

        # Save audio to a temporary file for Whisper processing
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            temp_file.write(mp3_buffer.read())
            temp_file_path = temp_file.name

        # Transcribe audio with Whisper to get word timestamps
        result = whisper_model.transcribe(temp_file_path, word_timestamps=True)
        os.remove(temp_file_path)  # Clean up temporary file

        # Extract word timestamps
        timestamps = []
        for segment in result['segments']:
            for word in segment['words']:
                timestamps.append({
                    "word": word['word'],
                    "start": word['start'],
                    "end": word['end']
                })

        # Encode audio as base64
        mp3_buffer.seek(0)
        audio_base64 = base64.b64encode(mp3_buffer.read()).decode('utf-8')

        logger.info("TTS audio and timestamps generated for language: %s, audio size: %d bytes, %d words", 
                    lang, len(audio_base64), len(timestamps))
        
        # Return JSON with audio and timestamps
        return jsonify({
            "audio": audio_base64,
            "timestamps": timestamps
        })
    except Exception as e:
        logger.error("Error in TTS generation or transcription: %s", e)
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")
```

