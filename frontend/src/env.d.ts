/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Préfixes navigateur pour la Web Speech API */
interface Window {
  SpeechRecognition?: import('./types/web-speech').SpeechRecognitionConstructor;
  webkitSpeechRecognition?: import('./types/web-speech').SpeechRecognitionConstructor;
}
