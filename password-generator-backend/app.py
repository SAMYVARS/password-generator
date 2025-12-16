from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import hashlib
import requests

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html', title='Accueil')

@app.route('/hello')
def hello():
    return '<h1>Bonjour le monde !</h1>'

@app.route('/user/<name>')
def user(name):
    return f'<h1>Bonjour, {name} !</h1>'

@app.route('/api/check-password', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data.get('password')
    
    if not password:
        return jsonify({'error': 'Le mot de passe est requis'}), 400

    sha1_password = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]

    url = f'https://api.pwnedpasswords.com/range/{prefix}'
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        return jsonify({'error': 'Échec de la connexion à l\'API externe'}), 500

    hashes = (line.split(':') for line in response.text.splitlines())
    count = 0
    for h, c in hashes:
        if h == suffix:
            count = int(c)
            break

    is_pwned = count > 0
    
    return jsonify({
        'pwned': is_pwned,
        'count': count,
        'message': f'Ce mot de passe a été vu {count} fois auparavant.' if is_pwned else 'Ce mot de passe n\'a pas été trouvé dans la base de données.'
    })

@app.route('/api/generate-ai-password', methods=['POST'])
def generate_ai_password():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Le prompt est requis'}), 400

    ollama_url = "http://localhost:11434/api/generate"
    
    system_prompt = "Tu es un générateur de mots de passe créatif. Génère un mot de passe qui est thématiquement lié à l'entrée de l'utilisateur. Il doit être sécurisé (mélange de caractères, chiffres, symboles) mais clairement inspiré par le prompt. Par exemple, si l'entrée est 'pomme', propose quelque chose comme 'P0mm3_R0ug3!'. Affiche UNIQUEMENT le mot de passe, aucun autre texte, aucune explication, pas de markdown."
    
    payload = {
        "model": "llama3.2",
        "prompt": f"{system_prompt}\n\nUser request: {prompt}",
        "stream": False
    }

    try:
        response = requests.post(ollama_url, json=payload)
        response.raise_for_status()
        result = response.json()
        generated_password = result.get('response', '').strip()
        
        return jsonify({'password': generated_password})
    except requests.RequestException as e:
        print(f"Error calling Ollama: {e}")
        return jsonify({'error': 'Le service Ollama n\'est pas accessible. Veuillez vous assurer qu\'Ollama est en cours d\'exécution.'}), 503

if __name__ == '__main__':
    app.run(debug=True)
