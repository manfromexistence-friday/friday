from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

# Initialize Google AI
try:
    client = genai.Client(api_key="AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0")
    model = "gemini-2.0-flash"
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
        
        # Set up the AI content generation
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=data['question'])]
            )
        ]
        tools = [types.Tool(google_search=types.GoogleSearch())]
        
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            tools=tools,
            response_mime_type="text/plain"
        )

        # Generate response using the model
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            response_text += chunk.text

        return jsonify({
            "response": response_text,
            "model_used": model
        })
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000)
