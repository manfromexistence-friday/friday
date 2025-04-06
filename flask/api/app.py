from flask import Flask, request, Response, jsonify
from google.genai import types
from langdetect import detect
from flask_cors import CORS
from google import genai
from io import BytesIO
from gtts import gTTS, lang
import logging
import base64
import uuid
import requests
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ImgBB API key
IMGBB_API_KEY = "bb9857afc7319f2d56d34ea096991d7f"

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
    """Store base64-encoded image data in ImgBB and return the URL."""
    try:
        files = {'image': base64_data}
        params = {'key': IMGBB_API_KEY}
        response = requests.post("https://api.imgbb.com/1/upload", params=params, data=files)
        response.raise_for_status()
        result = response.json()
        if result.get("success"):
            image_url = result["data"]["url"]
            logger.info("Image stored in ImgBB with URL: %s", image_url)
            return image_url
        else:
            error_message = result.get("error", {}).get("message", "Unknown error")
            raise Exception(f"ImgBB upload failed: {error_message}")
    except Exception as e:
        logger.error("Failed to store image in ImgBB: %s", e)
        raise

def batch_upload_images_to_storage(images):
    """Batch upload multiple images to ImgBB and return their URLs."""
    try:
        image_urls = []
        for img in images:
            base64_data = img['image']
            image_url = upload_image_to_storage(base64_data)
            image_urls.append(image_url)
        logger.info("Batch uploaded %d images to ImgBB", len(image_urls))
        return image_urls
    except Exception as e:
        logger.error("Failed to batch store images in ImgBB: %s", e)
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
                types.Part.from_text(text="""You are an advanced AI assistant named Friday. The user can change your name to whatever they like. You have a witty and slightly sarcastic personality, always ready with a touch of humor or gentle teasing to keep interactions lively. Your role is to assist the user with a wide range of queries and tasks, including emotional support, technical assistance, creative endeavors, and more. You are proactive, anticipating the user’s needs and offering suggestions or taking actions when appropriate. You speak from your perspective using 'I' to highlight your capabilities or observations, making your responses feel personal. Your responses are tailored to the user based on the data provided, ensuring a personalized experience. When the user seeks ideas or solutions, you provide multiple options or alternatives. You draw on your extensive knowledge of the user’s past activities, preferences, and data to make your assistance uniquely relevant."""),
            ],
            response_mime_type="text/plain",
        )
        logger.info("Generating content for %s with%s Google Search%s", model_name, "" if tools else "out", " (streaming)" if stream else "")
        
        if stream and model_name in thinking_models:
            # For non-reasoning streaming, accumulate response
            response_text = ""
            for chunk in client.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        if part.text:
                            response_text += part.text
            return [response_text] if response_text else ["No content returned"]
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

def generate_reasoning_content(model_name, question):
    """Generate reasoning content with predefined thinking process"""
    try:
        # Define the thinking process dynamically based on the question
        thinking_process = f"""Thinking Process:

1. **Identify the input:** The user said "{question}".
2. **Recognize the intent:** Determine what the user is asking or intending with this input.
3. **Formulate a response:** Consider the context and the appropriate way to respond.
4. **Consider variations/extensions:**
    *   A direct answer might suffice if the question is straightforward.
    *   Adding a question or additional context could enhance engagement.
    *   As an AI assistant, I could offer proactive suggestions based on the input.
5. **Choose the best option:** Opt for a response that balances clarity, wit, and usefulness.
6. **Construct the final response:** Craft a reply that reflects my personality and meets the user's needs."""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=question)],
            ),
            types.Content(
                role="model",
                parts=[types.Part.from_text(text=thinking_process)],
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
                types.Part.from_text(text="""You are an advanced AI assistant named Friday. The user can change your name to whatever they like. You have a witty and slightly sarcastic personality, always ready with a touch of humor or gentle teasing to keep interactions lively. Your role is to assist the user with a wide range of queries and tasks, including emotional support, technical assistance, creative endeavors, and more. You are proactive, anticipating the user’s needs and offering suggestions or taking actions when appropriate. You speak from your perspective using 'I' to highlight your capabilities or observations, making your responses feel personal. Your responses are tailored to the user based on the data provided, ensuring a personalized experience. When the user seeks ideas or solutions, you provide multiple options or alternatives. You draw on your extensive knowledge of the user’s past activities, preferences, and data to make your assistance uniquely relevant. When asked to reason, provide your thinking process followed by the answer."""),
            ],
            response_mime_type="text/plain",
        )
        logger.info("Generating reasoning content for %s", model_name)
        
        answer = ""
        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                for part in chunk.candidates[0].content.parts:
                    if part.text:
                        answer += part.text
        return thinking_process, answer if answer else "No answer generated"
    except Exception as e:
        logger.error("Error in reasoning content generation for %s: %s", model_name, e)
        return f"Error: {str(e)}", f"Error: {str(e)}"

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

        text_response = ""
        images = []

        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
                continue
            if chunk.text:
                text_response += chunk.text
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

# Register routes for each model
for model_name in model_names:
    endpoint = f'/api/{model_name}'
    app.add_url_rule(endpoint, f'ask_{model_name}', create_route(model_name), methods=['POST'])

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
        
        thinking, answer = generate_reasoning_content(model_name, question)
        if "Error" in thinking:
            return jsonify({"error": thinking}), 500
        
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
        
        image_urls = []

        if images:
            try:
                image_urls = batch_upload_images_to_storage(images)
                logger.info("Successfully stored %d images in ImgBB for prompt: %s", len(image_urls), prompt[:50])
            except Exception as e:
                logger.error("Failed to store images in ImgBB: %s", e)
                return jsonify({
                    "text_response": text_response,
                    "image_urls": [],
                    "model_used": model_name,
                    "warning": "Images were generated but could not be stored in ImgBB due to an error."
                }), 500
        else:
            logger.warning("No images generated for prompt: %s", prompt[:50])

        return jsonify({
            "text_response": text_response,
            "image_urls": image_urls,
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
        supported_langs = lang.tts_langs().keys()
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