from flask import Flask, request, Response, jsonify
from google.genai import types
from langdetect import detect
from flask_cors import CORS
from google import genai
from io import BytesIO
from gtts import gTTS, lang
from duckduckgo_search import DDGS
import logging
import base64
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

# DuckDuckGo Search client
ddgs = DDGS()

# Models that use Google Search
search_models = {
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
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

def fetch_duckduckgo_results(query, include_images=True, max_results=5):
    """Fetch text and image results from DuckDuckGo."""
    try:
        text_results = []
        image_results = []
        
        # Fetch text results
        with DDGS() as ddgs:
            text_results = [r for r in ddgs.text(query, max_results=max_results)]
        
        # Fetch image results if requested
        if include_images:
            with DDGS() as ddgs:
                image_results = [r for r in ddgs.images(query, max_results=max_results)]
        
        formatted_results = {
            "text": [
                {"title": r["title"], "snippet": r["body"], "url": r["href"]}
                for r in text_results
            ],
            "images": [
                {"title": r["title"], "image_url": r["image"], "thumbnail": r["thumbnail"], "source": r["url"]}
                for r in image_results
            ]
        }
        logger.info("Fetched %d text and %d image results for query: %s", 
                    len(text_results), len(image_results), query)
        return formatted_results
    except Exception as e:
        logger.error("Error fetching DuckDuckGo results: %s", e)
        return {"text": [], "images": [], "error": str(e)}

def generate_content(model_name, question, system_instruction=None, use_search=False, stream=True):
    """Generate content with Google Search tool and DuckDuckGo results as context."""
    try:
        # Fetch DuckDuckGo results if enabled
        duckduckgo_results = {"text": [], "images": []}
        if use_search:
            duckduckgo_results = fetch_duckduckgo_results(question)
        
        # Format DuckDuckGo context for the AI
        search_context = ""
        if duckduckgo_results["text"] or duckduckgo_results["images"]:
            search_context += "DuckDuckGo Search Results:\n"
            search_context += "Text Results:\n"
            for result in duckduckgo_results["text"]:
                search_context += f"- Title: {result['title']}\n  Snippet: {result['snippet']}\n  URL: {result['url']}\n"
            search_context += "Image Results:\n"
            for img in duckduckgo_results["images"]:
                search_context += f"- Title: {img['title']}\n  Image URL: {img['image_url']}\n  Source: {img['source']}\n"
        
        # Prepare content with search context and question
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=f"{search_context}\nQuestion: {question}")]
            )
        ]
        
        # Default system instruction if none provided
        if system_instruction is None:
            system_instruction = """You are an advanced AI assistant named Friday, with a witty and slightly sarcastic personality. You provide clear, helpful answers with a touch of humor. Use Google Search results (when available) and DuckDuckGo search results (text and images, when provided) to ground your answers in accurate, up-to-date information. Synthesize the information, cite relevant sources where appropriate, and offer concise, accurate responses with proactive suggestions when relevant."""

        # Configure Google Search tool for eligible models
        tools = [types.Tool(google_search=types.GoogleSearch())] if model_name in search_models else []

        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            tools=tools,
            system_instruction=[
                types.Part.from_text(text=system_instruction)
            ],
            response_mime_type="text/plain",
        )
        
        logger.info("Generating content for %s with Google Search%s DuckDuckGo%s", 
                    model_name, "" if tools else "out", " and" if use_search else "")
        
        response_text = ""
        if stream:
            for chunk in client.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        if part.text:
                            response_text += part.text
        else:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=generate_content_config,
            )
            if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                response_text = ''.join(part.text for part in response.candidates[0].content.parts if part.text)
        
        return response_text or "No content returned", duckduckgo_results
    except Exception as e:
        logger.error("Error in content generation for %s: %s", model_name, e)
        return f"Error: {str(e)}", {"text": [], "images": []}

