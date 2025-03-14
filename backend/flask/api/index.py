from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Initialize Google AI
try:
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-2.0-flash')
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

        response = model.generate_content(data['question'])
        return jsonify({
            "response": response.text,
            "model_used": "gemini-pro"
        })
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=5000)


# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# from google import genai
# from google.genai import types
# import os
# import logging

# # Configure logging to show detailed output
# logging.basicConfig(level=logging.DEBUG)  # Changed to DEBUG for more detail
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# logger.info("GenAI configured with API key.")

# def generate_content_stream(question):
#     """Generate streaming content with Google Search tool"""
#     try:
#         client = genai.Client(api_key=api_key)
        
#         model = "gemini-2.0-flash"
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.debug("Sending request to Gemini with question: %s", question)
#         stream = client.models.generate_content_stream(
#             model=model,
#             contents=contents,
#             config=generate_content_config,
#             timeout=30  # Timeout to prevent hanging
#         )
        
#         chunk_count = 0
#         for chunk in stream:
#             chunk_count += 1
#             logger.debug("Processing chunk %d", chunk_count)
#             if hasattr(chunk, 'text') and chunk.text:
#                 logger.debug("Sending chunk %d: %s", chunk_count, chunk.text[:100])
#                 yield chunk.text + "\n"
#             else:
#                 logger.warning("Empty or invalid chunk %d received: %s", chunk_count, str(chunk))
#                 yield "No content in this chunk\n"
        
#         logger.info("Streaming complete with %d chunks for question: %s", chunk_count, question)
#         yield "Stream ended successfully\n"

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         yield f"Error: {str(e)}\n"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         # Return streaming response
#         response = Response(
#             generate_content_stream(question),
#             mimetype='text/plain',
#             headers={'Transfer-Encoding': 'chunked'},
#             direct_passthrough=True
#         )
#         logger.debug("Response object created for streaming")
#         return response
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     # Force Flask to run on localhost (127.0.0.1) for development
#     app.run(host='127.0.0.1', port=5000, debug=True)



# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# from google import genai
# from google.genai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# logger.info("GenAI configured with API key.")

# def generate_content_stream(question):
#     """Generate streaming content with Google Search tool"""
#     try:
#         client = genai.Client(api_key=api_key)
        
#         model = "gemini-2.0-flash"
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.info("Sending request to Gemini with question: %s", question)
#         stream = client.models.generate_content_stream(
#             model=model,
#             contents=contents,
#             config=generate_content_config,
#         )
        
#         for chunk in stream:
#             if chunk.text:
#                 logger.info("Sending chunk: %s", chunk.text[:100])  # Log first 100 chars
#                 yield chunk.text + "\n"  # Add newline for clarity in streaming
#             else:
#                 logger.warning("Empty chunk received")
#                 yield "No content in this chunk\n"
        
#         logger.info("Streaming complete for question: %s", question)
#         yield "Stream ended\n"  # Explicit end signal

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         yield f"Error: {str(e)}\n"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         # Return streaming response
#         return Response(
#             generate_content_stream(question),
#             mimetype='text/plain',
#             direct_passthrough=True
#         )
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     # Force Flask to run on localhost (127.0.0.1) for development
#     app.run(host='127.0.0.1', port=5000, debug=True)


























# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# from google import genai
# from google.genai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# logger.info("GenAI configured with API key.")

# def generate_content_stream(question):
#     """Generate streaming content with Google Search tool"""
#     try:
#         client = genai.Client(api_key=api_key)
        
#         model = "gemini-2.0-flash"
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.info("Sending request to Gemini with question: %s", question)
#         for chunk in client.models.generate_content_stream(
#             model=model,
#             contents=contents,
#             config=generate_content_config,
#         ):
#             if chunk.text:
#                 yield chunk.text
#             else:
#                 logger.warning("Empty chunk received")
#                 yield "No content in this chunk"

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         yield f"Error: {str(e)}"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         # Return streaming response
#         return Response(
#             generate_content_stream(question),
#             mimetype='text/plain',
#             direct_passthrough=True
#         )
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     # Force Flask to run on localhost (127.0.0.1) for development
#     app.run(host='127.0.0.1', port=5000, debug=True)
































































































# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# from google import genai
# from google.genai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# logger.info("GenAI configured with API key.")

# def generate_content_stream(question):
#     """Generate streaming content with Google Search tool"""
#     try:
#         client = genai.Client(api_key=api_key)
        
#         model = "gemini-2.0-flash"
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.info("Sending request to Gemini with question: %s", question)
#         for chunk in client.models.generate_content_stream(
#             model=model,
#             contents=contents,
#             config=generate_content_config,
#         ):
#             if chunk.text:
#                 yield chunk.text
#             else:
#                 logger.warning("Empty chunk received")
#                 yield "No content in this chunk"

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         yield f"Error: {str(e)}"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         # Return streaming response
#         return Response(
#             generate_content_stream(question),
#             mimetype='text/plain',
#             direct_passthrough=True
#         )
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5000)




















































































































































# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import google.generativeai as genai
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# genai.configure(api_key=api_key)
# logger.info("GenAI configured with API key.")

# def generate_content(question):
#     """Generate content with Google Search tool (non-streaming)"""
#     try:
#         model = genai.GenerativeModel('gemini-2.0-flash')
        
#         contents = question  # Simplified to string for older SDK
#         tools = [
#             genai.types.Tool(google_search=genai.types.GoogleSearch())
#         ]
#         generate_content_config = genai.types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.info("Sending request to Gemini with question: %s", question)
#         response = model.generate_content(
#             contents=contents,
#             generation_config=generate_content_config,
#         )

