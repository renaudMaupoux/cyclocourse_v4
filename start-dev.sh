#!/bin/bash

echo "🚴 CycloCourse v4 - Démarrage en mode développement"
echo "================================================"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Vérifier si les dépendances backend sont installées
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend
    npm install
    cd ..
    echo "✅ Dépendances backend installées"
fi

# Vérifier si les dépendances frontend sont installées
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    cd frontend
    npm install
    cd ..
    echo "✅ Dépendances frontend installées"
fi

echo ""
echo "🚀 Démarrage des serveurs..."
echo ""

# Démarrer le backend en arrière-plan
echo "🔧 Démarrage du backend sur http://localhost:3000"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 3

# Démarrer le frontend en arrière-plan
echo "🎨 Démarrage du frontend sur http://localhost:5173"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application démarrée avec succès!"
echo ""
echo "📌 Backend:  http://localhost:3000"
echo "📌 Frontend: http://localhost:5173"
echo ""
echo "💡 Pour arrêter, appuyez sur Ctrl+C"
echo ""

# Fonction pour arrêter proprement les serveurs
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Attendre que les processus se terminent
wait
