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
        return jsonify({'error': 'Password is required'}), 400

    sha1_password = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]

    url = f'https://api.pwnedpasswords.com/range/{prefix}'
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to connect to external API'}), 500

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

if __name__ == '__main__':
    app.run(debug=True)
