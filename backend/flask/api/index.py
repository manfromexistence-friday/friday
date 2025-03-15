from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth
import shortuuid  # Replaced uuid with shortuuid
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./api/serviceAccountKey.json")  # Adjust path as needed
firebase_admin.initialize_app(cred)
db = firestore.client()

# Default Gemini API key
default_api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0")
logger.info("Default API key: %s", default_api_key[:5] + "...")

# Initialize Google AI client with default key
try:
    client = genai.Client(api_key=default_api_key)
    logger.info("Gemini client initialized with default key")
except Exception as e:
    logger.error("Error initializing Gemini client: %s", e)
    raise RuntimeError(f"Failed to initialize Gemini client: {e}")

# List of Gemini models
model_names = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-pro-exp-02-05",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-flash-exp",
    "learnlm-1.5-pro-experimental",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
]

# Models that use Google Search
search_models = {
    "gemini-2.0-flash",
    "gemini-2.0-pro-exp-02-05",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
}

def get_user_api_key(uid):
    """Retrieve user's custom API key from Firestore"""
    doc = db.collection('users').document(uid).get()
    if doc.exists and 'api_key' in doc.to_dict():
        return doc.to_dict()['api_key']
    return None

def initialize_client(api_key):
    """Initialize Gemini client with given API key"""
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error("Error initializing client with custom key: %s", e)
        return None

def generate_content(client, model_name, conversation_history):
    """Generate content with conversation history"""
    try:
        contents = [types.Content(role=msg['role'], parts=[types.Part.from_text(text=msg['content'])]) 
                   for msg in conversation_history]
        tools = [types.Tool(google_search=types.GoogleSearch())] if model_name in search_models else []
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            tools=tools,
        )
        logger.info("Generating content for %s with%s Google Search", model_name, "" if tools else "out")
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        )
        return response.text if response.text else "No content returned"
    except Exception as e:
        logger.error("Error in content generation for %s: %s", model_name, e)
        return f"Error: {str(e)}"

def generate_chat_title(client, conversation_history):
    """Generate an AI title for the chat"""
    try:
        prompt = "Generate a concise title for this conversation:\n" + "\n".join(
            [f"{msg['role']}: {msg['content']}" for msg in conversation_history]
        )
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(max_output_tokens=50),
        )
        return response.text.strip()
    except Exception as e:
        logger.error("Error generating title: %s", e)
        return "Untitled Chat"

def get_conversation_history(uid, session_id):
    """Retrieve conversation history for a session"""
    messages_ref = db.collection('users').document(uid).collection('sessions').document(session_id).collection('messages')
    messages = messages_ref.order_by('timestamp').get()
    return [{"role": msg.to_dict()['role'], "content": msg.to_dict()['content'], "timestamp": msg.to_dict()['timestamp']} 
            for msg in messages]

@app.route('/login', methods=['POST'])
def login():
    """User login with email and password"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    try:
        # Note: Firebase Admin doesn't directly handle login; this requires client-side auth.
        # Verify the ID token sent from the client after Firebase Authentication.
        id_token = data.get('id_token')  # Client must send this after Firebase Auth login
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return jsonify({"uid": uid, "token": id_token})
    except Exception as e:
        logger.error("Login failed: %s", e)
        return jsonify({"error": "Invalid credentials or token"}), 401

@app.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth.create_user(email=email, password=password)
        # Generate a custom token for the client (optional)
        custom_token = auth.create_custom_token(user.uid)
        return jsonify({"uid": user.uid, "token": custom_token.decode('utf-8')})
    except Exception as e:
        logger.error("Registration failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route('/api_key', methods=['POST'])
def set_api_key():
    """Set user's custom API key"""
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Authorization token required"}), 401
    
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        db.collection('users').document(uid).set({'api_key': api_key}, merge=True)
        logger.info("API key set for user %s", uid)
        return jsonify({"message": "API key updated successfully"})
    except Exception as e:
        logger.error("Error setting API key: %s", e)
        return jsonify({"error": "Invalid token or server error"}), 401

