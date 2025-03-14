from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Get API key from environment variable with fallback for testing
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0")
logger.info("Using API key: %s", api_key[:5] + "..." if api_key else "None")  # Log partial key for safety

# Initialize Google AI
try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    logger.info("Gemini model initialized successfully")
except Exception as e:
    logger.error("Error initializing Gemini: %s", e)
    raise RuntimeError(f"Failed to initialize Gemini model: {e}")  # Stop the app if initialization fails

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
        response = model.generate_content(question)
        logger.info("Response generated: %s", response.text[:100])  # Log first 100 chars
        
        return jsonify({
            "response": response.text,
            "model_used": "gemini-2.0-flash"
        })
    except Exception as e:
        logger.error("Error processing request: %s", e)
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")
