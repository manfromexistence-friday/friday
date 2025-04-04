from flask import Flask, request, Response, jsonify
from astrapy import DataAPIClient
from google.genai import types
from langdetect import detect
from flask_cors import CORS
from google import genai
from io import BytesIO
from gtts import gTTS
import logging
import base64
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Astra setup
endpoint = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com"
token = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119"

try:
    client = DataAPIClient(token)
    database = client.get_database(endpoint)
    images_table = database.get_collection("images")
    logger.info("Successfully connected to Astra database!")
except Exception as e:
    logger.error("Failed to connect to Astra: %s", e)
    raise RuntimeError(f"Failed to connect to Astra: {e}")

# Get API key for Gemini
api_key = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0"
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
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-flash-exp-image-generation",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "learnlm-1.5-pro-experimental",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
]

# Models that use Google Search
search_models = {
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
}

# Models that support image generation
imagegen_models = {
    "gemini-2.0-flash-exp-image-generation",
}

# Models that have thinking (reasoning) capabilities
thinking_models = {
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.0-flash-thinking-exp-01-21",
}

def upload_image_to_storage(base64_data):
    """Store base64-encoded image data in Astra and return the image ID."""
    try:
        image_id = str(uuid.uuid4())
        row = {
            "id": image_id,
            "data": base64_data
        }
        insert_result = images_table.insert_one(row)
        if insert_result.inserted_id:
            logger.info("Image stored in Astra with ID: %s", image_id)
            return image_id
        else:
            logger.error("Failed to insert image into Astra")
            raise Exception("Failed to insert image into Astra")
    except Exception as e:
        logger.error("Failed to store image in Astra: %s", e)
        raise

def batch_upload_images_to_storage(images):
    """Batch upload multiple images to Astra and return their IDs."""
    try:
        image_ids = []
        for img in images:
            base64_data = img['image']
            image_id = str(uuid.uuid4())
            row = {
                "id": image_id,
                "data": base64_data
            }
            image_ids.append((image_id, row))
        
        # Batch insert into Astra
        if image_ids:
            rows = [row for _, row in image_ids]
            insert_result = images_table.insert_many(rows)
            if insert_result.inserted_ids:
                logger.info("Batch inserted %d images into Astra", len(insert_result.inserted_ids))
                return [image_id for image_id, _ in image_ids]
            else:
                logger.error("Failed to batch insert images into Astra")
                raise Exception("Failed to batch insert images into Astra")
        return []
    except Exception as e:
        logger.error("Failed to batch store images in Astra: %s", e)
        raise

def generate_content(model_name, question, stream=False):
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
            response_mime_type="text/plain",
        )
        logger.info("Generating content for %s with%s Google Search%s", model_name, "" if tools else "out", " (streaming)" if stream else "")
        
        if stream and model_name in thinking_models:
            parts = []
            for chunk in client.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        if part.text:
                            parts.append(part.text)
            return parts if parts else ["No content returned"]
        else:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=generate_content_config,
            )
            if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                return [part.text for part in response.candidates[0].content.parts if part.text]
            return ["No content returned"]
    except Exception as e:
        logger.error("Error in content generation for %s: %s", model_name, e)
        return [f"Error: {str(e)}"]

def generate_image_content(model_name, prompt):
    """Generate text and multiple images for image-capable models."""
    try:
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            temperature=2,
            response_modalities=["image", "text"],
            safety_settings=[
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_LOW_AND_ABOVE"),
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_LOW_AND_ABOVE"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_LOW_AND_ABOVE"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_LOW_AND_ABOVE"),
            ],
            response_mime_type="text/plain",
        )
        logger.info("Generating image content for %s with prompt: %s", model_name, prompt[:50])

        text_response = ""  # Initialize as a single string, not a list
        images = []

        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
                continue
            # Check for text response using chunk.text
            if chunk.text:
                text_response += chunk.text  # Append to the single string
            # Check for image data
            for part in chunk.candidates[0].content.parts:
                if part.inline_data:
                    mime_type = part.inline_data.mime_type
                    image_data = part.inline_data.data
                    base64_image = base64.b64encode(image_data).decode('utf-8')
                    images.append({
                        "image": base64_image,
                        "mime_type": mime_type
                    })

        if not images and not text_response:
            return "No images or text generated", []

        return text_response or "Images generated without text description.", images
    except Exception as e:
        logger.error("Error in image generation for %s: %s", model_name, e)
        return f"Error: {str(e)}", []

