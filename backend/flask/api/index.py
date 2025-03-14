from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import logging

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

def generate_content(question):
    """Generate content with Google Search tool"""
    try:
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=question)],
            ),
        ]
        tools = [
            types.Tool(google_search=types.GoogleSearch())
        ]
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            tools=tools,
        )
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=generate_content_config,
        )
        return response.text if response.text else "No content returned"
    except Exception as e:
        logger.error("Error in content generation: %s", e)
        return f"Error: {str(e)}"

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            logger.warning("Invalid request: %s", request.data)
            return jsonify({"error": "Question is required"}), 400

        question = data['question']
        logger.info("Processing question: %s", question)
        
        response_text = generate_content(question)
        return jsonify({
            "response": response_text,
            "model_used": "gemini-2.0-flash"
        })
    except Exception as e:
        logger.error("Error processing request: %s", e)
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")
