# Password Generator - Projet Complet

Application de génération de mots de passe avec authentification.

## 📦 Structure

```
password-generator/
├── password-generator-backend/    # API Flask (port 5001)
│   ├── app.py                     # Code principal
│   ├── requirements.txt           # Dépendances Python
│   └── passwords.db              # Base SQLite (créée auto)
│
└── password-generator-frontend/   # Angular (port 4200)
    ├── src/                       # Code source
    ├── proxy.conf.json           # Config proxy API
    └── package.json              # Dépendances npm
```

## 🚀 Installation

### Backend
```bash
cd password-generator-backend
pip3 install -r requirements.txt
```

### Frontend
```bash
cd password-generator-frontend
npm install
```

## ▶️ Lancement

### Terminal 1 - Backend
```bash
cd password-generator-backend
python3 app.py
```

✅ Doit afficher : `Running on http://127.0.0.1:5001`

### Terminal 2 - Frontend
```bash
cd password-generator-frontend
npm start
```

✅ Doit afficher : `Local: http://localhost:4200/`

## 🌐 Accès

Ouvrir dans le navigateur : **http://localhost:4200**

## 🔑 Fonctionnalités

- ✅ Génération de mots de passe personnalisables
- ✅ Authentification (login/register)
- ✅ Sauvegarde des mots de passe générés
- ✅ Base de données SQLite locale
- ✅ Hashage SHA256 des mots de passe utilisateurs

## 🛠️ Technologies

- **Backend** : Flask, SQLite, Flask-CORS
- **Frontend** : Angular 20, PrimeNG
- **Base de données** : SQLite (local)

## 📝 Routes API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/login` | POST | Connexion |
| `/api/register` | POST | Inscription |
| `/api/logout` | POST | Déconnexion |
| `/api/check-auth` | GET | Vérifier auth |
| `/api/passwords` | GET/POST | Gérer mots de passe |
| `/api/passwords/<id>` | DELETE | Supprimer |

## ⚠️ Notes

- Le backend utilise le **port 5001** (pas 5000, conflit AirPlay sur macOS)
- Le proxy Angular redirige `/api/*` vers `http://localhost:5001/api/*`
- La base `passwords.db` est créée automatiquement au premier lancement