def create_route(model_name):
    def route_func():
        try:
            data = request.get_json()
            if not data or 'question' not in data:
                logger.warning("Invalid request for %s: %s", model_name, request.data)
                return jsonify({"error": "Question is required"}), 400

            question = data['question']
            logger.info("Processing question for %s: %s", model_name, question)
            
            parts = generate_content(model_name, question)
            response_text = ''.join(parts)
            logger.info("Response generated for %s: %s", model_name, response_text[:100])
            return jsonify({
                "response": response_text,
                "model_used": model_name
            })
        except Exception as e:
            logger.error("Error processing request for %s: %s", model_name, e)
            return jsonify({"error": str(e)}), 500
    return route_func

for model_name in model_names:
    endpoint = f'/api/{model_name}'
    app.add_url_rule(endpoint, f'ask_{model_name}', create_route(model_name), methods=['POST'])
    # logger.info("Registered endpoint: %s", endpoint)

@app.route('/reasoning', methods=['POST'])
def reasoning():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400
        
        question = data['question']
        model_name = data.get('model', "gemini-2.0-flash-thinking-exp-01-21")
        if model_name not in thinking_models:
            return jsonify({"error": f"Model {model_name} does not support reasoning"}), 400
        
        parts = generate_content(model_name, question, stream=True)
        if not parts or parts == ["No content returned"]:
            return jsonify({"error": "No content returned"}), 500
        
        thinking = parts[0] if parts else ""
        answer = ''.join(parts[1:]) if len(parts) > 1 else ""
        
        logger.info("Reasoning response for %s: thinking=%s, answer=%s", model_name, thinking[:50], answer[:50])
        return jsonify({
            "thinking": thinking,
            "answer": answer,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in reasoning endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/image_generation', methods=['POST'])
def image_generation():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt is required"}), 400
        
        prompt = data['prompt']
        model_name = "gemini-2.0-flash-exp-image-generation"
        
        logger.info("Starting image generation for prompt: %s", prompt[:50])
        text_response, images = generate_image_content(model_name, prompt)
        logger.info("Generated %d images for prompt: %s", len(images), prompt[:50])
        
        # Initialize image_ids as an empty list
        image_ids = []

        # Batch upload images to Astra if any were generated
        if images:
            try:
                image_ids = batch_upload_images_to_storage(images)
                logger.info("Successfully stored %d images in Astra for prompt: %s", len(image_ids), prompt[:50])
            except Exception as e:
                logger.error("Failed to store images in Astra: %s", e)
                return jsonify({
                    "text_response": text_response,
                    "image_ids": [],
                    "model_used": model_name,
                    "warning": "Images were generated but could not be stored in Astra due to an error."
                }), 500
        else:
            logger.warning("No images generated for prompt: %s", prompt[:50])

        return jsonify({
            "text_response": text_response,
            "image_ids": image_ids,  # Will be empty if no images were generated or if storage failed
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in image generation endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/tts', methods=['POST'])
def tts():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            logger.warning("Invalid TTS request: %s", request.data)
            return jsonify({"error": "Text is required"}), 400

        text = data['text']
        logger.info("Processing TTS request for text: %s", text[:50])

        detected_lang = detect(text)
        supported_langs = gtts.lang.tts_langs().keys()
        lang = detected_lang.split('-')[0]
        if lang not in supported_langs:
            logger.warning("Detected language %s not supported by gTTS, falling back to 'en'", lang)
            lang = 'en'

        tts = gTTS(text=text, lang=lang, slow=False)
        mp3_buffer = BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)
        audio_data = mp3_buffer.read()

        logger.info("TTS audio generated for language: %s, size: %d bytes", lang, len(audio_data))
        return Response(
            audio_data,
            mimetype="audio/mpeg",
            headers={"Content-Disposition": f"attachment; filename=tts_{lang}.mp3"}
        )
    except Exception as e:
        logger.error("Error in TTS generation: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")