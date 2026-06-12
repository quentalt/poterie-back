# User Manager — Node.js + TypeScript + Neon DB

API REST de gestion d'utilisateurs avec authentification JWT, PostgreSQL via [Neon DB](https://neon.tech).

---

## Stack technique

| Couche       | Techno                        |
|--------------|-------------------------------|
| Runtime      | Node.js + TypeScript          |
| Framework    | Express 4                     |
| Base de données | Neon DB (PostgreSQL serverless) |
| Auth         | JWT + bcrypt                  |
| Validation   | Zod                           |

---

## Structure du projet

```
src/
├── config/
│   └── database.ts          # Connexion Neon DB
├── types/
│   └── user.types.ts        # Interfaces TypeScript
├── repositories/
│   └── user.repository.ts   # Requêtes SQL
├── services/
│   └── user.service.ts      # Logique métier
├── controllers/
│   └── user.controller.ts   # Handlers HTTP
├── middleware/
│   ├── auth.middleware.ts   # JWT + rôles
│   └── validation.middleware.ts  # Validation Zod
├── routes/
│   └── index.ts             # Définition des routes
└── index.ts                 # Point d'entrée
scripts/
├── migrate.ts               # Création des tables
└── seed.ts                  # Données de test
```

---

## Installation

```bash
npm install
cp .env.example .env
# → Renseignez DATABASE_URL avec l'URL Neon (console.neon.tech)
```

### Obtenir votre URL Neon DB
1. Créez un compte sur [console.neon.tech](https://console.neon.tech)
2. Créez un projet
3. Copiez la **Connection string** dans `.env`

---

## Commandes

```bash
# Créer les tables en base
npm run migrate

# Insérer des données de test
npm run seed

# Démarrer en développement (hot reload)
npm run dev

# Build production
npm run build && npm start
```

---

## API Endpoints

### Auth (public)

| Méthode | Route              | Description           |
|---------|--------------------|-----------------------|
| POST    | /api/v1/auth/register | Créer un compte    |
| POST    | /api/v1/auth/login    | Se connecter       |

### Utilisateur connecté

| Méthode | Route              | Description           |
|---------|--------------------|-----------------------|
| GET     | /api/v1/users/me   | Profil connecté       |
| PATCH   | /api/v1/users/:id  | Modifier son profil   |

### Admin uniquement

| Méthode | Route              | Description           |
|---------|--------------------|-----------------------|
| GET     | /api/v1/users      | Liste paginée         |
| GET     | /api/v1/users/:id  | Détail utilisateur    |
| DELETE  | /api/v1/users/:id  | Supprimer             |

---

## Exemples de requêtes

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "quentin@example.com",
  "username": "quentin_dev",
  "password": "MonMdp123!"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "quentin@example.com",
  "password": "MonMdp123!"
}
```

### Requête authentifiée
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

### Liste avec pagination (admin)
```http
GET /api/v1/users?page=1&limit=20
Authorization: Bearer <token_admin>
```

---

## Schéma de base de données

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          user_role    NOT NULL DEFAULT 'user',  -- 'admin' | 'user' | 'moderator'
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

---

## Règles de validation

- **email** : format valide
- **username** : 3–30 chars, `[a-zA-Z0-9_-]` uniquement
- **password** : 8+ chars, 1 majuscule, 1 chiffre
