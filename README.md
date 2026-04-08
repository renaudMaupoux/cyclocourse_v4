# 🚴 CycloCourse v4 - Reconnaissance Vocale

Application full-stack de reconnaissance vocale permettant de détecter, afficher et éditer des chiffres de 1 à 1000 sous forme de gellules paramétrables.

## 📋 Vue d'ensemble

- **Frontend**: Vue.js 3 + Vite + Pinia
- **Backend**: Node.js + Express + Socket.io
- **Reconnaissance vocale**: Web Speech API dans le navigateur ; le backend extrait les chiffres du texte reçu
- **Base de données**: SQLite (dev) / PostgreSQL (prod)
- **Communication temps réel**: WebSocket (Socket.io)

## 🏗️ Architecture

```
Navigateur (Web Speech)  →  Backend (Express)  →  extraction 1–1000 + SQLite
        ↕                           WebSocket (sync)
```

### Fonctionnalités

✅ Reconnaissance vocale de chiffres (1-1000) en français
✅ Affichage sous forme de gellules colorées selon la confiance
✅ Édition manuelle des chiffres mal détectés
✅ Synchronisation temps réel entre clients (WebSocket)
✅ Validation stricte des données (1-1000)
✅ Interface responsive et accessible

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### 1. Installation du Backend

```bash
cd backend
npm install
```

Configuration : copier `.env.example` vers `.env` si besoin (port, URL du frontend).

### 2. Installation du Frontend

```bash
cd frontend
npm install
```

## 🎬 Démarrage

### Démarrer le Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur: `http://localhost:3000`

### Démarrer le Frontend

```bash
cd frontend
npm run dev
```

L'application démarre sur: `http://localhost:5173`

## 📡 API Endpoints

### REST API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/numbers` | Récupérer tous les chiffres |
| GET | `/api/numbers/:id` | Récupérer un chiffre |
| PUT | `/api/numbers/:id` | Mettre à jour un chiffre |
| DELETE | `/api/numbers/:id` | Supprimer un chiffre |
| POST | `/api/numbers/reset` | Supprimer tous les chiffres |
| POST | `/api/voice/recognize-text` | Texte issu du Web Speech → extraction des chiffres |

### WebSocket Events

**Client → Server:**
- `start-recognition` - Démarrer une session
- `stop-recognition` - Arrêter la session

**Server → Client:**
- `number-detected` - Nouveau chiffre détecté
- `number-updated` - Chiffre modifié
- `number-deleted` - Chiffre supprimé
- `numbers-reset` - Réinitialisation complète

## 🎨 Composants Frontend

### NumberPill
Gellule individuelle représentant un chiffre
- Affichage coloré selon la confiance
- Édition inline (clic)
- Indicateur d'édition manuelle
- Badge de confiance

### NumberGrid
Grille affichant tous les chiffres
- Statistiques (total, confiance)
- Actions (réinitialiser)
- Layout responsive

### VoiceRecognitionStatus
Interface de reconnaissance vocale
- Upload de fichiers audio
- Statut de connexion
- Affichage des résultats

## 🎨 Configuration des Gellules

Le fichier `frontend/src/config/pillConfig.js` permet de personnaliser:
- Couleurs selon la confiance (haute/moyenne/basse)
- Seuils de confiance
- Layout de la grille
- Animations

```javascript
export const pillConfig = {
  colors: {
    high: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
    medium: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
    low: { bg: '#ffebee', border: '#f44336', text: '#c62828' }
  },
  thresholds: {
    high: 0.9,   // > 90% = haute confiance
    medium: 0.7  // 70-90% = confiance moyenne
  }
};
```

## 🔧 Utilisation des Agents Cursor

Ce projet utilise 3 agents spécialisés définis dans `.cursor/rules/agents/`:

### @dev-front
Agent Frontend Vue.js
```
@dev-front Crée le composant NumberPill avec édition inline
```

### @dev-back
Agent Backend Node.js/Express
```
@dev-back Configure la reconnaissance vocale pour les chiffres
```

### @dev-lead
Agent Lead pour coordination
```
@dev-lead Valide l'architecture de communication temps réel
```

Voir `.cursor/rules/AGENTS.md` pour plus de détails.

## 🧪 Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Structure du Projet

```
cycloCourse-v4/
├── backend/
│   ├── config/           # Configuration (base de données)
│   ├── controllers/      # Contrôleurs API
│   ├── models/           # Modèles de données
│   ├── routes/           # Routes Express
│   ├── services/         # Extraction des chiffres depuis le texte
│   ├── middleware/       # Middlewares (validation, erreurs)
│   ├── server.js         # Point d'entrée
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Composants Vue
│   │   ├── services/     # Services API
│   │   ├── stores/       # Stores Pinia
│   │   ├── config/       # Configuration
│   │   ├── App.vue       # Application principale
│   │   └── main.js       # Point d'entrée
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .cursor/
│   └── rules/
│       ├── agents/       # Agents spécialisés
│       └── AGENTS.md     # Documentation agents
│
└── README.md
```

## 🔐 Sécurité

Le fichier `.gitignore` exclut notamment `.env`, `node_modules/` et `database.sqlite`.

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifier que le port 3000 est libre

### Le frontend ne se connecte pas
- Vérifier que le backend est démarré
- Vérifier l'URL dans `.env`: `VITE_API_URL` et `VITE_WS_URL`

### Reconnaissance vocale échoue
- Utiliser **Chrome** ou **Edge** ; autoriser le **micro**
- Vérifier la console réseau (F12) pour `POST /api/voice/recognize-text`
- Consulter les logs backend

## 📝 Reconnaissance navigateur

- Langue **fr-FR** (voir `webSpeechRecognition.js`)
- Dicter des nombres ou chiffres entre **1 et 1000**

## 🎯 Phases de développement

- ✅ Phase 1: Setup initial
- ✅ Phase 2: Backend Core (API + reconnaissance vocale)
- ✅ Phase 3: Frontend Core (composants + grille)
- ✅ Phase 4: Temps réel (WebSocket)
- ✅ Phase 5: Paramétrage (configuration gellules)
- ⏳ Phase 6: Tests & Déploiement

## 📄 Licence

ISC

## 👥 Contribution

Pour contribuer, consulter les agents dans `.cursor/rules/AGENTS.md`.

## 🆘 Support

Pour toute question:
- Architecture globale → `@dev-lead`
- Frontend/UI → `@dev-front`
- Backend/API → `@dev-back`

---

Créé avec ❤️ pour la formation 2026
