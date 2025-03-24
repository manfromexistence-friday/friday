from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime, date

@dataclass
class ModelConfig:
    name: str
    description: str
    is_chat_model: bool
    current_requests: int = 0

class ModelManager:
    MODELS = [
        ("gemini-2.0-flash", "Fast response streaming model", False),
        ("gemini-2.0-flash-lite", "Lightweight version of Gemini 2.0 Flash", False),
        ("gemini-2.0-pro-exp-02-05", "Experimental Pro model with enhanced capabilities", False),
        ("gemini-2.0-flash-thinking-exp-01-21", "Experimental thinking model with safety settings", False),
        ("gemini-2.0-flash-exp", "Experimental flash model with image capabilities", False),
        ("learnlm-1.5-pro-experimental", "Experimental learning model", True),
        ("gemini-1.5-pro", "Stable Gemini 1.5 Pro model", True),
        ("gemini-1.5-flash", "Fast response Gemini 1.5 model", True),
        ("gemini-1.5-flash-8b", "8B parameter version of Gemini 1.5 Flash", True),
    ]

    def __init__(self):
        self.models: Dict[str, ModelConfig] = {
            name: ModelConfig(name=name, description=desc, is_chat_model=is_chat)
            for name, desc, is_chat in self.MODELS
        }
        self.current_model = "gemini-2.0-flash"
        self.usage_file = "model_usage.json"
        self.load_usage_data()
        self._reset_daily_usage_if_needed()

    def switch_model(self, model_name: str) -> bool:
        if (model_name in self.models):
            self.current_model = model_name
            return True
        return False

    def get_current_model(self) -> ModelConfig:
        return self.models[self.current_model]

    def get_available_models(self) -> List[dict]:
        return [
            {
                "name": model.name,
                "available": True,
                "requests_left": 60,  # Hardcoded limit
                "description": model.description,
                "is_chat": model.is_chat_model
            }
            for model in self.models.values()
        ]

    def auto_switch_model(self) -> Optional[str]:
        available_models = [
            (name, model) for name, model in self.models.items()
            if model.current_requests < 60  # Hardcoded limit
        ]
        
        if not available_models:
            return None
            
        # Sort by least recently used and lowest usage
        available_models.sort(key=lambda x: (
            x[1].last_used or datetime.min,
            x[1].current_requests
        ))
        
        self.current_model = available_models[0][0]
        return self.current_model

    def _reset_daily_usage_if_needed(self):
        today = date.today().isoformat()
        try:
            with open("last_reset.txt", "r") as f:
                last_reset = f.read().strip()
        except FileNotFoundError:
            last_reset = ""

        if last_reset != today:
            for model in self.models.values():
                model.current_requests = 0
            
            with open("last_reset.txt", "w") as f:
                f.write(today)
            
            self.save_usage_data()

    # ... rest of the ModelManager class remains the same ...