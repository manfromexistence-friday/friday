# Friday Backend

```
import os
import requests
import mimetypes
import time
from urllib.parse import urlparse

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
                "endpoint": "/debug",
                "method": "GET",
                "description": "Debug endpoint to check environment variables and storage client status.",
                "request_body": "None",
                "example_response": {"status": "Storage client initialized", "astra_connected": True}
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
                    "image_ids": ["<astra_image_id_1>", "<astra_image_id_2>"],
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
                "description": "Tests uploading a sample image to Astra.",
                "request_body": "None",
                "example_response": {"url": "<astra_image_id>"}
            }
        ]
    }
    return jsonify({
        "status": "ok",
        "message": "API is running",
        "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names},
        "api_docs": api_docs
    })

@app.route('/debug', methods=['GET'])
def debug():
    """Debug endpoint to check environment variables and storage client status."""
    status = {
        "astra_connected": images_table is not None,
        "api_key_set": bool(api_key)
    }
    logger.info("Debug info: %s", status)
    return jsonify(status)



@app.route('/test_upload', methods=['GET'])
def test_upload():
    """Test endpoint to verify Astra image storage functionality."""
    try:
        test_data = base64.b64encode(b"Test image content").decode('utf-8')
        reference = upload_image_to_storage(test_data)
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

```

```
curl https://friday-backend.vercel.app/debug
```

```
curl -X POST http://localhost:5000/image_generation -H "Content-Type: application/json" -d '{"prompt": "A futuristic cityscape with neon lights and flying cars"}' -o response.json
```

```
curl -X POST https://friday-backend.vercel.app/reasoning -H "Content-Type: application/json" -d '{"question": "Hello, make a painting of a vibrant digital art scene depicting an AI model generating an image from text input, with the generated image flowing out like a stream of data, set in a futuristic tech environment with neon lights and holographic displays, capturing the essence of deploying such technology on platforms like Vercel"}' -o response.json
```

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
