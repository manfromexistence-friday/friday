from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import logging
from gtts import gTTS
import gtts.lang
from langdetect import detect
from io import BytesIO
import base64
import requests
import mimetypes
from urllib.parse import urlparse
import time
from astrapy import DataAPIClient
from PIL import Image
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Hardcoded Astra DB credentials
ASTRA_TOKEN = "AstraCS:dAhpEPifqzrGEuWJYcAfaody:2ceeb2d735f352b762bf42f825b89ecf6e791c59af1a6f9ed3dcf80b39d31a34"
ASTRA_DATABASE_ID = "24acd8f5-a743-4e45-a146-e1a7faedb4a6"
ASTRA_ENDPOINT = f"https://{ASTRA_DATABASE_ID}-eu-west-1.apps.astra.datastax.com"

# Initialize Astra DB client
client = DataAPIClient(ASTRA_TOKEN)
database = client.get_database(ASTRA_ENDPOINT)
collection = database.get_collection("images")

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

def compress_image(image_data, mime_type, max_size=(800, 800), quality=85):
    """Compress image data to fit within Astra DB's 1MB limit."""
    format_map = {
        "image/png": "PNG",
        "image/jpeg": "JPEG",
        "image/gif": "GIF",
    }
    format = format_map.get(mime_type)
    if not format:
        logger.warning(f"Unsupported image format: {mime_type}, storing as-is")
        return image_data  # Return original data if format is unsupported
    
    try:
        img = Image.open(io.BytesIO(image_data))
        img.thumbnail(max_size)  # Resize to max 800x800, preserving aspect ratio
        output = io.BytesIO()
        if format == "JPEG":
            img.save(output, format=format, quality=quality)
        else:
            img.save(output, format=format)
        compressed_data = output.getvalue()
        logger.info(f"Compressed image from {len(image_data)} bytes to {len(compressed_data)} bytes")
        return compressed_data
    except Exception as e:
        logger.error(f"Failed to compress image: {e}")
        return image_data  # Fallback to original data if compression fails

def upload_image_to_storage(base64_data, mime_type):
    """Store base64-encoded image data in Astra DB and return a reference ID."""
    try:
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_data)
        # Compress the image
        compressed_image = compress_image(image_bytes, mime_type)
        
        # Convert binary data back to base64 string for JSON storage
        base64_compressed = base64.b64encode(compressed_image).decode('utf-8')
        
        image_doc = {
            "image_data": base64_compressed,  # Store as base64 string
            "mime_type": mime_type,
            "timestamp": time.time()
        }
        result = collection.insert_one(image_doc)
        image_id = str(result.inserted_id)
        reference = f"{image_id}"
        logger.info("Image stored in Astra DB with ID: %s", image_id)
        return reference
    except Exception as e:
        logger.error("Failed to store image in Astra DB: %s", e)
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

        text_response = ""
        images = []

        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
                continue
            for part in chunk.candidates[0].content.parts:
                if part.inline_data:
                    mime_type = part.inline_data.mime_type
                    image_data = part.inline_data.data
                    base64_image = base64.b64encode(image_data).decode('utf-8')
                    images.append({
                        "image": base64_image,
                        "mime_type": mime_type
                    })
                elif part.text:
                    text_response += part.text

        return text_response if text_response else "No text response generated", images
    except Exception as e:
        logger.error("Error in image generation for %s: %s", model_name, e)
        return f"Error: {str(e)}", []

def analyze_media_content(files, text_prompt=None):
    """Analyze uploaded media files with an optional text prompt"""
    try:
        uploaded_files = []
        for file in files:
            file.seek(0)
            file_content = file.read()
            mime_type = file.content_type
            uploaded_file = client.files.upload(data=file_content, mime_type=mime_type)
            uploaded_files.append(uploaded_file)
            logger.info("Uploaded file: %s, mime_type: %s", uploaded_file.name, mime_type)

        parts = [types.Part.from_uri(file_uri=f.uri, mime_type=f.mime_type) for f in uploaded_files]
        if text_prompt:
            parts.append(types.Part.from_text(text=text_prompt))

        contents = [types.Content(role="user", parts=parts)]
        model_name = "gemini-2.5-pro-exp-03-25"
        generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

        logger.info("Analyzing media with model %s, files: %d, prompt: %s", model_name, len(uploaded_files), text_prompt[:50] if text_prompt else "None")
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.text:
                response_text += chunk.text

        for file in uploaded_files:
            client.files.delete(file.name)
            logger.info("Deleted uploaded file: %s", file.name)

        return response_text
    except Exception as e:
        logger.error("Error in media analysis: %s", e)
        for file in uploaded_files:
            try:
                client.files.delete(file.name)
            except:
                pass
        return f"Error: {str(e)}"

