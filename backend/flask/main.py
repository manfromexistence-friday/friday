from google import genai
import google.generativeai as genai_chat
from google.genai import types
from model_config import ModelManager
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIResponseGenerator:
    def __init__(self):
        self.model_manager = ModelManager()
        api_key = os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key)
        genai_chat.configure(api_key=api_key)

    def generate_response(self, question: str, model_name: str = None) -> dict:
        if model_name and not self.model_manager.switch_model(model_name):
            return {
                "error": f"Model {model_name} is not available",
                "available_models": self.model_manager.get_available_models()
            }

        # If question is empty, just return model information
        if not question.strip():
            return {
                "model_used": self.model_manager.current_model,
                "available_models": self.model_manager.get_available_models()
            }

        current_model = self.model_manager.get_current_model()
        
        try:
            if current_model.is_chat_model:
                response = self._generate_chat_response(question, current_model)
            else:
                response = self._generate_stream_response(question, current_model)
                
            self.model_manager.increment_usage(current_model.name)
            
            return {
                "response": response,
                "model_used": self.model_manager.current_model,  # Always include current model
                "requests_left": current_model.max_daily_requests - current_model.current_requests
            }
        except Exception as e:
            return {
                "error": str(e),
                "model_used": self.model_manager.current_model  # Include model even in error
            }

    def _generate_stream_response(self, question: str, model_config: ModelConfig) -> str:
        contents = [types.Content(
            role="user",
            parts=[types.Part.from_text(text=question)]
        )]

        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            response_mime_type="text/plain",
        )

        response_text = ""
        for chunk in self.client.models.generate_content_stream(
            model=model_config.name,
            contents=contents,
            config=generate_content_config,
        ):
            response_text += chunk.text

        return response_text

    def _generate_chat_response(self, question: str, model_config: ModelConfig) -> str:
        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        model = genai_chat.GenerativeModel(
            model_name=model_config.name,
            generation_config=generation_config,
        )

        chat = model.start_chat(history=[])
        response = chat.send_message(question)
        return response.text

generator = AIResponseGenerator()

def generate_response(question: str, model_name: str = None) -> dict:
    try:
        return generator.generate_response(question, model_name)
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return {
            "error": "Internal server error",
            "details": str(e)
        }

if __name__ == "__main__":
    response = generate_response("What time it is at India currently?")
    print(response)