from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.generativeai import types
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Get API key from environment
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")
genai.configure(api_key=api_key)
logger.info("GenAI configured with API key.")

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash')

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        # Define the tools using the correct parameter type
        tools = [types.Tool(function_declarations=[genai.types.FunctionDeclaration(
            name="google_search",
            description="Use Google Search to find relevant information",
            parameters={
                "type": "OBJECT",
                "properties": {
                    "query": {
                        "type": "STRING",
                        "description": "Search query",
                    }
                },
                "required": ["query"],
            },
        )])]
        generate_content_config = genai.types.GenerationConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            tools=tools,
        )
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=data['question'])],
            ),
        ]
        logger.info("Generating content for question: %s", data['question'])
        # Using non-streaming generate_content for simplicity
        response = model.generate_content(
            contents=contents,
            generation_config=generate_content_config,
        )

        if response.candidates and len(response.candidates) > 0:
            response_text = response.candidates[0].content[0].text
        else:
            response_text = "No response generated."

        logger.info("Content generated successfully.")
        return jsonify({
            "response": response_text,
            "model_used": "gemini-2.0-flash"
        })
    except Exception as e:
        logger.error("Error processing request: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)