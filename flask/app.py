from flask import Flask, request, jsonify
from astrapy import DataAPIClient
from astrapy.info import CollectionDefinition
import datetime
import requests
import os
from litellm import completion
import uuid

app = Flask(__name__)

# DataStax Astra configuration (using provided hardcoded tokens)
ASTRA_DB_APPLICATION_TOKEN = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119"
ASTRA_DB_API_ENDPOINT = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com"

# Connect to Astra DB
my_client = DataAPIClient()
my_database = my_client.get_database(
    ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

# Create or get chats collection (no vector needed for chats)
try:
    chats_collection = my_database.create_collection(
        "chats",
        definition=CollectionDefinition.builder().build(),
        check_exists=True
    )
except Exception:
    chats_collection = my_database.get_collection("chats")

# Hugging Face configuration
def huggingface_get_response(model, user_input, past_user_inputs, generated_responses, api_key):
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {
        "inputs": {
            "past_user_inputs": past_user_inputs,
            "generated_responses": generated_responses,
            "text": user_input
        }
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Hugging Face API error: {response.text}")
    return response.json()[0]['generated_text']

# LiteLLM configuration
def litellm_get_response(model, messages, api_keys):
    # Set API keys dynamically based on model provider
    if "openai" in model.lower():
        os.environ["OPENAI_API_KEY"] = api_keys.get("openai", "")
    elif "anthropic" in model.lower():
        os.environ["ANTHROPIC_API_KEY"] = api_keys.get("anthropic", "")
    elif "mistral" in model.lower():
        os.environ["MISTRAL_API_KEY"] = api_keys.get("mistral", "")
    # Add more providers as needed
    try:
        response = completion(model=model, messages=messages)
        return response['choices'][0]['message']['content']
    except Exception as e:
        raise Exception(f"LiteLLM error: {str(e)}")

# Hugging Face route
@app.route('/huggingface/<model>/<chat_id>', methods=['POST', 'PUT'])
def huggingface_chat(model, chat_id):
    if request.method == 'POST':
        data = request.json
        first_message = data.get('message')
        api_key = data.get('api_key')
        user_uid = data.get('user_uid', 'anonymous')  # Default to anonymous if not provided
        if not first_message or not api_key:
            return jsonify({"error": "Missing message or api_key"}), 400
        
        # Generate assistant response
        try:
            assistant_response = huggingface_get_response(model, first_message, [], [], api_key)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        messages = [
            {"role": "user", "content": first_message},
            {"role": "assistant", "content": assistant_response}
        ]
        
        # Create chat document
        chat_doc = {
            "_id": chat_id,
            "id": chat_id,
            "title": "New Conversation",
            "messages": messages,
            "model": model,
            "visibility": "public",
            "createdAt": datetime.datetime.now().isoformat(),
            "updatedAt": datetime.datetime.now().isoformat(),
            "creatorUid": user_uid,
            "reactions": {"likes": {}, "dislikes": {}},
            "participants": [user_uid],
            "views": 0,
            "uniqueViewers": [],
            "isPinned": False,
            "api_key": api_key  # Store single API key for Hugging Face
        }
        
        try:
            chats_collection.insert_one(chat_doc)
        except Exception as e:
            return jsonify({"error": f"Failed to create chat: {str(e)}"}), 500
        
        return jsonify({"status": "Chat created", "chat_id": chat_id}), 201

    elif request.method == 'PUT':
        data = request.json
        chat_doc = chats_collection.find_one({"_id": chat_id})
        if not chat_doc:
            return jsonify({"error": "Chat not found"}), 404
        
        if 'message' in data:
            new_message = data['message']
            api_key = chat_doc.get('api_key')
            if not api_key:
                return jsonify({"error": "API key not set"}), 400
            
            # Extract past conversation
            past_user_inputs = [msg['content'] for msg in chat_doc['messages'] if msg['role'] == 'user']
            generated_responses = [msg['content'] for msg in chat_doc['messages'] if msg['role'] == 'assistant']
            
            # Generate assistant response
            try:
                assistant_response = huggingface_get_response(model, new_message, past_user_inputs, generated_responses, api_key)
            except Exception as e:
                return jsonify({"error": str(e)}), 500
            
            # Update messages
            updated_messages = chat_doc['messages'] + [
                {"role": "user", "content": new_message},
                {"role": "assistant", "content": assistant_response}
            ]
            
            # Update chat document
            updated_chat_doc = {
                **chat_doc,
                "messages": updated_messages,
                "updatedAt": datetime.datetime.now().isoformat()
            }
            try:
                chats_collection.replace_one({"_id": chat_id}, updated_chat_doc)
            except Exception as e:
                return jsonify({"error": f"Failed to update chat: {str(e)}"}), 500
            
            return jsonify({"status": "Message added"}), 200
        
        elif 'api_key' in data:
            new_api_key = data['api_key']
            updated_chat_doc = {
                **chat_doc,
                "api_key": new_api_key,
                "updatedAt": datetime.datetime.now().isoformat()
            }
            try:
                chats_collection.replace_one({"_id": chat_id}, updated_chat_doc)
            except Exception as e:
                return jsonify({"error": f"Failed to update API key: {str(e)}"}), 500
            
            return jsonify({"status": "API key updated"}), 200
        
        return jsonify({"error": "No valid data provided"}), 400

# LiteLLM route
@app.route('/litellm/<model>/<chat_id>', methods=['POST', 'PUT'])
def litellm_chat(model, chat_id):
    if request.method == 'POST':
        data = request.json
        first_message = data.get('message')
        api_keys = data.get('api_keys', {})  # Expect a dictionary of provider keys
        user_uid = data.get('user_uid', 'anonymous')
        if not first_message or not api_keys:
            return jsonify({"error": "Missing message or api_keys"}), 400
        
        # Prepare messages for LiteLLM
        messages = [{"role": "user", "content": first_message}]
        
        # Generate assistant response
        try:
            assistant_response = litellm_get_response(model, messages, api_keys)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        messages.append({"role": "assistant", "content": assistant_response})
        
        # Create chat document
        chat_doc = {
            "_id": chat_id,
            "id": chat_id,
            "title": "New Conversation",
            "messages": messages,
            "model": model,
            "visibility": "public",
            "createdAt": datetime.datetime.now().isoformat(),
            "updatedAt": datetime.datetime.now().isoformat(),
            "creatorUid": user_uid,
            "reactions": {"likes": {}, "dislikes": {}},
            "participants": [user_uid],
            "views": 0,
            "uniqueViewers": [],
            "isPinned": False,
            "api_keys": api_keys  # Store multiple API keys for LiteLLM
        }
        
        try:
            chats_collection.insert_one(chat_doc)
        except Exception as e:
            return jsonify({"error": f"Failed to create chat: {str(e)}"}), 500
        
        return jsonify({"status": "Chat created", "chat_id": chat_id}), 201

    elif request.method == 'PUT':
        data = request.json
        chat_doc = chats_collection.find_one({"_id": chat_id})
        if not chat_doc:
            return jsonify({"error": "Chat not found"}), 404
        
        if 'message' in data:
            new_message = data['message']
            api_keys = chat_doc.get('api_keys', {})
            if not api_keys:
                return jsonify({"error": "API keys not set"}), 400
            
            # Update messages
            updated_messages = chat_doc['messages'] + [{"role": "user", "content": new_message}]
            
            # Generate assistant response
            try:
                assistant_response = litellm_get_response(model, updated_messages, api_keys)
            except Exception as e:
                return jsonify({"error": str(e)}), 500
            
            updated_messages.append({"role": "assistant", "content": assistant_response})
            
            # Update chat document
            updated_chat_doc = {
                **chat_doc,
                "messages": updated_messages,
                "updatedAt": datetime.datetime.now().isoformat()
            }
            try:
                chats_collection.replace_one({"_id": chat_id}, updated_chat_doc)
            except Exception as e:
                return jsonify({"error": f"Failed to update chat: {str(e)}"}), 500
            
            return jsonify({"status": "Message added"}), 200
        
        elif 'api_keys' in data:
            new_api_keys = data['api_keys']
            updated_chat_doc = {
                **chat_doc,
                "api_keys": new_api_keys,
                "updatedAt": datetime.datetime.now().isoformat()
            }
            try:
                chats_collection.replace_one({"_id": chat_id}, updated_chat_doc)
            except Exception as e:
                return jsonify({"error": f"Failed to update API keys: {str(e)}"}), 500
            
            return jsonify({"status": "API keys updated"}), 200
        
        return jsonify({"error": "No valid data provided"}), 400

if __name__ == '__main__':
    app.run(debug=True)