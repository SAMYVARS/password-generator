# Password Generator - Backend API

Backend Flask avec base de données SQLite pour le générateur de mots de passe.

## Fonctionnalités

- **Authentification** : Login et Register avec mots de passe hashés en SHA256
- **Base de données SQLite** : Stockage local des utilisateurs et mots de passe sauvegardés
- **API REST** : Communication avec le frontend Angular

## Installation

```bash
cd password-generator-backend
pip3 install -r requirements.txt
```

## Démarrage

```bash
python3 app.py
```

Le serveur démarre sur `http://localhost:5001`

**Note :** Le port 5001 est utilisé à la place du 5000 pour éviter les conflits avec AirPlay Receiver sur macOS.

## Base de données

La base de données `passwords.db` est créée automatiquement au premier lancement.

### Tables

**users**
- `id` : Identifiant unique
- `username` : Pseudo (unique)
- `password_hash` : Mot de passe hashé en SHA256

**saved_passwords**
- `id` : Identifiant unique
- `user_id` : Référence vers l'utilisateur
- `service_name` : Nom du service
- `password` : Mot de passe sauvegardé
- `created_at` : Date de création

## Routes API

### Authentification

- `POST /api/login` : Connexion
  ```json
  {
    "username": "pseudo",
    "password": "motdepasse"
  }
  ```

- `POST /api/register` : Inscription
  ```json
  {
    "username": "pseudo",
    "password": "motdepasse"
  }
  ```

- `POST /api/logout` : Déconnexion

- `GET /api/check-auth` : Vérifier l'authentification

### Mots de passe sauvegardés

- `GET /api/passwords` : Récupérer tous les mots de passe de l'utilisateur

- `POST /api/passwords` : Sauvegarder un mot de passe
  ```json
  {
    "service_name": "Gmail",
    "password": "motdepasse"
  }
  ```

- `DELETE /api/passwords/<id>` : Supprimer un mot de passe

## Sécurité

- Les mots de passe sont hashés en SHA256
- Sessions Flask pour l'authentification
- CORS activé pour le frontend Angular (port 4200)

## Frontend

Le frontend Angular se trouve dans `password-generator-frontend`.
Il communique avec cette API via un proxy Angular qui redirige `/api/*` vers `http://localhost:5001/api/*`.

## Test de l'API

Vérifier que l'API fonctionne :
```bash
curl http://localhost:5001/
```

Devrait retourner :
```json
{
  "message": "Password Generator API",
  "status": "running",
  "endpoints": [...]
}
```