#         if response.candidates and len(response.candidates) > 0:
#             response_text = response.candidates[0].content.parts[0].text
#             logger.info("Response received: %s", response_text[:100])
#             return response_text
#         else:
#             logger.warning("No candidates in response")
#             return "No results found from Google Search."

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         return f"Error: {str(e)}"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         response_text = generate_content(question)
#         return jsonify({
#             "response": response_text,
#             "model_used": "gemini-2.0-flash"
#         })
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5000)
    
    






































































































































































































































# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import google.generativeai as genai
# from google.generativeai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# genai.configure(api_key=api_key)
# logger.info("GenAI configured with API key.")

# def generate_content(question):
#     """Generate content with Google Search tool (non-streaming)"""
#     try:
#         model = genai.GenerativeModel('gemini-2.0-flash')
        
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.info("Sending request to Gemini with question: %s", question)
#         response = model.generate_content(
#             contents=contents,
#             generation_config=generate_content_config,
#         )

#         if response.candidates and len(response.candidates) > 0:
#             response_text = response.candidates[0].content.parts[0].text
#             logger.info("Response received: %s", response_text[:100])
#             return response_text
#         else:
#             logger.warning("No candidates in response")
#             return "No results found from Google Search."

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         return f"Error: {str(e)}"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         response_text = generate_content(question)
#         return jsonify({
#             "response": response_text,
#             "model_used": "gemini-2.0-flash"
#         })
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5000)



































































































































































# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import google.generativeai as genai
# from google.generativeai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# genai.configure(api_key=api_key)
# logger.info("GenAI configured with API key.")

# def generate_content(question):
#     """Generate content with Google Search tool (non-streaming)"""
#     try:
#         client = genai.Client(api_key=api_key)
        
#         model = "gemini-2.0-flash"
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         logger.info("Sending request to Gemini with question: %s", question)
#         response = client.models.generate_content(
#             model=model,
#             contents=contents,
#             config=generate_content_config,
#         )

#         if response.candidates and len(response.candidates) > 0:
#             response_text = response.candidates[0].content.parts[0].text
#             logger.info("Response received: %s", response_text[:100])  # Log first 100 chars
#             return response_text
#         else:
#             logger.warning("No candidates in response")
#             return "No results found from Google Search."

#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         return f"Error: {str(e)}"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             logger.warning("Invalid request: %s", request.data)
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         response_text = generate_content(question)
#         return jsonify({
#             "response": response_text,
#             "model_used": "gemini-2.0-flash"
#         })
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5000)



















































































































# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# import google.generativeai as genai
# from google.generativeai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# genai.configure(api_key=api_key)
# logger.info("GenAI configured with API key.")

# def generate_content_stream(question):
#     """Generate streaming content with Google Search tool"""
#     try:
#         client = genai.Client(api_key=api_key)
        
#         model = "gemini-2.0-flash"
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=question)],
#             ),
#         ]
#         tools = [
#             types.Tool(google_search=types.GoogleSearch())
#         ]
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#             response_mime_type="text/plain",
#         )

#         for chunk in client.models.generate_content_stream(
#             model=model,
#             contents=contents,
#             config=generate_content_config,
#         ):
#             yield chunk.text
            
#     except Exception as e:
#         logger.error("Error in content generation: %s", e, exc_info=True)
#         yield f"Error: {str(e)}"

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             return jsonify({"error": "Question is required"}), 400

#         question = data['question']
#         logger.info("Processing question: %s", question)
        
#         # Return streaming response
#         return Response(
#             generate_content_stream(question),
#             mimetype='text/plain',
#             direct_passthrough=True
#         )
        
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5000)


































































































































































# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import google.generativeai as genai
# from google.generativeai import types
# import os
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Get API key from environment
# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY is not set")
# genai.configure(api_key=api_key)
# logger.info("GenAI configured with API key.")

# # Initialize the model
# model = genai.GenerativeModel('gemini-2.0-flash')

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"status": "ok", "message": "API is running"})

# @app.route('/api/ask', methods=['POST'])
# def ask():
#     try:
#         data = request.get_json()
#         if not data or 'question' not in data:
#             return jsonify({"error": "Question is required"}), 400

#         # Define the tools using the correct parameter type
#         tools = [types.Tool(function_declarations=[genai.types.FunctionDeclaration(
#             name="google_search",
#             description="Use Google Search to find relevant information",
#             parameters={
#                 "type": "OBJECT",
#                 "properties": {
#                     "query": {
#                         "type": "STRING",
#                         "description": "Search query",
#                     }
#                 },
#                 "required": ["query"],
#             },
#         )])]
#         generate_content_config = genai.types.GenerationConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#         )
#         contents = [
#             types.Content(
#                 role="user",
#                 parts=[types.Part.from_text(text=data['question'])],
#             ),
#         ]
#         logger.info("Generating content for question: %s", data['question'])
#         # Using non-streaming generate_content for simplicity
#         response = model.generate_content(
#             contents=contents,
#             generation_config=generate_content_config,
#         )

#         if response.candidates and len(response.candidates) > 0:
#             response_text = response.candidates[0].content[0].text
#         else:
#             response_text = "No response generated."

#         logger.info("Content generated successfully.")
#         return jsonify({
#             "response": response_text,
#             "model_used": "gemini-2.0-flash"
#         })
#     except Exception as e:
#         logger.error("Error processing request: %s", e, exc_info=True)
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5000)