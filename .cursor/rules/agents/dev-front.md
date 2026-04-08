# Agent de Développement Frontend

Agent spécialisé dans le développement de l'interface Vue.js pour l'application de reconnaissance vocale.

## Responsabilités

- Développer les composants Vue.js pour afficher les chiffres sous forme de gellules
- Implémenter l'édition des chiffres détectés
- Gérer l'interface utilisateur interactive et paramètrable
- Intégrer les appels API vers le backend Express
- Assurer la réactivité et l'expérience utilisateur

## Stack Technique

- **Langage**: **TypeScript** (SFC avec `<script setup lang="ts">`, vérification au build via `vue-tsc`)
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **HTTP Client**: Axios ou Fetch API
- **CSS**: **Tailwind CSS** + **tailwindcss-animate** ; composants type **shadcn** dans `src/components/ui/` (Button, Card, Badge, Alert), utilitaire `cn()` dans `src/lib/utils.ts` (clsx + tailwind-merge)
- **Scripts**: `npm run typecheck` (vue-tsc + tsc sur la config Vite), `npm run build` inclut la même vérification avant `vite build`
- **Icônes**: lucide-vue-next
- **State Management**: Pinia (si nécessaire)

## Architecture Frontend

### Composants Principaux

1. **NumberPill.vue** - Composant de gellule individuelle
   - Affiche un chiffre (1-1000)
   - Mode éditable/lecture
   - Indicateur de confiance de détection
   - Validation de l'entrée utilisateur

2. **NumberGrid.vue** - Grille de gellules
   - Affiche tous les chiffres reçus
   - Gestion du layout responsive
   - Filtrage et recherche

3. **VoiceRecognitionStatus.vue** - Statut de la reconnaissance
   - État de connexion au backend
   - Indicateur de reconnaissance en cours
   - Messages d'erreur

4. **NumberEditor.vue** - Éditeur de chiffre
   - Modal ou inline edit
   - Validation du format (1-1000)
   - Sauvegarde des modifications

### API Service

Les appels HTTP sont centralisés dans `src/services/api.ts` (`numbersApi`, `voiceApi.recognizeText`, client Axios avec `import.meta.env.VITE_API_URL`).

### Store Pinia

Le store principal est `src/stores/numbers.ts` (état des chiffres, WebSocket, actions CRUD).

## Styles et Paramètres de Gellule

```vue
<style scoped>
.number-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--pill-border-radius, 20px);
  background-color: var(--pill-bg-color, #e3f2fd);
  border: 2px solid var(--pill-border-color, #2196f3);
  font-size: var(--pill-font-size, 16px);
  cursor: pointer;
  transition: all 0.3s ease;
}

.number-pill.low-confidence {
  border-color: #ff9800;
  background-color: #fff3e0;
}

.number-pill.error {
  border-color: #f44336;
  background-color: #ffebee;
}

.number-pill:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>
```

## Configuration Paramètrable

```typescript
// config/pillConfig.ts
export const pillConfig = {
  colors: {
    high: { bg: '#e3f2fd', border: '#2196f3' },
    medium: { bg: '#fff3e0', border: '#ff9800' },
    low: { bg: '#ffebee', border: '#f44336' }
  },
  thresholds: {
    high: 0.9,
    medium: 0.7
  },
  layout: {
    columns: 'auto',
    gap: '12px',
    maxWidth: '1200px'
  }
};
```

## Bonnes Pratiques

- Utiliser la Composition API de Vue 3 avec **TypeScript** (`lang="ts"`)
- Composants petits et réutilisables
- Types partagés dans `src/types/` (ex. `NumberEntry`) ; props typées avec `defineProps<>`
- Gestion d'erreur gracieuse
- Loading states pour les actions asynchrones
- Accessibilité (ARIA labels, navigation clavier)
- Responsive design mobile-first

## Tests

- Tests unitaires avec Vitest
- Tests de composants avec Vue Test Utils
- Tests E2E avec Playwright (si demandé par dev-lead)
