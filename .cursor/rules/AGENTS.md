# Agents du Projet cycloCourse-v4

Ce fichier référence les agents spécialisés disponibles pour le développement du projet de reconnaissance vocale.

## Vue d'Ensemble du Projet

Application full-stack de reconnaissance vocale permettant d'afficher et d'éditer des chiffres de 1 à 1000 sous forme de gellules paramétrables.

**Stack**: Vue.js 3 (frontend) + Node.js/Express (backend) ; reconnaissance dans le navigateur (Web Speech), extraction des chiffres côté serveur

---

## Agents Disponibles

### 🎨 dev-front - Développeur Frontend

**Fichier**: `.cursor/rules/agents/dev-front.md`

**Spécialité**: Développement de l'interface Vue.js

**Responsabilités**:
- Composants Vue.js (gellules, grille, éditeur)
- Intégration API REST et WebSocket
- Interface utilisateur responsive et paramètrable
- Gestion de l'édition des chiffres
- Expérience utilisateur

**À invoquer pour**:
- Créer ou modifier des composants Vue
- Intégration API frontend
- Questions sur le state management
- Styles et paramétrage des gellules
- Problèmes d'interface utilisateur

**Stack**:
- Vue.js 3 (Composition API)
- **TypeScript** (vue-tsc au build, alias `@` → `src/`)
- Vite
- Pinia
- Axios
- Socket.io-client

---

### ⚙️ dev-back - Développeur Backend

**Fichier**: `.cursor/rules/agents/dev-back.md`

**Spécialité**: Développement du serveur Node.js/Express avec reconnaissance vocale

**Responsabilités**:
- API REST pour gestion des chiffres
- Route `POST /api/voice/recognize-text` (texte → extraction 1–1000)
- WebSocket pour temps réel
- Base de données et persistance

**À invoquer pour**:
- Créer ou modifier des endpoints API
- Logique d’extraction de chiffres depuis le texte (`services/voiceRecognition.js`)
- Gestion de la base de données
- WebSocket et temps réel

**Stack**:
- Node.js 18+
- **TypeScript** (`src/` → `dist/`, `npm run dev` avec `tsx`)
- Express.js
- Socket.io
- Sequelize
- SQLite/PostgreSQL

---

### 👔 dev-lead - Lead Développeur

**Fichier**: `.cursor/rules/agents/dev-lead.md`

**Spécialité**: Coordination et architecture globale

**Responsabilités**:
- Architecture du projet
- Coordination dev-front et dev-back
- Validation des choix techniques
- Contrat API (frontend ↔ backend)
- Standards de qualité
- Gestion des phases de développement

**À invoquer pour**:
- Questions d'architecture globale
- Définition du contrat API
- Résolution de conflits entre agents
- Décisions techniques importantes
- Planification des phases
- Validation de l'approche technique

**Décisions clés**:
- Format des données échangées
- Structure WebSocket events
- Standards de code
- Phases de développement

---

## Contrat API (Frontend ↔ Backend)

### Endpoints REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/numbers` | Récupérer tous les chiffres |
| GET | `/api/numbers/:id` | Récupérer un chiffre |
| PUT | `/api/numbers/:id` | Mettre à jour un chiffre |
| DELETE | `/api/numbers/:id` | Supprimer un chiffre |
| POST | `/api/voice/recognize-text` | Texte (Web Speech) → chiffres détectés |

### WebSocket Events

**Client → Server**:
- `start-recognition`: Démarrer une session
- `audio-chunk`: Envoyer un chunk audio

**Server → Client**:
- `number-detected`: Nouveau chiffre détecté
- `number-updated`: Chiffre modifié
- `recognition-error`: Erreur de reconnaissance

---

## Structure du Projet

```
cycloCourse-v4/
├── frontend/              # Vue.js app (dev-front)
│   ├── src/
│   │   ├── components/   # Composants Vue
│   │   ├── services/     # API client
│   │   ├── stores/       # Pinia stores
│   │   └── config/       # Configuration gellules
│   └── package.json
├── backend/              # Express API (dev-back)
│   ├── src/
│   │   ├── config/      # Sequelize / BDD
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── server.ts
│   ├── dist/            # sortie `tsc` (gitignore)
│   └── package.json
└── .cursor/
    └── rules/
        └── agents/      # Fichiers agents
```

---

## Workflow de Développement

### Pour une nouvelle fonctionnalité

1. **Consulter dev-lead** pour valider l'approche
2. **dev-back** implémente l'API si nécessaire
3. **dev-front** implémente l'interface
4. **dev-lead** valide l'intégration

### Pour un bug

1. Identifier si c'est frontend ou backend
2. Invoquer **dev-front** ou **dev-back**
3. Si problème d'intégration, consulter **dev-lead**

### Pour une question d'architecture

1. Toujours consulter **dev-lead** en premier
2. dev-lead coordonne avec les autres agents si nécessaire

---

## Standards du Projet

### Validation des Données
- Chiffres: **1 ≤ n ≤ 1000** (strictement)
- Validation côté frontend ET backend

### Gestion d'Erreur
- Messages d'erreur clairs et en français
- Logging côté backend
- Feedback utilisateur côté frontend

### Sécurité
- Variables d'environnement pour secrets (`.env`)
- Validation stricte des entrées

### Tests
- Couverture minimum: 70%
- Tests unitaires (Jest)
- Tests composants (Vue Test Utils)
- Tests E2E si nécessaire

---

## Comment Utiliser les Agents

### Dans une conversation Cursor

```
@dev-front Peux-tu créer le composant NumberPill avec les propriétés pour l'édition ?
```

```
@dev-back Comment configurer la reconnaissance vocale pour détecter les chiffres 1-1000 ?
```

```
@dev-lead Quel format de données doit être utilisé pour les WebSocket events ?
```

### Changement de contexte

Si vous travaillez sur le frontend puis basculez sur le backend :
- Fermez la conversation avec dev-front
- Ouvrez une nouvelle conversation avec dev-back

### Coordination

Pour des tâches impliquant frontend ET backend :
- Commencez par consulter dev-lead
- dev-lead vous guidera vers les bons agents

---

## Phases de Développement

### Phase 1: Setup ✓
- Configuration projets
- Installation dépendances

### Phase 2: Backend Core (dev-back)
- API REST endpoints
- Modèles de données
- Extraction des chiffres depuis le texte (`/api/voice/recognize-text`)

### Phase 3: Frontend Core (dev-front)
- Composants gellules
- Grille d'affichage
- Édition de chiffres

### Phase 4: Temps Réel (dev-back + dev-front)
- WebSocket backend
- Client WebSocket frontend
- Synchronisation

### Phase 5: Paramétrage (dev-front)
- Configuration gellules
- Gestion confiance
- Interface paramétrage

### Phase 6: Tests & Déploiement (dev-lead)
- Tests automatisés
- Documentation
- Déploiement

---

## Support et Questions

Pour toute question sur :
- **Architecture globale** → @dev-lead
- **Frontend/UI** → @dev-front  
- **Backend/API** → @dev-back

Pour des questions générales ou le choix de l'agent approprié, commencez par @dev-lead.
