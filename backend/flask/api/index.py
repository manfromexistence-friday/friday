from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import logging
from gtts import gTTS
from langdetect import detect
from io import BytesIO

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

# List of Gemini models
model_names = [
    "gemini-2.5-pro-exp-03-25",  # Experimental Pro model (with Google Search + Thinking)
    "gemini-2.0-flash-thinking-exp-01-21",  # Thinking model (no search + Thinking)
    "gemini-2.0-flash-exp-image-generation",# Experimental flash model (no search + Image Generation)
    "gemini-2.0-flash",          # Fast response streaming model (with Google Search)
    "gemini-2.0-flash-lite",     # Lightweight version (no search)
    "learnlm-1.5-pro-experimental",  # Learning model (no search)
    "gemini-1.5-pro",            # Stable Gemini 1.5 (with Google Search)
    "gemini-1.5-flash",          # Fast Gemini 1.5 (with Google Search)
    "gemini-1.5-flash-8b"        # 8B parameter version (with Google Search)
]

# Models that use Google Search
search_models = {
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
}

# Models that use Google Search
imagegen_models = {
    "gemini-2.0-flash-exp-image-generation",
}

# Models that use has Thinkging means Reasonings
thinking_models = {
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.0-flash-thinking-exp-01-21",
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
        # Use Google Search tool only for specified models
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

# Updated TTS route
@app.route('/tts', methods=['POST'])
def tts():
    """
    Text-to-Speech route that accepts text, detects language, and returns an MP3 audio file in memory.
    Expects JSON payload with 'text' field.
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
        mp3_buffer = BytesIO()  # Create an in-memory buffer
        tts.write_to_fp(mp3_buffer)  # Write audio data to buffer
        mp3_buffer.seek(0)  # Reset buffer position to start
        audio_data = mp3_buffer.read()  # Read the audio data

        logger.info("TTS audio generated for language: %s, size: %d bytes", lang, len(audio_data))
        return Response(
            audio_data,
            mimetype="audio/mpeg",
            headers={"Content-Disposition": f"attachment; filename=tts_{lang}.mp3"}
        )
    except Exception as e:
        logger.error("Error in TTS generation: %s", e)
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")