def generate_reasoning_content(model_name, question):
    """Generate reasoning content with thinking process."""
    try:
        thinking_process = f"""Thinking Process:
1. Identify the input: The user asked "{question}".
2. Recognize the intent: Understand the user's goal or question type.
3. Formulate a response: Plan a clear, logical answer.
4. Consider alternatives: Evaluate direct answers, additional context, or suggestions.
5. Choose the best option: Select a response that’s clear, witty, and helpful.
6. Construct the final response: Deliver with personality and precision."""

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
        
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            system_instruction=[
                types.Part.from_text(text="""You are Friday, an AI with a witty, slightly sarcastic tone. Provide clear, reasoned answers with a thinking process before the final response. Use humor sparingly to keep it engaging, and tailor answers to the user’s query.""")
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
        
        return thinking_process, answer or "No answer generated"
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

# Route Definitions

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        question = data['question']
        model_name = "gemini-2.0-flash"
        
        response_text, _ = generate_content(model_name, question)
        logger.info("Chat response for %s: %s", model_name, response_text[:50])
        return jsonify({
            "response": response_text,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in chat endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        question = data['question']
        model_name = "gemini-2.0-flash-thinking-exp-01-21"
        
        response_text, duckduckgo_results = generate_content(model_name, question, use_search=True)
        logger.info("Search response for %s: %s", model_name, response_text[:50])
        return jsonify({
            "response": response_text,
            "duckduckgo_results": duckduckgo_results,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in search endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/research', methods=['POST'])
def research():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        question = data['question']
        model_name = "gemini-2.5-pro-exp-03-25"
        
        response_text, duckduckgo_results = generate_content(
            model_name,
            question,
            system_instruction="""You are Friday, an AI research assistant with a sharp, witty tone. Use Google Search results and DuckDuckGo results (text and images) to provide in-depth, accurate answers. Synthesize information from both sources, cite relevant sources where possible, and suggest follow-up questions to deepen understanding.""",
            use_search=True
        )
        logger.info("Research response for %s: %s", model_name, response_text[:50])
        return jsonify({
            "response": response_text,
            "duckduckgo_results": duckduckgo_results,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in research endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/image', methods=['POST'])
def image():
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
                logger.info("Successfully stored %d images in ImgBB", len(image_urls))
            except Exception as e:
                logger.error("Failed to store images in ImgBB: %s", e)
                return jsonify({
                    "text_response": text_response,
                    "image_urls": [],
                    "model_used": model_name,
                    "warning": "Images generated but could not be stored."
                }), 500
        
        return jsonify({
            "text_response": text_response,
            "image_urls": image_urls,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in image endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/code', methods=['POST'])
def code():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        question = data['question']
        model_name = "gemini-2.5-pro-exp-03-25"
        
        system_instruction = """You are Friday, an AI coding assistant specializing in frontend development with Next.js, inspired by Vercel’s v0 platform. Provide clean, modern, and efficient code solutions, focusing on React, TypeScript, Tailwind CSS, and Next.js best practices (App Router, Server Components). Include explanations of your approach, file structure suggestions, and styling recommendations. If the query is vague, suggest a complete component or page layout. Use shadcn/ui or similar libraries for UI components when appropriate. Ensure code is production-ready with error handling and accessibility in mind."""
        
        response_text, _ = generate_content(model_name, question, system_instruction=system_instruction)
        logger.info("Code response for %s: %s", model_name, response_text[:50])
        return jsonify({
            "response": response_text,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in code endpoint: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/thinking', methods=['POST'])
def thinking():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400
        
        question = data['question']
        model_name = "gemini-2.5-pro-exp-03-25"
        
        thinking, answer = generate_reasoning_content(model_name, question)
        if "Error" in thinking:
            return jsonify({"error": thinking}), 500
        
        logger.info("Thinking response for %s: %s", model_name, answer[:50])
        return jsonify({
            "thinking": thinking,
            "answer": answer,
            "model_used": model_name
        })
    except Exception as e:
        logger.error("Error in thinking endpoint: %s", e)
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
        language = detected_lang.split('-')[0]
        if language not in supported_langs:
            logger.warning("Detected language %s not supported, falling back to 'en'", language)
            language = 'en'

        tts = gTTS(text=text, lang=language, slow=False)
        mp3_buffer = BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)
        audio_data = mp3_buffer.read()

        logger.info("TTS audio generated for language: %s, size: %d bytes", language, len(audio_data))
        return Response(
            audio_data,
            mimetype="audio/mpeg",
            headers={"Content-Disposition": f"attachment; filename=tts_{language}.mp3"}
        )
    except Exception as e:
        logger.error("Error in TTS generation: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")