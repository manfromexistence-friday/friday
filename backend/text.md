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

                 pip uninstall Pyrebase4 -y
pip install Pyrebase4 --no-cache-dir













