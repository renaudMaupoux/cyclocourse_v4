<template>
  <div class="mx-auto mb-8 max-w-3xl px-1">
    <Card
      :class="
        cn(
          'border-white/20 bg-card/95 shadow-xl backdrop-blur transition-shadow',
          wsConnected && 'ring-1 ring-emerald-500/40',
          isBusy && 'ring-2 ring-primary/50'
        )
      "
    >
      <CardHeader class="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <CardTitle class="text-xl text-card-foreground">Reconnaissance vocale (navigateur)</CardTitle>
        <Badge :variant="wsConnected ? 'default' : 'destructive'" class="shrink-0">
          {{ wsConnected ? 'Connecté' : 'Déconnecté' }}
        </Badge>
      </CardHeader>

      <CardContent class="space-y-4 pt-6">
        <Alert v-if="!wsConnected" variant="destructive" class="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          Connexion au serveur perdue. La sauvegarde des chiffres nécessite l’API.
        </Alert>

        <Alert v-if="error" variant="destructive">
          {{ error }}
        </Alert>

        <p class="text-sm leading-relaxed text-muted-foreground">
          Reconnaissance via <strong class="text-foreground">Web Speech API</strong> dans le navigateur. Chaque phrase
          est envoyée au serveur pour extraire les chiffres <strong class="text-foreground">1 à 1000</strong>. Préférez
          <strong class="text-foreground">Chrome</strong> ou <strong class="text-foreground">Edge</strong>.
        </p>

        <div class="space-y-3">
          <Alert
            v-if="!webSpeechOk"
            variant="destructive"
            class="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
          >
            Web Speech API indisponible. Utilisez Chrome ou Edge.
          </Alert>

          <template v-else>
            <div class="flex flex-wrap gap-3">
              <Button
                :disabled="!wsConnected || webListening || uploading"
                class="gap-2"
                @click="startWebSpeech"
              >
                <Mic class="h-4 w-4" />
                Écouter
              </Button>
              <Button variant="secondary" :disabled="!webListening" class="gap-2" @click="stopWebSpeech">
                <Square class="h-4 w-4" />
                Arrêter
              </Button>
            </div>
            <p v-if="webInterim" class="min-h-[1.25em] text-sm italic text-muted-foreground">… {{ webInterim }}</p>
            <p v-if="webListening" class="animate-pulse-soft text-sm font-semibold text-primary">Écoute en cours…</p>
          </template>
        </div>

        <div
          v-if="lastResult"
          class="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm dark:bg-primary/10"
        >
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Dernier résultat</p>
          <p class="text-foreground">{{ lastResult }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { Mic, Square } from 'lucide-vue-next';
import { voiceApi } from '@/services/api';
import { createWebSpeechRecognizer, isWebSpeechSupported, type WebSpeechSession } from '@/services/webSpeechRecognition';
import { cn } from '@/lib/utils';
import Card from './ui/card/Card.vue';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';
import CardContent from './ui/card/CardContent.vue';
import Button from './ui/button/Button.vue';
import Badge from './ui/badge/Badge.vue';
import Alert from './ui/alert/Alert.vue';
import type { NumberEntry, VoiceRecognizeResponse } from '@/types/number';

const WEB_SPEECH_CONFIDENCE = 0.82;

const props = withDefaults(
  defineProps<{
    wsConnected?: boolean;
    isRecording?: boolean;
  }>(),
  {
    wsConnected: false,
    isRecording: false
  }
);

const emit = defineEmits<{
  'recognition-success': [numbers: NumberEntry[]];
  'recognition-error': [message: string];
}>();

const uploading = ref(false);
const error = ref<string | null>(null);
const lastResult = ref<string | null>(null);
const webSpeechOk = computed(() => isWebSpeechSupported());
const webListening = ref(false);
const webInterim = ref('');
let webSession: WebSpeechSession | null = null;
const isBusy = computed(() => uploading.value || webListening.value);

const applyVoiceResponse = (response: VoiceRecognizeResponse, label: string) => {
  if (response.success && response.data && response.data.length > 0) {
    lastResult.value = `${label}: ${response.data.length} chiffre(s) — ${response.data.map((n) => n.value).join(', ')}`;
    emit('recognition-success', response.data);
  } else {
    lastResult.value = `${label}: aucun chiffre détecté (1–1000).`;
  }
};

const sendTextToApi = async (text: string) => {
  const response = await voiceApi.recognizeText(text, WEB_SPEECH_CONFIDENCE);
  applyVoiceResponse(response, 'Navigateur');
};

const startWebSpeech = () => {
  error.value = null;
  webInterim.value = '';
  try {
    webSession = createWebSpeechRecognizer({
      onResult: async (transcript, meta) => {
        if (!meta.final) {
          webInterim.value = transcript;
          return;
        }
        webInterim.value = '';
        if (!transcript || !props.wsConnected) return;
        uploading.value = true;
        try {
          await sendTextToApi(transcript);
        } catch (err: unknown) {
          let msg = 'Erreur envoi texte';
          if (axios.isAxiosError(err)) {
            msg = (err.response?.data as { error?: string })?.error || err.message || msg;
          } else if (err instanceof Error) {
            msg = err.message;
          }
          error.value = msg;
          emit('recognition-error', error.value);
        } finally {
          uploading.value = false;
        }
      },
      onError: (e) => {
        error.value = e.message || 'Erreur Web Speech';
        emit('recognition-error', error.value);
        webListening.value = false;
      },
      onEnd: () => {
        webListening.value = false;
      }
    });
    webSession.start();
    webListening.value = true;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Impossible de démarrer Web Speech';
  }
};

const stopWebSpeech = () => {
  webInterim.value = '';
  if (webSession) {
    webSession.stop();
    webSession = null;
  }
  webListening.value = false;
};

onBeforeUnmount(() => {
  stopWebSpeech();
});
</script>