@app.route('/api/<model_name>/new', methods=['POST'])
def new_session(model_name):
    """Create a new chat session"""
    if model_name not in model_names:
        return jsonify({"error": "Invalid model name"}), 400
    
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Authorization token required"}), 401
    
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        session_id = shortuuid.uuid()  # Updated to use shortuuid
        
        session_ref = db.collection('users').document(uid).collection('sessions').document(session_id)
        session_ref.set({
            'model': model_name,
            'title': "Untitled Chat",
            'visibility': 'private',
            'created_at': firestore.SERVER_TIMESTAMP
        })
        logger.info("New session %s created for user %s with model %s", session_id, uid, model_name)
        return jsonify({"session_id": session_id})
    except Exception as e:
        logger.error("Error creating session: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/<model_name>/<session_id>/message', methods=['POST'])
def add_message(model_name, session_id):
    """Add a message to a session and get AI response"""
    if model_name not in model_names:
        return jsonify({"error": "Invalid model name"}), 400
    
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Authorization token required"}), 401
    
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        data = request.get_json()
        question = data.get('question')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        session_ref = db.collection('users').document(uid).collection('sessions').document(session_id)
        if not session_ref.get().exists:
            return jsonify({"error": "Session not found"}), 404
        
        messages_ref = session_ref.collection('messages')
        user_msg_ref = messages_ref.document()
        user_msg_ref.set({
            'role': 'user',
            'content': question,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        
        conversation_history = get_conversation_history(uid, session_id)
        user_api_key = get_user_api_key(uid)
        active_client = initialize_client(user_api_key) if user_api_key else client
        
        if not active_client:
            return jsonify({"error": "Failed to initialize client with custom API key"}), 500
        
        response_text = generate_content(active_client, model_name, conversation_history)
        
        ai_msg_ref = messages_ref.document()
        ai_msg_ref.set({
            'role': 'assistant',
            'content': response_text,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        
        logger.info("Message added and response generated for session %s", session_id)
        return jsonify({"response": response_text, "model_used": model_name})
    except Exception as e:
        logger.error("Error adding message: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/<model_name>/<session_id>/generate_title', methods=['POST'])
def generate_title(model_name, session_id):
    """Generate a title for the chat session"""
    if model_name not in model_names:
        return jsonify({"error": "Invalid model name"}), 400
    
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Authorization token required"}), 401
    
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        session_ref = db.collection('users').document(uid).collection('sessions').document(session_id)
        if not session_ref.get().exists:
            return jsonify({"error": "Session not found"}), 404
        
        conversation_history = get_conversation_history(uid, session_id)
        if not conversation_history:
            return jsonify({"error": "No conversation history to generate title"}), 400
        
        user_api_key = get_user_api_key(uid)
        active_client = initialize_client(user_api_key) if user_api_key else client
        title = generate_chat_title(active_client, conversation_history)
        
        session_ref.update({'title': title})
        logger.info("Title generated for session %s: %s", session_id, title)
        return jsonify({"title": title})
    except Exception as e:
        logger.error("Error generating title: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """Home route to check API status"""
    return jsonify({
        "status": "ok",
        "message": "API is running",
        "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names}
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")
    
# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# from google import genai
# from google.genai import types
# import os
# import logging
# import firebase_admin
# from firebase_admin import credentials, firestore, auth
# import uuid
# from datetime import datetime

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Initialize Firebase Admin SDK
# cred = credentials.Certificate("./api/serviceAccountKey.json")  # Adjust path
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# # Default Gemini API key
# default_api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0")
# logger.info("Default API key: %s", default_api_key[:5] + "...")

# # Initialize Google AI client with default key
# try:
#     client = genai.Client(api_key=default_api_key)
#     logger.info("Gemini client initialized with default key")
# except Exception as e:
#     logger.error("Error initializing Gemini client: %s", e)
#     raise RuntimeError(f"Failed to initialize Gemini client: {e}")

# # List of Gemini models
# model_names = [
#     "gemini-2.0-flash",
#     "gemini-2.0-flash-lite",
#     "gemini-2.0-pro-exp-02-05",
#     "gemini-2.0-flash-thinking-exp-01-21",
#     "gemini-2.0-flash-exp",
#     "learnlm-1.5-pro-experimental",
#     "gemini-1.5-pro",
#     "gemini-1.5-flash",
#     "gemini-1.5-flash-8b"
# ]

# # Models that use Google Search
# search_models = {
#     "gemini-2.0-flash",
#     "gemini-2.0-pro-exp-02-05",
#     "gemini-1.5-pro",
#     "gemini-1.5-flash",
#     "gemini-1.5-flash-8b"
# }

# def get_user_api_key(uid):
#     """Retrieve user's custom API key from Firestore"""
#     doc = db.collection('users').document(uid).get()
#     if doc.exists and 'api_key' in doc.to_dict():
#         return doc.to_dict()['api_key']
#     return None

# def initialize_client(api_key):
#     """Initialize Gemini client with given API key"""
#     try:
#         return genai.Client(api_key=api_key)
#     except Exception as e:
#         logger.error("Error initializing client with custom key: %s", e)
#         return None

# def generate_content(client, model_name, conversation_history):
#     """Generate content with conversation history"""
#     try:
#         contents = [types.Content(role=msg['role'], parts=[types.Part.from_text(text=msg['content'])]) 
#                    for msg in conversation_history]
#         tools = [types.Tool(google_search=types.GoogleSearch())] if model_name in search_models else []
#         generate_content_config = types.GenerateContentConfig(
#             temperature=1,
#             top_p=0.95,
#             top_k=40,
#             max_output_tokens=8192,
#             tools=tools,
#         )
#         logger.info("Generating content for %s with%s Google Search", model_name, "" if tools else "out")
#         response = client.models.generate_content(
#             model=model_name,
#             contents=contents,
#             config=generate_content_config,
#         )
#         return response.text if response.text else "No content returned"
#     except Exception as e:
#         logger.error("Error in content generation for %s: %s", model_name, e)
#         return f"Error: {str(e)}"

# def generate_chat_title(client, conversation_history):
#     """Generate an AI title for the chat"""
#     try:
#         prompt = "Generate a concise title for this conversation:\n" + "\n".join(
#             [f"{msg['role']}: {msg['content']}" for msg in conversation_history]
#         )
#         contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
#         response = client.models.generate_content(
#             model="gemini-1.5-flash",
#             contents=contents,
#             config=types.GenerateContentConfig(max_output_tokens=50),
#         )
#         return response.text.strip()
#     except Exception as e:
#         logger.error("Error generating title: %s", e)
#         return "Untitled Chat"

# def get_conversation_history(uid, session_id):
#     """Retrieve conversation history for a session"""
#     messages_ref = db.collection('users').document(uid).collection('sessions').document(session_id).collection('messages')
#     messages = messages_ref.order_by('timestamp').get()
#     return [{"role": msg.to_dict()['role'], "content": msg.to_dict()['content'], "timestamp": msg.to_dict()['timestamp']} 
#             for msg in messages]

# @app.route('/login', methods=['POST'])
# def login():
#     """User login with email and password"""
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')
#     try:
#         # Note: Firebase Admin doesn't directly handle login; this requires client-side auth.
#         # Instead, verify the ID token sent from the client after Firebase Authentication.
#         # For simplicity, we'll assume the client sends an ID token after login.
#         id_token = data.get('id_token')  # Client must send this after Firebase Auth login
#         decoded_token = auth.verify_id_token(id_token)
#         uid = decoded_token['uid']
#         return jsonify({"uid": uid, "token": id_token})
#     except Exception as e:
#         logger.error("Login failed: %s", e)
#         return jsonify({"error": "Invalid credentials or token"}), 401

# @app.route('/register', methods=['POST'])
# def register():
#     """Register a new user"""
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')
#     try:
#         user = auth.create_user(email=email, password=password)
#         # Generate a custom token for the client (optional)
#         custom_token = auth.create_custom_token(user.uid)
#         return jsonify({"uid": user.uid, "token": custom_token.decode('utf-8')})
#     except Exception as e:
#         logger.error("Registration failed: %s", e)
#         return jsonify({"error": str(e)}), 400

# @app.route('/api_key', methods=['POST'])
# def set_api_key():
#     """Set user's custom API key"""
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Authorization token required"}), 401
    
#     try:
#         decoded_token = auth.verify_id_token(token)
#         uid = decoded_token['uid']
#         data = request.get_json()
#         api_key = data.get('api_key')
        
#         if not api_key:
#             return jsonify({"error": "API key is required"}), 400
        
#         db.collection('users').document(uid).set({'api_key': api_key}, merge=True)
#         logger.info("API key set for user %s", uid)
#         return jsonify({"message": "API key updated successfully"})
#     except Exception as e:
#         logger.error("Error setting API key: %s", e)
#         return jsonify({"error": "Invalid token or server error"}), 401

# @app.route('/api/<model_name>/new', methods=['POST'])
# def new_session(model_name):
#     """Create a new chat session"""
#     if model_name not in model_names:
#         return jsonify({"error": "Invalid model name"}), 400
    
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Authorization token required"}), 401
    
#     try:
#         decoded_token = auth.verify_id_token(token)
#         uid = decoded_token['uid']
#         session_id = str(uuid.uuid4())
        
#         session_ref = db.collection('users').document(uid).collection('sessions').document(session_id)
#         session_ref.set({
#             'model': model_name,
#             'title': "Untitled Chat",
#             'visibility': 'private',
#             'created_at': firestore.SERVER_TIMESTAMP
#         })
#         logger.info("New session %s created for user %s with model %s", session_id, uid, model_name)
#         return jsonify({"session_id": session_id})
#     except Exception as e:
#         logger.error("Error creating session: %s", e)
#         return jsonify({"error": str(e)}), 500

# @app.route('/api/<model_name>/<session_id>/message', methods=['POST'])
# def add_message(model_name, session_id):
#     """Add a message to a session and get AI response"""
#     if model_name not in model_names:
#         return jsonify({"error": "Invalid model name"}), 400
    
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Authorization token required"}), 401
    
#     try:
#         decoded_token = auth.verify_id_token(token)
#         uid = decoded_token['uid']
#         data = request.get_json()
#         question = data.get('question')
        
#         if not question:
#             return jsonify({"error": "Question is required"}), 400
        
#         session_ref = db.collection('users').document(uid).collection('sessions').document(session_id)
#         if not session_ref.get().exists:
#             return jsonify({"error": "Session not found"}), 404
        
#         messages_ref = session_ref.collection('messages')
#         user_msg_ref = messages_ref.document()
#         user_msg_ref.set({
#             'role': 'user',
#             'content': question,
#             'timestamp': firestore.SERVER_TIMESTAMP
#         })
        
#         conversation_history = get_conversation_history(uid, session_id)
#         user_api_key = get_user_api_key(uid)
#         active_client = initialize_client(user_api_key) if user_api_key else client
        
#         if not active_client:
#             return jsonify({"error": "Failed to initialize client with custom API key"}), 500
        
#         response_text = generate_content(active_client, model_name, conversation_history)
        
#         ai_msg_ref = messages_ref.document()
#         ai_msg_ref.set({
#             'role': 'assistant',
#             'content': response_text,
#             'timestamp': firestore.SERVER_TIMESTAMP
#         })
        
#         logger.info("Message added and response generated for session %s", session_id)
#         return jsonify({"response": response_text, "model_used": model_name})
#     except Exception as e:
#         logger.error("Error adding message: %s", e)
#         return jsonify({"error": str(e)}), 500

# # Remaining routes (generate_title, rename_title, update_visibility, delete_session, update_message, rerun_message) remain unchanged
# # I'll include one example for brevity; others follow the same pattern

# @app.route('/api/<model_name>/<session_id>/generate_title', methods=['POST'])
# def generate_title(model_name, session_id):
#     if model_name not in model_names:
#         return jsonify({"error": "Invalid model name"}), 400
    
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Authorization token required"}), 401
    
#     try:
#         decoded_token = auth.verify_id_token(token)
#         uid = decoded_token['uid']
        
#         session_ref = db.collection('users').document(uid).collection('sessions').document(session_id)
#         if not session_ref.get().exists:
#             return jsonify({"error": "Session not found"}), 404
        
#         conversation_history = get_conversation_history(uid, session_id)
#         if not conversation_history:
#             return jsonify({"error": "No conversation history to generate title"}), 400
        
#         user_api_key = get_user_api_key(uid)
#         active_client = initialize_client(user_api_key) if user_api_key else client
#         title = generate_chat_title(active_client, conversation_history)
        
#         session_ref.update({'title': title})
#         logger.info("Title generated for session %s: %s", session_id, title)
#         return jsonify({"title": title})
#     except Exception as e:
#         logger.error("Error generating title: %s", e)
#         return jsonify({"error": str(e)}), 500

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({
#         "status": "ok",
#         "message": "API is running",
#         "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names}
#     })

# if __name__ == '__main__':
#     app.run(port=5000, debug=True, host="127.0.0.1")
