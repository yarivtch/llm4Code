from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from prompts import get_system_prompt, MODEL_PROMPTS


app = Flask(__name__)
CORS(app)

class OllamaCodeAssistant:
    AVAILABLE_MODELS = {
        "aya": "aya",
        "llama3.2": "llama 3.2",
        "codellama": "code llama",
        "mistral": "mistral-7b",
        #"qwen2": "מודל לניתוח קוד"
    }

    def __init__(self, model: str = "aya", host: str = "http://localhost:11434"):
        if model not in self.AVAILABLE_MODELS:
            raise ValueError(f"Model {model} not in available models: {list(self.AVAILABLE_MODELS.keys())}")
            
        self.model = model
        self.host = host
        self.api_endpoint = f"{host}/api/generate"
        self.context = []
        self.system_prompt = get_system_prompt(model)

    def send_message(self, message: str, temperature: float = 0.7):
        try:
            prompt = self._prepare_prompt(message)
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": True,  # 
                "options": {
                    "temperature": temperature,
                    "num_predict": 1024,
                    "num_ctx": 512 ,         #256   חלון ההקשר
                    "num_thread": 8,        #  מספר התהליכונים
                    "top_k": 20,           #  מספר המילים הבאות לבחירה
                    "top_p": 0.7           #  הסתברות הבחירה
                }
            }
            
            response = requests.post(self.api_endpoint, json=payload, stream=True)
            response.raise_for_status()
            
            full_response = ""
            for line in response.iter_lines(): 
                if line:
                    chunk = json.loads(line.decode())
                    if "response" in chunk:
                        full_response += chunk["response"]
            
            self.context.append({"role": "user", "content": message})
            self.context.append({"role": "assistant", "content": full_response})
            return full_response
            
        except Exception as e:
            return str(e)


    def _prepare_prompt(self, message: str) -> str:
        prompt_parts = [self.system_prompt]
        
        for msg in self.context[-4:]:
            role = "Human: " if msg["role"] == "user" else "Assistant: "
            prompt_parts.append(f"{role}{msg['content']}")
        
        prompt_parts.append(f"Human: {message}")
        prompt_parts.append("Assistant: אסביר את הקוד בצורה טכנית וממוקדת:")
        
        return "\n".join(prompt_parts)

    def clear_context(self):
        self.context = []

    @classmethod
    def get_available_models(cls):
        return cls.AVAILABLE_MODELS

# נשמור instance אחד לכל מודל
assistants = {}

@app.route('/models', methods=['GET'])
def get_models():
    return jsonify(OllamaCodeAssistant.get_available_models())

@app.route('/send', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    model_name = data.get('model', 'aya')
    temperature = float(data.get('temperature', 0.7))
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
        
    if model_name not in OllamaCodeAssistant.AVAILABLE_MODELS:
        return jsonify({'error': f'Model {model_name} not available'}), 400
        
    if model_name not in assistants:
        assistants[model_name] = OllamaCodeAssistant(model=model_name)
    
    response = assistants[model_name].send_message(message, temperature)
    return jsonify({'response': response})

@app.route('/clear', methods=['POST'])
def clear_context():
    data = request.json
    model_name = data.get('model', 'aya')
    
    if model_name in assistants:
        assistants[model_name].clear_context()
    
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)