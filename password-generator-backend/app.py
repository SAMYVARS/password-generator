from flask import Flask, request, session, jsonify
from flask_cors import CORS
import sqlite3
import hashlib

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre_cle_secrete_ici_change_en_production'

CORS(app,
     origins=["http://localhost:4200", "http://127.0.0.1:4200"],
     supports_credentials=True,
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "DELETE", "OPTIONS"])

DATABASE = 'passwords.db'

# Fonction pour se connecter à la base de données
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialisation de la base de données
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')

    # Table des mots de passe sauvegardés
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_passwords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()

init_db()


@app.route('/')
def index():
    return jsonify({
        'message': 'Password Generator API',
        'status': 'running',
        'endpoints': ['/api/login', '/api/register', '/api/logout', '/api/check-auth', '/api/passwords']
    })


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Identifiant et mot de passe requis'}), 400

    # Hasher le mot de passe en SHA256
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, username FROM users WHERE username = ? AND password_hash = ?',
                  (username, password_hash))
    user = cursor.fetchone()
    conn.close()

    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({
            'success': True,
            'message': 'Connexion réussie',
            'user': {'id': user['id'], 'username': user['username']}
        })

    return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Identifiant et mot de passe requis'}), 400

    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Le pseudo doit contenir au moins 3 caractères'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Le mot de passe doit contenir au moins 6 caractères'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Vérifier si l'utilisateur existe déjà
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'Ce pseudo est déjà utilisé'}), 400

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    cursor.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)',
                  (username, password_hash))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Compte créé avec succès',
        'user': {'id': user_id, 'username': username}
    })


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'success': True, 'message': 'Déconnexion réussie'})


@app.route('/api/check-auth')
def check_auth():
    if 'user_id' in session:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, username FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({'authenticated': True, 'user': {'id': user['id'], 'username': user['username']}})

    return jsonify({'authenticated': False})


@app.route('/api/passwords', methods=['GET', 'POST'])
def manage_passwords():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Non authentifié'}), 401

    if request.method == 'POST':
        data = request.get_json()
        service_name = data.get('service_name')
        password = data.get('password')

        if not service_name or not password:
            return jsonify({'success': False, 'message': 'Nom du service et mot de passe requis'}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO saved_passwords (user_id, service_name, password) VALUES (?, ?, ?)',
            (session['user_id'], service_name, password)
        )
        conn.commit()
        password_id = cursor.lastrowid

        cursor.execute('SELECT * FROM saved_passwords WHERE id = ?', (password_id,))
        saved_password = cursor.fetchone()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Mot de passe sauvegardé',
            'password': {
                'id': saved_password['id'],
                'service_name': saved_password['service_name'],
                'password': saved_password['password'],
                'created_at': saved_password['created_at']
            }
        })

    # GET
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM saved_passwords WHERE user_id = ? ORDER BY created_at DESC',
        (session['user_id'],)
    )
    passwords = cursor.fetchall()
    conn.close()

    passwords_list = [{
        'id': p['id'],
        'service_name': p['service_name'],
        'password': p['password'],
        'created_at': p['created_at']
    } for p in passwords]

    return jsonify({'success': True, 'passwords': passwords_list})


@app.route('/api/passwords/<int:password_id>', methods=['DELETE'])
def delete_password(password_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Non authentifié'}), 401

    conn = get_db()
    cursor = conn.cursor()

    # Vérifier que le mot de passe appartient à l'utilisateur
    cursor.execute('SELECT id FROM saved_passwords WHERE id = ? AND user_id = ?',
                  (password_id, session['user_id']))
    password = cursor.fetchone()

    if not password:
        conn.close()
        return jsonify({'success': False, 'message': 'Mot de passe non trouvé'}), 404

    cursor.execute('DELETE FROM saved_passwords WHERE id = ?', (password_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Mot de passe supprimé'})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
