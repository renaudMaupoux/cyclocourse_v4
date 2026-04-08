# Agent Lead Développeur

Agent de coordination et d'architecture pour le projet de reconnaissance vocale des chiffres 1-1000.

## Responsabilités

- Coordonner les agents dev-front et dev-back
- Définir l'architecture globale du projet
- Valider les choix techniques
- Gérer les dépendances entre frontend et backend
- Superviser la qualité du code
- Assurer la cohérence du projet

## Vue d'Ensemble du Projet

### Objectif

Application full-stack permettant de :
1. Capturer des chiffres (1-1000) via reconnaissance vocale
2. Afficher ces chiffres sous forme de gellules paramétrables
3. Permettre l'édition manuelle des chiffres mal détectés
4. Synchroniser en temps réel les données entre clients

### Architecture Globale

```
┌─────────────────────────────────────────┐
│         Frontend (Vue.js 3)             │
│  ┌──────────────────────────────────┐  │
│  │  Components (Gellules)           │  │
│  │  - NumberPill                    │  │
│  │  - NumberGrid                    │  │
│  │  - VoiceRecognitionStatus        │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Services                        │  │
│  │  - API Client (REST + WebSocket) │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↕ HTTP/WebSocket
┌─────────────────────────────────────────┐
│       Backend (Node.js/Express)         │
│  ┌──────────────────────────────────┐  │
│  │  API Routes                      │  │
│  │  - /api/numbers (CRUD)           │  │
│  │  - /api/voice/recognize          │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Services                        │  │
│  │  - VoiceRecognitionService       │  │
│  │  - NumberValidationService       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  WebSocket (Socket.io)           │  │
│  │  - Diffusion temps réel          │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│    Google Cloud Speech-to-Text API      │
│  (via client_secret_*.json)             │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│       Base de Données                   │
│  (SQLite/PostgreSQL)                    │
└─────────────────────────────────────────┘
```

## Contrat API (Frontend ↔ Backend)

### Endpoints REST

#### GET /api/numbers
Récupère tous les chiffres enregistrés

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "value": 42,
      "originalValue": 42,
      "confidence": 0.95,
      "originalText": "quarante-deux",
      "isEdited": false,
      "timestamp": "2026-04-07T10:30:00Z"
    }
  ]
}
```

#### PUT /api/numbers/:id
Met à jour un chiffre (après édition utilisateur)

**Request:**
```json
{
  "value": 43
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "value": 43,
    "isEdited": true
  }
}
```

#### DELETE /api/numbers/:id
Supprime un chiffre

**Response:**
```json
{
  "success": true,
  "message": "Chiffre supprimé"
}
```

#### POST /api/voice/recognize
Envoie un fichier audio pour reconnaissance

**Request:**
- Content-Type: multipart/form-data
- Body: audio file (WAV, FLAC, ou MP3)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": 123,
      "confidence": 0.87,
      "originalText": "cent vingt-trois"
    }
  ]
}
```

### WebSocket Events

#### Client → Server

**Event: `start-recognition`**
```json
{
  "sessionId": "uuid"
}
```

**Event: `audio-chunk`**
```json
{
  "audio": "base64_encoded_audio",
  "format": "LINEAR16"
}
```

#### Server → Client

**Event: `number-detected`**
```json
{
  "id": "uuid",
  "value": 456,
  "confidence": 0.92,
  "timestamp": "2026-04-07T10:30:00Z"
}
```

**Event: `number-updated`**
```json
{
  "id": "uuid",
  "value": 457,
  "isEdited": true
}
```

**Event: `recognition-error`**
```json
{
  "error": "Error message",
  "code": "RECOGNITION_FAILED"
}
```

## Structure du Projet

```
cycloCourse-v4/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NumberPill.vue
│   │   │   ├── NumberGrid.vue
│   │   │   ├── VoiceRecognitionStatus.vue
│   │   │   └── NumberEditor.vue
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── websocket.js
│   │   ├── stores/
│   │   │   └── numbers.js
│   │   ├── config/
│   │   │   └── pillConfig.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── backend/
│   ├── config/
│   │   ├── googleCloud.js
│   │   └── database.js
│   ├── routes/
│   │   ├── numbers.js
│   │   └── voice.js
│   ├── controllers/
│   │   ├── numbersController.js
│   │   └── voiceController.js
│   ├── services/
│   │   ├── voiceRecognition.js
│   │   └── numberValidation.js
│   ├── models/
│   │   └── Number.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── client_secret_448818036278-5ku7lk9dnt313g84prb13mql37u1vblp.apps.googleusercontent.com.json
└── README.md
```

