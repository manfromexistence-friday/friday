from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.generativeai import types
import os

app = Flask(__name__)
CORS(app)

# Initialize Google AI
try:
    client = genai.Client(
        api_key=os.environ.get('GEMINI_API_KEY')
    )
except Exception as e:
    print(f"Error initializing Gemini: {e}")

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        tools = [types.Tool(google_search=types.GoogleSearch())]
        generate_content_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "tools": tools,
            "response_mime_type": "text/plain",
        }
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=data['question']),],
            ),
        ]
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            generation_config=generate_content_config,
        )
        response_text = response.candidates[0].content[0].text
        return jsonify({
            "response": response_text,
            "model_used": "gemini-2.0-flash"
        })
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000)