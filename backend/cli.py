import requests
import argparse
import json
import os
from typing import Dict, Any

# Available AI Models (matches Flask API)
AVAILABLE_MODELS = [
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

DEFAULT_MODEL = "gemini-2.0-flash"
DEFAULT_API_KEY = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0"
BASE_URL = "https://friday-backend.vercel.app"  # Update to "http://localhost:5000" for local testing
CONFIG_FILE = "api_key_config.json"

def load_api_key_config() -> tuple[str, bool]:
    """Load API key and custom status from config file"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)
            return config.get('api_key', DEFAULT_API_KEY), config.get('is_custom', False)
    return DEFAULT_API_KEY, False

def save_api_key_config(api_key: str, is_custom: bool) -> None:
    """Save API key and custom status to config file"""
    config = {'api_key': api_key, 'is_custom': is_custom}
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f)

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def display_models(models: Dict[str, str], current_model: str = None) -> None:
    if not models:
        print("No models data received")
        return
        
    print("\nAvailable Models:")
    print("─" * 80)
    print(f"{'Model Name':<40} {'Type':<20} {'Status':<10}")
    print("─" * 80)
    
    try:
        for model_name, model_type in models.items():
            status = "✓ Current" if model_name == current_model else "Available"
            print(f"{model_name:<40} {model_type:<20} {status:<10}")
    except Exception as e:
        print(f"Error displaying model data: {e}")
        print(f"Model data structure: {models}")
    print("─" * 80)

def ask_question(question: str, model: str, api_key: str) -> None:
    url = f"{BASE_URL}/api/{model}"
    headers = {'Content-Type': 'application/json'}
    data = {'question': question}

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        if 'error' in result:
            print(f"\n❌ Error: {result['error']}")
            return
            
        if 'response' in result:
            formatted_response = ' '.join(result['response'].split())
            model_name = result.get('model_used', model)
            api_key_status = "custom" if api_key != DEFAULT_API_KEY else "default"
            print(f"\n ^.^ Friday response ({model_name}): {formatted_response}")
            # print(f"\n^_^ Friday response ({model_name} - {api_key_status} key): {formatted_response}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")

def fetch_available_models() -> Dict[str, str]:
    url = f"{BASE_URL}/"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return data.get('available_models', {})
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching models: {e}")
        return {}

def handle_command(command: str, current_model: str, api_key: str) -> tuple[bool, str | None, str]:
    """Handle CLI commands and return (should_continue, model_name, api_key)"""
    cmd = command.lower()
    
    if cmd == 'clear':
        return False, None, api_key
    elif cmd == '/models':
        print("\nFetching available models...")
        models = fetch_available_models()
        display_models(models, current_model)
        return True, None, api_key
    elif command.startswith('/switch '):
        model = command.split(' ')[1].strip()
        if model not in AVAILABLE_MODELS:
            print(f"\n❌ Invalid model. Available models:")
            for m in AVAILABLE_MODELS:
                print(f"  - {m}")
            return True, None, api_key
        return True, model, api_key
    elif command.startswith('/api_key '):
        new_api_key = command.split(' ', 1)[1].strip()
        if not new_api_key:
            print("\n❌ API key cannot be empty")
            return True, None, api_key
        save_api_key_config(new_api_key, True)
        print(f"\n📌 Custom API key set: {new_api_key[:5]}... (first 5 chars shown)")
        return True, None, new_api_key
    elif cmd == '/help':
        print("\nAvailable Commands:")
        print("  /api_key <key>  - Set a custom API key for Gemini API")
        print("  /help           - Show this help message")
        print("  /models         - List all available models")
        print("  /switch <model> - Switch to a different model")
        print("  clear           - Exit the application")
        print("\nAvailable Models:")
        for model in AVAILABLE_MODELS:
            print(f"  - /switch {model}")
        return True, None, api_key
    return True, None, api_key

def interactive_mode():
    api_key, is_custom = load_api_key_config()
    
    clear_screen()
    print("^.^ Friday CLI")
    if not is_custom:
        print("Using default API key. Set your own with /api_key <your_key>")
        print("Type /help for available commands")
    else:
        print(f"Using custom API key: {api_key[:5]}... (first 5 chars shown)")
    print("─" * 50)
    
    current_model = DEFAULT_MODEL
    
    try:
        while True:
            prompt = f"\n^_^Your question ({current_model}): "
            question = input(prompt).strip()
            
            if question.lower() == 'clear':
                print("\nGoodbye! 👋")
                break
            elif question.startswith('/'):
                should_continue, new_model, api_key = handle_command(question, current_model, api_key)
                if not should_continue:
                    print("\nGoodbye! 👋")
                    break
                if new_model:
                    current_model = new_model
                    print(f"\n📌 Switched to model: {current_model}")
            elif question:
                ask_question(question, current_model, api_key)
                
    except KeyboardInterrupt:
        print("\nGoodbye! 👋")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CLI tool to interact with AI API")
    parser.add_argument("--question", "-q", help="Ask a single question and exit")
    parser.add_argument("--model", "-m", default=DEFAULT_MODEL, choices=AVAILABLE_MODELS,
                        help="Specify the AI model to use (default: gemini-2.0-flash)")
    
    args = parser.parse_args()
    
    api_key, _ = load_api_key_config()
    
    if args.question:
        ask_question(args.question, args.model, api_key)
    else:
        interactive_mode()


# import requests
# import argparse
# import json
# import os
# from typing import Dict, Any

# # Available AI Models (matches Flask API)
# AVAILABLE_MODELS = [
#     "gemini-2.0-flash",          # Fast response streaming model (with Google Search)
#     "gemini-2.0-flash-lite",     # Lightweight version (no search)
#     "gemini-2.0-pro-exp-02-05",  # Experimental Pro model (with Google Search)
#     "gemini-2.0-flash-thinking-exp-01-21",  # Thinking model (no search)
#     "gemini-2.0-flash-exp",      # Experimental flash model (no search)
#     "learnlm-1.5-pro-experimental",  # Learning model (no search)
#     "gemini-1.5-pro",            # Stable Gemini 1.5 (with Google Search)
#     "gemini-1.5-flash",          # Fast Gemini 1.5 (with Google Search)
#     "gemini-1.5-flash-8b"        # 8B parameter version (with Google Search)
# ]

# DEFAULT_MODEL = "gemini-2.0-flash"
# BASE_URL = "https://friday-backend.vercel.app"  # Update this if testing locally (e.g., "http://localhost:5000")

# def clear_screen():
#     os.system('clear' if os.name == 'posix' else 'cls')

# def display_models(models: Dict[str, str], current_model: str = None) -> None:
#     if not models:  # Debug check
#         print("No models data received")
#         return
        
#     print("\nAvailable Models:")
#     print("─" * 80)
#     print(f"{'Model Name':<40} {'Type':<20} {'Status':<10}")
#     print("─" * 80)
    
#     try:
#         for model_name, model_type in models.items():
#             status = "✓ Current" if model_name == current_model else "Available"
#             print(f"{model_name:<40} {model_type:<20} {status:<10}")
#     except Exception as e:
#         print(f"Error displaying model data: {e}")
#         print(f"Model data structure: {models}")
#     print("─" * 80)

# def ask_question(question: str, model: str) -> None:
#     url = f"{BASE_URL}/api/{model}"
#     headers = {'Content-Type': 'application/json'}
#     data = {'question': question}

#     try:
#         response = requests.post(url, headers=headers, json=data)
#         response.raise_for_status()
#         result = response.json()
        
#         if 'error' in result:
#             print(f"\n❌ Error: {result['error']}")
#             return
            
#         if 'response' in result:
#             formatted_response = ' '.join(result['response'].split())
#             model_name = result.get('model_used', model)  # Use endpoint model if not returned
#             print(f"\n🤖 AI Response ({model_name}): {formatted_response}")
            
#     except requests.exceptions.RequestException as e:
#         print(f"❌ Error: {e}")

# def fetch_available_models() -> Dict[str, str]:
#     url = f"{BASE_URL}/"
#     try:
#         response = requests.get(url)
#         response.raise_for_status()
#         data = response.json()
#         return data.get('available_models', {})
#     except requests.exceptions.RequestException as e:
#         print(f"❌ Error fetching models: {e}")
#         return {}

# def handle_command(command: str, current_model: str) -> tuple[bool, str | None]:
#     """Handle CLI commands and return (should_continue, model_name)"""
#     cmd = command.lower()
    
#     if cmd == 'clear':
#         return False, None
#     elif cmd == '/models':
#         print("\nFetching available models...")
#         models = fetch_available_models()
#         display_models(models, current_model)
#         return True, None
#     elif command.startswith('/switch '):
#         model = command.split(' ')[1].strip()
#         if model not in AVAILABLE_MODELS:
#             print(f"\n❌ Invalid model. Available models:")
#             for m in AVAILABLE_MODELS:
#                 print(f"  - {m}")
#             return True, None
#         return True, model
#     elif cmd == '/help':
#         print("\nAvailable Commands:")
#         print("  /help           - Show this help message")
#         print("  /models         - List all available models")
#         print("  /switch <model> - Switch to a different model")
#         print("  clear           - Exit the application")
#         print("\nAvailable Models:")
#         for model in AVAILABLE_MODELS:
#             print(f"  - /switch {model}")
#         return True, None
#     return True, None

# def interactive_mode():
#     clear_screen()
#     print("🤖 AI Chat CLI")
#     print("Type /help for available commands")
#     print("─" * 50)
    
#     current_model = DEFAULT_MODEL
    
#     try:
#         while True:
#             prompt = f"\nYour question ({current_model}): "
#             question = input(prompt).strip()
            
#             if question.lower() == 'clear':
#                 print("\nGoodbye! 👋")
#                 break
#             elif question.startswith('/'):
#                 should_continue, new_model = handle_command(question, current_model)
#                 if not should_continue:
#                     print("\nGoodbye! 👋")
#                     break
#                 if new_model:
#                     current_model = new_model
#                     print(f"\n📌 Switched to model: {current_model}")
#             elif question:
#                 ask_question(question, current_model)
                
#     except KeyboardInterrupt:
#         print("\nGoodbye! 👋")

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="CLI tool to interact with AI API")
#     parser.add_argument("--question", "-q", help="Ask a single question and exit")
#     parser.add_argument("--model", "-m", default=DEFAULT_MODEL, choices=AVAILABLE_MODELS,
#                         help="Specify the AI model to use (default: gemini-2.0-flash)")
    
#     args = parser.parse_args()
    
#     if args.question:
#         ask_question(args.question, args.model)
#     else:
#         interactive_mode()

# import requests
# import argparse
# import json
# import os
# from typing import Dict, Any

# # Available AI Models
# AVAILABLE_MODELS = [
#     "gemini-2.0-flash",          # Fast response streaming model
#     "gemini-2.0-flash-lite",     # Lightweight version
#     "gemini-2.0-pro-exp-02-05",  # Experimental Pro model
#     "gemini-2.0-flash-thinking-exp-01-21",  # Thinking model
#     "gemini-2.0-flash-exp",      # Experimental flash model
#     "learnlm-1.5-pro-experimental",  # Learning model
#     "gemini-1.5-pro",            # Stable Gemini 1.5
#     "gemini-1.5-flash",          # Fast Gemini 1.5
#     "gemini-1.5-flash-8b"        # 8B parameter version
# ]

# DEFAULT_MODEL = "gemini-2.0-flash"

# def clear_screen():
#     os.system('clear' if os.name == 'posix' else 'cls')

# def display_models(models: list, current_model: str = None) -> None:
#     if not models:  # Debug check
#         print("No models data received")
#         return
        
#     print("\nAvailable Models:")
#     print("─" * 80)
#     print(f"{'Model Name':<40} {'Type':<10} {'Status':<10}")
#     print("─" * 80)
    
#     try:
#         for model in models:
#             status = "✓ Current" if model['name'] == current_model else "Available"
#             model_type = "Chat" if model.get('is_chat') else "Stream"
#             print(f"{model['name']:<40} {model_type:<10} {status:<10}")
#     except KeyError as e:
#         print(f"Error displaying model data: {e}")
#         print(f"Model data structure: {models}")
#     print("─" * 80)

# def ask_question(question: str, model: str = None) -> None:
#     url = 'https://friday-backend.vercel.app/api/ask'
#     headers = {'Content-Type': 'application/json'}
#     data = {'question': question}
#     if model:
#         data['model'] = model

#     try:
#         response = requests.post(url, headers=headers, json=data)
#         response.raise_for_status()
#         result = response.json()
        
#         if 'error' in result:
#             print(f"\n❌ Error: {result['error']}")
#             return
            
#         if 'response' in result:
#             formatted_response = ' '.join(result['response'].split())
#             model_name = result.get('model_used', DEFAULT_MODEL)
#             print(f"\n🤖 AI Response ({model_name}): {formatted_response}")
            
#     except requests.exceptions.RequestException as e:
#         print(f"❌ Error: {e}")

# def handle_command(command: str) -> tuple[bool, str | None]:
#     """Handle CLI commands and return (should_continue, model_name)"""
#     cmd = command.lower()
    
#     if cmd == 'clear':
#         return False, None
#     elif cmd == '/models':
#         print("\nFetching available models...")
#         ask_question("", None)
#         return True, None
#     elif command.startswith('/switch '):
#         model = command.split(' ')[1].strip()
#         if model not in AVAILABLE_MODELS:
#             print(f"\n❌ Invalid model. Available models:")
#             for m in AVAILABLE_MODELS:
#                 print(f"  - {m}")
#             return True, None
#         return True, model
#     elif cmd == '/help':
#         print("\nAvailable Commands:")
#         print("  /help           - Show this help message")
#         print("  /models         - List all available models")
#         print("  <model> - Switch to a different model")
#         print("  clear           - Exit the application")
#         print("\nAvailable Models:")
#         for model in AVAILABLE_MODELS:
#             print(f"  - /switch {model}")
#         return True, None
#     return True, None

# def interactive_mode():
#     clear_screen()
#     print("🤖 AI Chat CLI")
#     print("Type /help for available commands")
#     print("─" * 50)
    
#     current_model = DEFAULT_MODEL
    
#     try:
#         while True:
#             question = input("\nYour question: ").strip()
            
#             if question.lower() == 'clear':
#                 print("\nGoodbye! 👋")
#                 break
#             elif question.startswith('/'):
#                 should_continue, new_model = handle_command(question)
#                 if not should_continue:
#                     print("\nGoodbye! 👋")
#                     break
#                 if new_model:
#                     current_model = new_model
#                     print(f"\n📌 Switched to model: {current_model}")
#             elif question:
#                 ask_question(question, current_model)
                
#     except KeyboardInterrupt:
#         print("\nGoodbye! 👋")

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="CLI tool to interact with AI API")
#     parser.add_argument("--question", "-q", help="Ask a single question and exit")
#     parser.add_argument("--model", "-m", help="Specify the AI model to use")
    
#     args = parser.parse_args()
    
#     if args.question:
#         ask_question(args.question, args.model)
#     else:
#         interactive_mode()