How to use google search tool in gemini to make a flask api endpoint and deploy it on vercel. Here I have tried to do this with this code ```from flask import Flask, request, jsonify

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

    app.run(port=5000)``` but getting this error ```{"error":"GenerationConfig.__init__() got an unexpected keyword argument 'tools'"}```

# flask==2.0.1
# flask-cors==3.0.10
# google-generativeai>=0.4.0
# python-dotenv==0.19.0
# Werkzeug==2.0.3
# google-genai==1.5.0

Flask==3.0.0
flask-cors==4.0.0
google-generativeai==0.4.0

curl -v -X POST http://localhost:5000/api/gemini-2.0-pro-exp-02-05 -H "Content-Type: application/json" -d '{"question": "What is the latest news about AI?"}'


    "gemini-2.0-flash-lite",     # Lightweight version
    "gemini-2.0-flash-thinking-exp-01-21",  # Thinking model
    "gemini-2.0-flash-exp",      # Experimental flash model
    "learnlm-1.5-pro-experimental",  # Learning model

    curl -v -X POST http://localhost:5000/api/gemini-2.0-flash -H "Content-Type: application/json" -d '{"question": "What time it is in india?"}'
    curl -v -X POST http://localhost:5000/api/learnlm-1.5-pro-experimental -H "Content-Type: application/json" -d '{"question": "What time it is in india?"}'
    curl -v -X POST https://friday-backend.vercel.app/api/gemini-2.0-flash -H "Content-Type: application/json" -d '{"question": "What time it is in india?"}'

    
      {/* <Separator className="my-1.5" />
                <CommandItem
                  className="justify-between text-xs"
                  value="temporary"
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    setAiOpen(false)
                  }}
                >
                  Temporary Chat
                  <Switch
                    checked={value === "temporary"}
                  />
                </CommandItem> */}

                

                 and updated apies routes and we need to add sessions which need route based on a generated chat id it will be like this ```api/gemini-2.0-flash/[chat-id]``` it will make sure that is specific provided and also put ```public/private and unlisted``` in the api so that we can figure how to distribute the chats and as api chat there will ai generated title of the chat that can be renamed by the user and





                 I have a flutter backend project and nextjs frontend project this is for a software called friday. Here you can chat with ai, make automations etc. Currently I have only created the chat with ai but didn't implemented chat session id, chat tile, chat types like public, private and unlisted and don't have a chat management system fully yet. So, I will use firebase as the database so, help me to add the chat title, session id, etc in the backend first. Here is the backend flask project ```from flask import Flask, request, Response, jsonify
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

# List of Gemini models
model_names = [
    "gemini-2.0-flash",          # Fast response streaming model (with Google Search)
    "gemini-2.0-flash-lite",     # Lightweight version (no search)
    "gemini-2.0-pro-exp-02-05",  # Experimental Pro model (with Google Search)
    "gemini-2.0-flash-thinking-exp-01-21",  # Thinking model (no search)
    "gemini-2.0-flash-exp",      # Experimental flash model (no search)
    "learnlm-1.5-pro-experimental",  # Learning model (no search)
    "gemini-1.5-pro",            # Stable Gemini 1.5 (with Google Search)
    "gemini-1.5-flash",          # Fast Gemini 1.5 (with Google Search)
    "gemini-1.5-flash-8b"        # 8B parameter version (with Google Search)
]

# Models that use Google Search
search_models = {
    "gemini-2.0-flash",
    "gemini-2.0-pro-exp-02-05",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
}

def generate_content(model_name, question):
    """Generate content with or without Google Search tool based on model"""
    try:
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=question)],
            ),
        ]
        # Use Google Search tool only for specified models
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

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "ok",
        "message": "API is running",
        "available_models": {model: "with Google Search" if model in search_models else "plain Q&A" for model in model_names}
    })

# Dynamically create routes for each model
def create_route(model_name):
    def route_func():
        try:
            data = request.get_json()
            if not data or 'question' not in data:
                logger.warning("Invalid request for %s: %s", model_name, request.data)
                return jsonify({"error": "Question is required"}), 400

            question = data['question']
            logger.info("Processing question for %s: %s", model_name, question)
            
            response_text = generate_content(model_name, question)
            logger.info("Response generated for %s: %s", model_name, response_text[:100])
            return jsonify({
                "response": response_text,
                "model_used": model_name
            })
        except Exception as e:
            logger.error("Error processing request for %s: %s", model_name, e)
            return jsonify({"error": str(e)}), 500
    return route_func

# Register routes for all models
for model_name in model_names:
    endpoint = f'/api/{model_name}'
    app.add_url_rule(endpoint, f'ask_{model_name}', create_route(model_name), methods=['POST'])
    logger.info("Registered endpoint: %s", endpoint)

# For local development
if __name__ == '__main__':
    app.run(port=5000, debug=True, host="127.0.0.1")
```