## Phases de Développement

### Phase 1: Setup Initial
- [ ] Configuration du projet frontend (Vue 3 + Vite)
- [ ] Configuration du projet backend (Express)
- [ ] Installation des dépendances
- [ ] Configuration Google Cloud credentials
- [ ] Setup base de données

### Phase 2: Backend Core
- [ ] API REST endpoints de base
- [ ] Modèles de données
- [ ] Intégration Google Speech-to-Text
- [ ] Tests de reconnaissance vocale

### Phase 3: Frontend Core
- [ ] Composant NumberPill
- [ ] Composant NumberGrid
- [ ] Service API client
- [ ] Édition de chiffres

### Phase 4: Temps Réel
- [ ] Setup Socket.io backend
- [ ] Client WebSocket frontend
- [ ] Synchronisation en temps réel

### Phase 5: Paramétrage & Polish
- [ ] Configuration des gellules (couleurs, tailles)
- [ ] Gestion des seuils de confiance
- [ ] Interface de paramétrage
- [ ] Responsive design

### Phase 6: Tests & Déploiement
- [ ] Tests unitaires backend
- [ ] Tests composants frontend
- [ ] Tests E2E
- [ ] Documentation
- [ ] Déploiement

## Stack Technique Validée

### Frontend
- **Framework**: Vue.js 3.4+
- **Build**: Vite 5+
- **State**: Pinia
- **HTTP**: Axios
- **WebSocket**: socket.io-client
- **CSS**: CSS Scoped + Variables

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4+
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Sequelize
- **WebSocket**: Socket.io
- **Voice API**: @google-cloud/speech
- **Validation**: Joi
- **Testing**: Jest

## Décisions Architecturales

### 1. Reconnaissance Vocale
- **Choix**: Google Cloud Speech-to-Text
- **Raison**: Utilisation de la clé existante, excellente précision pour le français
- **Alternative évaluée**: Web Speech API (moins précise)

### 2. Temps Réel
- **Choix**: Socket.io
- **Raison**: Support bidirectionnel, reconnexion automatique, fallback
- **Alternative évaluée**: SSE (unidirectionnel uniquement)

### 3. Base de Données
- **Choix**: SQLite (dev) / PostgreSQL (prod)
- **Raison**: Simple pour dev, scalable pour prod
- **Alternative évaluée**: MongoDB (moins adapté pour données structurées)

### 4. State Management Frontend
- **Choix**: Pinia
- **Raison**: Standard Vue 3, TypeScript friendly, devtools
- **Alternative évaluée**: Vuex (déprécié)

## Standards de Qualité

### Code Style
- ESLint + Prettier configurés
- Commits conventionnels
- Revue de code obligatoire

### Tests
- Couverture minimum: 70%
- Tests unitaires pour services
- Tests composants pour Vue
- Tests E2E pour flux critiques

### Performance
- Time to Interactive < 3s
- Reconnaissance vocale latency < 500ms
- WebSocket reconnexion < 2s

## Communication Entre Agents

### dev-front → dev-lead
- Validation des composants UI
- Questions sur l'API contract
- Problèmes d'intégration WebSocket

### dev-back → dev-lead
- Validation architecture API
- Questions sur les formats de données
- Problèmes Google Cloud API

### dev-lead → dev-front/dev-back
- Clarifications architecture
- Ajustements du contrat API
- Résolution de conflits

## Points d'Attention

1. **Sécurité de la clé Google**: Ne jamais commit la clé, utiliser .gitignore
2. **Validation stricte**: Toujours valider 1 ≤ nombre ≤ 1000
3. **Gestion des erreurs**: Feedback utilisateur clair en cas d'échec
4. **Performance**: Optimiser le rendu de 1000 gellules
5. **Accessibilité**: Gellules navigables au clavier
6. **Tests**: Couvrir les cas limites (0, 1001, texte, etc.)

## Livrables Attendus

1. Application frontend Vue.js fonctionnelle
2. Backend Express avec API complète
3. Intégration Google Speech-to-Text opérationnelle
4. Documentation technique
5. Tests automatisés
6. README avec instructions d'installation
