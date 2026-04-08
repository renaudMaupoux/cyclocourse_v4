<template>
  <div
    class="flex min-h-screen flex-col bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 text-foreground"
  >
    <header
      class="border-b border-white/10 bg-card/95 py-8 text-center shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90"
    >
      <h1 class="mb-2 text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
        🚴 CycloCourse — Reconnaissance vocale
      </h1>
      <p class="text-muted-foreground">Détection et édition de chiffres de 1 à 1000</p>
    </header>

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">
      <VoiceRecognitionStatus
        :ws-connected="numbersStore.wsConnected"
        :is-recording="numbersStore.isRecording"
        @recognition-success="handleRecognitionSuccess"
        @recognition-error="handleRecognitionError"
      />

      <NumberGrid
        :numbers="numbersStore.sortedNumbers"
        @update="handleUpdate"
        @delete="handleDelete"
        @reset="handleReset"
      />
    </main>

    <footer class="border-t border-white/10 bg-black/40 py-5 text-center text-sm text-white/80">
      Web Speech API (navigateur) · Vue.js 3 · Express · Tailwind + shadcn
    </footer>

    <div
      v-if="notification"
      class="fixed bottom-6 right-6 z-50 max-w-sm transition md:bottom-8 md:right-8"
      :class="toastClass(notification.type)"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useNumbersStore } from './stores/numbers';
import type { NumberEntry } from './types/number';
import VoiceRecognitionStatus from './components/VoiceRecognitionStatus.vue';
import NumberGrid from './components/NumberGrid.vue';

type ToastType = 'success' | 'error' | 'info';

const numbersStore = useNumbersStore();
const notification = ref<{ message: string; type: ToastType } | null>(null);

const toastClass = (type: ToastType) => {
  const base =
    'rounded-xl px-6 py-4 font-semibold shadow-lg ring-1 ring-black/5';
  if (type === 'success') return `${base} bg-emerald-600 text-white`;
  if (type === 'error') return `${base} bg-red-600 text-white`;
  return `${base} bg-primary text-primary-foreground`;
};

const showNotification = (message: string, type: ToastType = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

const handleUpdate = async (id: number, value: number) => {
  try {
    await numbersStore.updateNumber(id, value);
    showNotification(`Chiffre mis à jour : ${value}`, 'success');
  } catch {
    showNotification('Erreur lors de la mise à jour', 'error');
  }
};

const handleDelete = async (id: number) => {
  try {
    await numbersStore.deleteNumber(id);
    showNotification('Chiffre supprimé', 'success');
  } catch {
    showNotification('Erreur lors de la suppression', 'error');
  }
};

const handleReset = async () => {
  if (confirm('Supprimer tous les chiffres ?')) {
    try {
      await numbersStore.resetNumbers();
      showNotification('Tous les chiffres ont été supprimés', 'success');
    } catch {
      showNotification('Erreur lors de la réinitialisation', 'error');
    }
  }
};

const handleRecognitionSuccess = async (numbers: NumberEntry[]) => {
  showNotification(`${numbers.length} chiffre(s) détecté(s)`, 'success');
  await numbersStore.fetchNumbers();
};

const handleRecognitionError = (error: string) => {
  showNotification(error, 'error');
};

onMounted(async () => {
  numbersStore.connectWebSocket();
  await numbersStore.fetchNumbers();
  showNotification('Application prête', 'success');
});

onUnmounted(() => {
  numbersStore.disconnectWebSocket();
});
</script>
