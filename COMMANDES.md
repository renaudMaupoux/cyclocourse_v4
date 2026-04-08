# 📋 Aide-Mémoire - Commandes Utiles

## 🚀 Démarrage

### Démarrage automatique (Recommandé)
```powershell
.\start-dev.ps1
```

### Démarrage manuel

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## 📦 Installation & Gestion des Dépendances

### Installation complète
```powershell
# Tout en une fois (depuis la racine)
npm run install:all

# Ou séparément
cd backend && npm install
cd frontend && npm install
```

### Ajouter une dépendance

**Backend:**
```powershell
cd backend
npm install <package-name>
npm install --save-dev <package-name>  # Dev dependency
```

**Frontend:**
```powershell
cd frontend
npm install <package-name>
```

### Mettre à jour les dépendances
```powershell
cd backend
npm update

cd frontend
npm update
```

## 🧪 Tests

### Backend (Jest)
```powershell
cd backend
npm test                    # Lancer tous les tests
npm test -- --coverage      # Avec couverture
npm test -- --watch         # Mode watch
```

### Frontend (Vitest - à configurer)
```powershell
cd frontend
npm test
```

## 🛠️ Développement

### Lancer en mode développement
```powershell
# Backend avec nodemon (auto-reload)
cd backend
npm run dev

# Frontend avec Vite (HMR)
cd frontend
npm run dev
```

### Build production

**Frontend:**
```powershell
cd frontend
npm run build      # Crée dist/
npm run preview    # Preview du build
```

**Backend:**
```powershell
cd backend
npm start          # Mode production
```

## 🗄️ Base de Données

### Réinitialiser la base de données
```powershell
cd backend
Remove-Item database.sqlite
# Redémarrer le serveur pour recréer les tables
npm run dev
```

### Voir les données
```powershell
# Installer SQLite browser ou utiliser CLI
sqlite3 backend/database.sqlite
.tables
SELECT * FROM numbers;
.exit
```

## 🐛 Debugging

### Voir les logs backend
```powershell
cd backend
npm run dev
# Les logs s'affichent dans la console
```

### Voir les logs frontend
Ouvrir la console du navigateur (F12)

### Nettoyer les caches
```powershell
# Backend
cd backend
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install

# Frontend
cd frontend
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
```

### Vérifier les ports utilisés
```powershell
# Port 3000 (backend)
netstat -ano | findstr :3000

# Port 5173 (frontend)
netstat -ano | findstr :5173

# Tuer un processus
taskkill /PID <PID> /F
```

## 🔐 Variables d'Environnement

### Backend (.env)
```powershell
cd backend
notepad .env
```

Variables importantes:
- `PORT=3000`
- `FRONTEND_URL=http://localhost:5173`
- `GOOGLE_APPLICATION_CREDENTIALS=../client_secret_*.json`

### Frontend (.env)
```powershell
cd frontend
notepad .env
```

Variables importantes:
- `VITE_API_URL=http://localhost:3000/api`
- `VITE_WS_URL=http://localhost:3000`

## 📊 Monitoring

### Tester l'API REST

**Avec PowerShell:**
```powershell
# GET - Récupérer tous les chiffres
Invoke-RestMethod -Uri "http://localhost:3000/api/numbers" -Method Get

# PUT - Mettre à jour un chiffre
$body = @{ value = 42 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/numbers/<id>" -Method Put -Body $body -ContentType "application/json"

# DELETE - Supprimer un chiffre
Invoke-RestMethod -Uri "http://localhost:3000/api/numbers/<id>" -Method Delete
```

**Avec curl:**
```bash
# GET
curl http://localhost:3000/api/numbers

# PUT
curl -X PUT http://localhost:3000/api/numbers/<id> -H "Content-Type: application/json" -d '{"value":42}'

# DELETE
curl -X DELETE http://localhost:3000/api/numbers/<id>
```

### Tester WebSocket

Dans la console du navigateur (F12):
```javascript
// Se connecter
const socket = io('http://localhost:3000');

// Écouter les événements
socket.on('connect', () => console.log('Connecté:', socket.id));
socket.on('number-detected', (data) => console.log('Chiffre détecté:', data));

// Envoyer un événement
socket.emit('start-recognition');
```

## 🔍 Inspection du Code

### Linter (si configuré)
```powershell
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Formater le code (si Prettier configuré)
```powershell
npx prettier --write "**/*.{js,vue,json}"
```

## 📝 Git (Gestion de Version)

### Initialiser Git
```powershell
git init
git add .
git commit -m "Initial commit - CycloCourse v4"
```

### Branches
```powershell
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Lister les branches
git branch

# Changer de branche
git checkout main
```

### Commits
```powershell
git add .
git commit -m "Description des changements"
```

### Vérifier le statut
```powershell
git status
git log --oneline
```

## 🧹 Nettoyage

### Nettoyer les fichiers temporaires
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules, database.sqlite, *.log

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules, dist, .vite
```

### Réinstallation complète
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 🎯 Agents Cursor

### Invoquer un agent dans Cursor
```
@dev-front <votre question sur le frontend>
@dev-back <votre question sur le backend>
@dev-lead <question d'architecture>
```

### Exemples
```
@dev-front Comment ajouter une animation au chargement ?
@dev-back Comment optimiser la reconnaissance vocale ?
@dev-lead Quelle est la meilleure approche pour l'authentification ?
```

## 📚 Documentation

- **Démarrage rapide**: `QUICKSTART.md`
- **Documentation complète**: `README.md`
- **État du projet**: `PROJET-COMPLET.md`
- **Agents**: `.cursor/rules/AGENTS.md`

## 🆘 Aide d'Urgence

### Le backend ne démarre pas
```powershell
cd backend
npm install
node server.js  # Voir les erreurs directement
```

### Le frontend ne se connecte pas
1. Vérifier que le backend tourne (http://localhost:3000)
2. F12 → Console pour voir les erreurs
3. Vérifier `.env` dans frontend

### Reconnaissance vocale échoue
1. Vérifier `client_secret_*.json` à la racine
2. Regarder les logs backend
3. Tester avec un fichier WAV simple

### Tout réinitialiser
```powershell
# Arrêter tous les serveurs (Ctrl+C)
cd backend
Remove-Item -Recurse -Force node_modules, database.sqlite
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules, dist
npm install

# Redémarrer
.\start-dev.ps1
```

---

**Astuce**: Gardez ce fichier ouvert pendant le développement ! 📌
