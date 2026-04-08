# 🚀 Démarrage Rapide - CycloCourse v4

## Installation Express (Windows PowerShell)

### Méthode 1: Script automatique (Recommandé)

```powershell
.\start-dev.ps1
```

Ce script:
- ✅ Vérifie Node.js
- ✅ Installe les dépendances si nécessaire
- ✅ Démarre backend et frontend automatiquement
- ✅ Ouvre le navigateur

### Méthode 2: Installation manuelle

#### 1. Installer les dépendances

```powershell
# À la racine du projet
npm run install:all
```

Ou manuellement:

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Démarrer le backend

```powershell
cd backend
npm run dev
```

Le backend démarre sur: **http://localhost:3000**

#### 3. Démarrer le frontend (nouveau terminal)

```powershell
cd frontend
npm run dev
```

Le frontend démarre sur: **http://localhost:5173**

#### 4. Ouvrir l'application

Ouvrez votre navigateur sur: **http://localhost:5173**

## 🎯 Utilisation (phase 1 — Web Speech API)

### 1. Reconnaissance par le micro du navigateur

1. Utilisez **Chrome** ou **Edge** (Web Speech API requise).
2. Cliquez sur **Écouter** et acceptez l’accès au micro si demandé.
3. Dictez des chiffres (ou des nombres entre 1 et 1000) ; à chaque phrase reconnue, le serveur extrait les chiffres valides.
4. Les gellules apparaissent dans la grille sous la carte vocale.

### 2. Édition d'un chiffre

1. Cliquez sur une gellule
2. Modifiez la valeur (1-1000)
3. Appuyez sur **Entrée** ou cliquez ailleurs pour valider

### 3. Suppression d'un chiffre

1. Cliquez sur le bouton **×** d'une gellule

### 4. Réinitialisation

1. Cliquez sur **"🗑️ Réinitialiser"** en haut
2. Confirmez

## 🎨 Code Couleur des Gellules

- 🔵 **Bleu** (Haute confiance): > 90%
- 🟠 **Orange** (Confiance moyenne): 70-90%
- 🔴 **Rouge** (Faible confiance): < 70%
- ✏️ **Icône crayon**: Chiffre modifié manuellement

## 📝 Format Audio Recommandé

- **Format**: WAV (16 bits)
- **Sample rate**: 16000 Hz
- **Canaux**: Mono
- **Langue**: Français

### Exemple de conversion avec FFmpeg

```bash
ffmpeg -i input.mp3 -ar 16000 -ac 1 -acodec pcm_s16le output.wav
```

## 🔧 Dépannage Rapide

### Le backend ne démarre pas

```powershell
# Vérifier si le port 3000 est utilisé
netstat -ano | findstr :3000

# Tuer le processus si nécessaire
taskkill /PID <PID> /F
```

### Le frontend ne se connecte pas

1. Vérifier que le backend est démarré (http://localhost:3000)
2. Vérifier la console du navigateur (F12)
3. Regarder les logs du backend

### Reconnaissance vocale échoue (phase 1 — navigateur)

1. Utiliser **Chrome** ou **Edge** ; vérifier l’autorisation **micro** dans la barre d’adresse.
2. Vérifier que le backend répond (`http://localhost:3000`) et que l’API accepte `POST /api/voice/recognize-text` (voir console réseau F12).
3. Dicter clairement des **nombres** ou des chiffres entre **1 et 1000** (le texte est analysé côté serveur).

### Erreurs de dépendances

```powershell
# Supprimer node_modules et réinstaller
cd backend
Remove-Item -Recurse -Force node_modules
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## 🎓 Prochaines Étapes

1. **Tester la reconnaissance**: Bouton **Écouter**, dicter des chiffres, vérifier les gellules.
2. **Éditer des chiffres**: Cliquer sur une gellule pour corriger une erreur.
3. **Observer le temps réel**: Ouvrir plusieurs onglets et voir la synchronisation (WebSocket).
4. **Personnaliser**: Modifier `frontend/src/config/pillConfig.js`

## 📚 Documentation Complète

Voir [README.md](./README.md) pour:
- Architecture détaillée
- API endpoints
- Configuration avancée
- Utilisation des agents Cursor

## 🆘 Aide

Pour toute question, consulter:
- `.cursor/rules/AGENTS.md` - Documentation des agents
- `README.md` - Documentation complète
- Logs du backend et frontend

---

**Bon développement ! 🚴**