def get_media_from_url(url):
    """Download media content from a URL and determine its MIME type"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        content = response.content
        mime_type = response.headers.get('Content-Type')
        if not mime_type:
            parsed = urlparse(url)
            path = parsed.path
            mime_type = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        return content, mime_type
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Failed to download from {url}: {e}")

def analyze_media_from_urls(urls, text_prompt=None):
    """Analyze media from URLs with an optional text prompt"""
    try:
        uploaded_files = []
        parts = []

        for url in urls:
            if 'youtube.com' in url or 'youtu.be' in url:
                parts.append(types.Part.from_uri(file_uri=url, mime_type="video/*"))
                logger.info("Using YouTube URL directly: %s", url)
            # else:
            #     content, mime_type = get_media_from_url(url)
            #     uploaded_file = client.files.upload(data=content, mime_type=mime_type)
            #     uploaded_files.append(uploaded_file)
            #     parts.append(types.Part.from_uri(file_uri=uploaded_file.uri, mime_type=uploaded_file.mime_type))
            #     logger.info("Uploaded URL content: %s, mime_type: %s", url, mime_type)

        if text_prompt:
            parts.append(types.Part.from_text(text=text_prompt))

        contents = [types.Content(role="user", parts=parts)]
        model_name = "gemini-2.5-pro-exp-03-25"
        generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

        logger.info("Analyzing media from URLs with model %s, urls: %d, prompt: %s", model_name, len(urls), text_prompt[:50] if text_prompt else "None")
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.text:
                response_text += chunk.text

        for file in uploaded_files:
            client.files.delete(file.name)
            logger.info("Deleted uploaded file: %s", file.name)

        return response_text
    except Exception as e:
        logger.error("Error in media URL analysis: %s", e)
        for file in uploaded_files:
            try:
                client.files.delete(file.name)
            except:
                pass
        return f"Error: {str(e)}"

@app.route('/', methods=['GET'])
def home():
    api_docs = {
        "endpoints": [
            {
                "endpoint": "/",
                "method": "GET",
                "description": "Returns the API status and documentation for all endpoints.",
                "request_body": "None",
                "example_response": {
                    "status": "ok",
                    "message": "API is running",
                    "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names},
                    "endpoints": "List of all endpoints (this response)"
                }
            },
            {
                "endpoint": "/api/<model_name>",
                "method": "POST",
                "description": f"Generates a text response using the specified Gemini model. Available models: {', '.join(model_names)}.",
                "request_body": {"question": "string (required) - The question or prompt to process."},
                "example_request": {"question": "What is the capital of France?"},
                "example_response": {"response": "The capital of France is Paris.", "model_used": "gemini-2.0-flash"}
            },
            {
                "endpoint": "/reasoning",
                "method": "POST",
                "description": f"Generates a reasoned response using a thinking-capable model. Supported models: {', '.join(thinking_models)}.",
                "request_body": {
                    "question": "string (required) - The question or prompt to reason about.",
                    "model": f"string (optional) - The model to use (default: gemini-2.0-flash-thinking-exp-01-21). Options: {', '.join(thinking_models)}."
                },
                "example_request": {"question": "Should I invest all my money in a single stock?", "model": "gemini-2.0-flash-thinking-exp-01-21"},
                "example_response": {
                    "thinking": "Thinking Process: 1. Assess the risk of single-stock investment...",
                    "answer": "No, investing all your money in a single stock is risky due to lack of diversification...",
                    "model_used": "gemini-2.0-flash-thinking-exp-01-21"
                }
            },
            {
                "endpoint": "/image_generation",
                "method": "POST",
                "description": "Generates multiple images and text from a prompt using gemini-2.0-flash-exp-image-generation.",
                "request_body": {"prompt": "string (required) - The text description of the images to generate."},
                "example_request": {"prompt": "A futuristic cityscape with neon lights and flying cars"},
                "example_response": {
                    "text_response": "Generated images based on your prompt",
                    "images": [
                        {"image": "<astra_db_document_id>", "mime_type": "image/png"},
                        {"image": "<astra_db_document_id>", "mime_type": "image/png"}
                    ],
                    "model_used": "gemini-2.0-flash-exp-image-generation"
                }
            },
            {
                "endpoint": "/analyze_media",
                "method": "POST",
                "description": "Analyzes uploaded media files with an optional text prompt using gemini-2.5-pro-exp-03-25.",
                "request_body": "multipart/form-data with 'files' (required) - List of files, 'prompt' (optional) - Text prompt.",
                "example_request": "curl -X POST http://<host>/analyze_media -F 'files=@image.jpg' -F 'prompt=Describe this'",
                "example_response": {"response": "The image shows a cat on a windowsill.", "model_used": "gemini-2.5-pro-exp-03-25"}
            },
            {
                "endpoint": "/analyze_media_from_url",
                "method": "POST",
                "description": "Analyzes media from URLs with an optional text prompt using gemini-2.5-pro-exp-03-25.",
                "request_body": {"urls": "array of strings (required) - URLs to analyze.", "prompt": "string (optional) - Text prompt."},
                "example_request": {"urls": ["https://youtu.be/0PyHEaoZE1c"], "prompt": "Summarize this video"},
                "example_response": {"response": "The video is a tutorial on Gemini API...", "model_used": "gemini-2.5-pro-exp-03-25"}
            },
            {
                "endpoint": "/tts",
                "method": "POST",
                "description": "Converts text to speech using gTTS, returning an MP3 audio file.",
                "request_body": {"text": "string (required) - The text to convert to speech."},
                "example_request": {"text": "Hello, welcome to the API!"},
                "example_response": "Binary MP3 audio file with Content-Disposition: attachment; filename=tts_en.mp3"
            },
            {
                "endpoint": "/test_upload",
                "method": "GET",
                "description": "Tests uploading a sample image to Astra DB.",
                "request_body": "None",
                "example_response": {"url": "<astra_db_document_id>"}
            }
        ]
    }
    return jsonify({
        "status": "ok",
        "message": "API is running",
        "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names},
        "api_docs": api_docs
    })

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
    logger.info("Registered endpoint: %s", endpoint)

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
        logger.info("Generated %d images and text response", len(images))
        
        # Handle case where only text is returned
        if not images:
            logger.info("No images generated for prompt: %s, returning text only", prompt[:50])
            return jsonify({
                "text_response": text_response,
                "images": [],
                "model_used": model_name
            })

        # Store each image in Astra DB
        for img in images:
            logger.info("Processing image: mime_type=%s, size=%d bytes", img['mime_type'], len(img['image']))
            img['image'] = upload_image_to_storage(img['image'], img['mime_type'])

        logger.info("Successfully generated and stored %d images for prompt: %s", len(images), prompt[:50])
        
        return jsonify({
            "text_response": text_response,
            "images": images,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in image generation endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/test_upload', methods=['GET'])
def test_upload():
    """Test endpoint to verify Astra DB image storage functionality."""
    try:
        test_data = base64.b64encode(b"Test image content").decode('utf-8')
        reference = upload_image_to_storage(test_data, "image/png")
        logger.info("Test upload successful: %s", reference)
        return jsonify({"url": reference})
    except Exception as e:
        logger.error("Test upload failed: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_media', methods=['POST'])
def analyze_media():
    try:
        if not request.files:
            return jsonify({"error": "At least one file is required"}), 400
        
        files = request.files.getlist('files')
        text_prompt = request.form.get('prompt', None)
        
        if not files:
            return jsonify({"error": "No files uploaded"}), 400

        response_text = analyze_media_content(files, text_prompt)
        logger.info("Media analysis response: %s", response_text[:100])
        return jsonify({
            "response": response_text,
            "model_used": "gemini-2.5-pro-exp-03-25"
        })
    except Exception as e:
        logger.error("Error in media analysis endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_media_from_url', methods=['POST'])
def analyze_media_from_url():
    try:
        data = request.get_json()
        if not data or 'urls' not in data:
            return jsonify({"error": "URLs are required"}), 400
        
        urls = data['urls']
        text_prompt = data.get('prompt', None)
        
        if not urls or not isinstance(urls, list):
            return jsonify({"error": "URLs must be a non-empty list"}), 400

        response_text = analyze_media_from_urls(urls, text_prompt)
        logger.info("Media URL analysis response: %s", response_text[:100])
        return jsonify({
            "response": response_text,
            "model_used": "gemini-2.5-pro-exp-03-25"
        })
    except Exception as e:
        logger.error("Error in media URL analysis endpoint: %s", e)
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