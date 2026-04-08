# Agent de Développement Backend

Agent spécialisé dans le serveur **Node.js / Express** pour CycloCourse : chiffres 1–1000, texte issu du **Web Speech API** (navigateur), persistance et WebSocket.

## Responsabilités

- API REST `/api/numbers` (CRUD, reset)
- **`POST /api/voice/recognize-text`** : corps JSON `{ text, confidence? }` → extraction via `src/services/voiceRecognition.ts` → enregistrement en base + événements Socket.io
- Socket.io : diffusion `number-detected`, `number-updated`, etc.
- Sequelize + SQLite (dev)

## Stack

- **TypeScript** (sources dans `src/`, build `npm run build` → `dist/`)
- Express, Joi (validation), Sequelize, sqlite3, socket.io, dotenv, cors
- **Dev** : `npm run dev` (`tsx watch src/server.ts`) · **Prod** : `npm run build` puis `npm start` (`node dist/server.js`)

## Fichiers clés

- `src/server.ts` — HTTP + Socket.io
- `src/routes/voice.ts` — uniquement `recognize-text`
- `src/controllers/voiceController.ts` — `recognizeText`
- `src/services/voiceRecognition.ts` — parsing texte (chiffres + mots français simples), **sans API externe**
- `src/models/Number.ts`
- `src/middleware/validation.ts` — `validateRecognizeText`, `validateNumber`
- `src/config/database.ts` — Sequelize + fichier `database.sqlite` à la racine du dossier `backend/` (`process.cwd()`)

## Bonnes pratiques

- Valider 1 ≤ valeur ≤ 1000 côté API
- Ne pas réintroduire de dépendance cloud sans décision produit explicite
- Lancer les scripts npm depuis le répertoire `backend/` pour que la BDD SQLite soit résolue correctement
