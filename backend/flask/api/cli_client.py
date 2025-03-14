import requests
import argparse
import json
import os
from typing import Dict, Any

# Available AI Models
AVAILABLE_MODELS = [
    "gemini-2.0-flash",          # Fast response streaming model
    "gemini-2.0-flash-lite",     # Lightweight version
    "gemini-2.0-pro-exp-02-05",  # Experimental Pro model
    "gemini-2.0-flash-thinking-exp-01-21",  # Thinking model
    "gemini-2.0-flash-exp",      # Experimental flash model
    "learnlm-1.5-pro-experimental",  # Learning model
    "gemini-1.5-pro",            # Stable Gemini 1.5
    "gemini-1.5-flash",          # Fast Gemini 1.5
    "gemini-1.5-flash-8b"        # 8B parameter version
]

DEFAULT_MODEL = "gemini-2.0-flash"

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def display_models(models: list, current_model: str = None) -> None:
    if not models:  # Debug check
        print("No models data received")
        return
        
    print("\nAvailable Models:")
    print("─" * 80)
    print(f"{'Model Name':<40} {'Type':<10} {'Status':<10}")
    print("─" * 80)
    
    try:
        for model in models:
            status = "✓ Current" if model['name'] == current_model else "Available"
            model_type = "Chat" if model.get('is_chat') else "Stream"
            print(f"{model['name']:<40} {model_type:<10} {status:<10}")
    except KeyError as e:
        print(f"Error displaying model data: {e}")
        print(f"Model data structure: {models}")
    print("─" * 80)

def ask_question(question: str, model: str = None) -> None:
    url = 'http://localhost:5000/api/ask'
    headers = {'Content-Type': 'application/json'}
    data = {'question': question}
    if model:
        data['model'] = model

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        if 'error' in result:
            print(f"\n❌ Error: {result['error']}")
            return
            
        if 'response' in result:
            formatted_response = ' '.join(result['response'].split())
            model_name = result.get('model_used', DEFAULT_MODEL)
            print(f"\n🤖 AI Response ({model_name}): {formatted_response}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")

def handle_command(command: str) -> tuple[bool, str | None]:
    """Handle CLI commands and return (should_continue, model_name)"""
    cmd = command.lower()
    
    if cmd == 'clear':
        return False, None
    elif cmd == '/models':
        print("\nFetching available models...")
        ask_question("", None)
        return True, None
    elif command.startswith('/switch '):
        model = command.split(' ')[1].strip()
        if model not in AVAILABLE_MODELS:
            print(f"\n❌ Invalid model. Available models:")
            for m in AVAILABLE_MODELS:
                print(f"  - {m}")
            return True, None
        return True, model
    elif cmd == '/help':
        print("\nAvailable Commands:")
        print("  /help           - Show this help message")
        print("  /models         - List all available models")
        print("  <model> - Switch to a different model")
        print("  clear           - Exit the application")
        print("\nAvailable Models:")
        for model in AVAILABLE_MODELS:
            print(f"  - /switch {model}")
        return True, None
    return True, None

def interactive_mode():
    clear_screen()
    print("🤖 AI Chat CLI")
    print("Type /help for available commands")
    print("─" * 50)
    
    current_model = DEFAULT_MODEL
    
    try:
        while True:
            question = input("\nYour question: ").strip()
            
            if question.lower() == 'clear':
                print("\nGoodbye! 👋")
                break
            elif question.startswith('/'):
                should_continue, new_model = handle_command(question)
                if not should_continue:
                    print("\nGoodbye! 👋")
                    break
                if new_model:
                    current_model = new_model
                    print(f"\n📌 Switched to model: {current_model}")
            elif question:
                ask_question(question, current_model)
                
    except KeyboardInterrupt:
        print("\nGoodbye! 👋")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CLI tool to interact with AI API")
    parser.add_argument("--question", "-q", help="Ask a single question and exit")
    parser.add_argument("--model", "-m", help="Specify the AI model to use")
    
    args = parser.parse_args()
    
    if args.question:
        ask_question(args.question, args.model)
    else:
        interactive_mode()