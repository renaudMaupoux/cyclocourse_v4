<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
    <div class="mb-8 text-center md:text-left">
      <h2 class="text-2xl font-bold text-white md:text-3xl">Course — Reconnaissance vocale</h2>
      <p class="mt-1 text-sm text-white/80">Détection et édition des dossards 1 à 1000</p>
    </div>

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-2 xl:items-start xl:gap-10">
      <div class="min-w-0 space-y-8">
        <Card class="border-white/20 bg-card/95 shadow-xl backdrop-blur">
          <CardHeader class="border-b border-border pb-4">
            <CardTitle class="text-lg text-card-foreground">Course</CardTitle>
            <p class="text-sm text-muted-foreground">
              Démarrez le chronomètre au lancement réel de la course (affichage temps écoulé).
            </p>
          </CardHeader>
          <CardContent
            class="flex flex-col gap-6 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Temps écoulé</p>
              <p class="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {{ raceElapsedFormatted }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                v-if="raceStartedAt == null"
                type="button"
                class="min-w-[10rem]"
                @click="startCourse"
              >
                Démarrer la course
              </Button>
              <template v-else>
                <Button type="button" variant="outline" @click="resetCourse">Réinitialiser le chrono</Button>
              </template>
            </div>
          </CardContent>
        </Card>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <VoiceRecognitionStatus
            embedded
            :ws-connected="numbersStore.wsConnected"
            :is-recording="numbersStore.isRecording"
            @recognition-success="handleRecognitionSuccess"
            @recognition-error="handleRecognitionError"
          />

          <Card class="flex h-full min-h-0 flex-col border-white/20 bg-card/95 shadow-xl backdrop-blur">
            <CardHeader class="border-b border-border pb-4">
              <CardTitle class="text-lg text-card-foreground">Saisie manuelle</CardTitle>
              <p class="text-sm text-muted-foreground">
                Entrez un numéro entre 1 et 1000 pour l’enregistrer comme un passage (même traitement côté serveur
                que la détection vocale).
              </p>
            </CardHeader>
            <CardContent class="flex flex-1 flex-col pt-6">
              <form class="flex flex-col gap-4 sm:flex-row sm:items-end" @submit.prevent="submitManualDossard">
                <div class="flex-1">
                  <label for="manual-dossard" class="mb-1 block text-xs font-medium text-muted-foreground"
                    >Numéro de dossard</label
                  >
                  <input
                    id="manual-dossard"
                    v-model.number="manualDossard"
                    type="number"
                    min="1"
                    max="1000"
                    required
                    placeholder="ex. 42"
                    class="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                    :disabled="manualSubmitting"
                  />
                </div>
                <Button type="submit" :disabled="manualSubmitting">
                  {{ manualSubmitting ? 'Envoi…' : 'Enregistrer le dossard' }}
                </Button>
              </form>
              <p v-if="!numbersStore.wsConnected" class="mt-3 text-sm text-muted-foreground">
                WebSocket déconnecté : les mises à jour temps réel peuvent être retardées ; la saisie manuelle
                utilise tout de même l’API REST.
              </p>
              <p v-if="manualError" class="mt-2 text-sm text-destructive">{{ manualError }}</p>
            </CardContent>
          </Card>
        </div>

    <NumberGrid
      :numbers="numbersStore.sortedNumbers"
      @update="handleUpdate"
      @delete="handleDelete"
      @reset="handleReset"
    />
      </div>

      <aside
        class="min-w-0 w-full xl:sticky xl:top-6 xl:self-start"
        aria-label="Liste des coureurs"
      >
        <Card class="border-white/20 bg-card/95 shadow-xl backdrop-blur">
          <CardHeader class="border-b border-border pb-4">
            <CardTitle class="text-lg text-card-foreground">Coureurs</CardTitle>
            <p class="text-sm text-muted-foreground">
              Après validation, l’ordre suit le <strong class="font-medium text-foreground">premier passage</strong>
              détecté par dossard (comme la page Résultats).
            </p>
            <div class="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label for="rider-category-filter" class="mb-1 block text-xs font-medium text-muted-foreground"
                  >Filtrer par catégorie</label
                >
                <select
                  id="rider-category-filter"
                  v-model="categoryFilter"
                  class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">Toutes les catégories</option>
                  <option v-for="c in RIDER_CATEGORIES" :key="c" :value="String(c)">
                    Catégorie {{ c }}
                  </option>
                </select>
              </div>
              <div>
                <label for="rider-tour-filter" class="mb-1 block text-xs font-medium text-muted-foreground"
                  >Filtrer par nombre de tours</label
                >
                <select
                  id="rider-tour-filter"
                  v-model="tourFilter"
                  class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">Tous</option>
                  <option v-for="n in TOUR_FILTER_RANGE" :key="n" :value="String(n)">
                    {{ tourFilterOptionLabel(n) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                :disabled="ridersLoading || !riders.length"
                @click="applyDetectionOrder"
              >
                Valider l’ordre des détections
              </Button>
            </div>
          </CardHeader>
          <CardContent class="pt-4">
            <div v-if="ridersLoading" class="py-6 text-center text-sm text-muted-foreground">
              Chargement des coureurs…
            </div>
            <p v-else-if="ridersError" class="text-sm text-destructive">{{ ridersError }}</p>
            <div v-else class="max-h-[min(70vh,40rem)] overflow-y-auto pr-1">
              <ul class="space-y-2 text-sm">
                <li
                  v-for="(r, index) in filteredRiders"
                  :key="r.id"
                  class="rounded-lg border border-border/60 bg-background/50 px-3 py-2"
                >
                  <div class="flex gap-3">
                    <div class="flex w-12 shrink-0 flex-col items-end gap-0.5 sm:w-14">
                      <span
                        v-if="showRankColumn"
                        class="text-xs font-medium leading-none text-muted-foreground"
                        >{{ index + 1 }}</span
                      >
                      <span class="font-mono text-base font-semibold leading-none text-primary">{{ r.numero }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <span class="truncate font-medium text-foreground" :title="r.nom">{{ r.nom }}</span>
                        <div
                          class="flex shrink-0 items-center gap-2 tabular-nums text-xs text-muted-foreground"
                          :title="passageTitle(r.numero)"
                        >
                          <span class="min-w-[4.5rem] text-right">{{ firstPassageTimeLabel(r.numero) }}</span>
                          <span class="text-border" aria-hidden="true">|</span>
                          <span>{{ toursLabel(tourCountByDossard.get(r.numero) ?? 0) }}</span>
                        </div>
                      </div>
                      <p class="mt-1 text-xs leading-snug text-muted-foreground">
                        <span class="whitespace-nowrap">Catégorie {{ r.category }}</span>
                        <span class="mx-1.5 text-border" aria-hidden="true">·</span>
                        <span class="break-words">{{ r.club?.trim() ? r.club : '—' }}</span>
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
              <p v-if="!riders.length" class="py-4 text-center text-muted-foreground">
                Aucun coureur — ajoutez-en depuis la page Acquisition.
              </p>
              <p
                v-else-if="!filteredRiders.length"
                class="py-4 text-center text-sm text-muted-foreground"
              >
                {{ emptyFilterMessage }}
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>

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
import axios from 'axios';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useNumbersStore } from '@/stores/numbers';
import { ridersApi, voiceApi } from '@/services/api';
import type { NumberEntry } from '@/types/number';
import type { Rider } from '@/types/rider';
import VoiceRecognitionStatus from '@/components/VoiceRecognitionStatus.vue';
import NumberGrid from '@/components/NumberGrid.vue';
import Card from '@/components/ui/card/Card.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import CardContent from '@/components/ui/card/CardContent.vue';
import Button from '@/components/ui/button/Button.vue';

/** Confiance synthétique pour une saisie manuelle (légèrement plus haute que la voix navigateur) */
const MANUAL_CONFIDENCE = 0.95;

/** Catégories autorisées (aligné sur le modèle Rider côté API) */
const RIDER_CATEGORIES = [1, 2, 3, 4, 5, 6] as const;

/** Filtre nombre de tours : 0 à 10 (10 = 10 tours ou plus) */
const TOUR_FILTER_MAX = 10;
const TOUR_FILTER_RANGE = Array.from({ length: TOUR_FILTER_MAX + 1 }, (_, i) => i);

type ToastType = 'success' | 'error' | 'info';

const numbersStore = useNumbersStore();
const notification = ref<{ message: string; type: ToastType } | null>(null);
const manualDossard = ref<number | null>(null);
const manualSubmitting = ref(false);
const manualError = ref('');

/** Chronomètre course (temps écoulé depuis « Démarrer la course ») */
const raceStartedAt = ref<number | null>(null);
const nowTick = ref(Date.now());
let chronoInterval: ReturnType<typeof setInterval> | null = null;

function formatChronoMs(ms: number): string {
  const x = Math.max(0, ms);
  const totalS = Math.floor(x / 1000);
  const h = Math.floor(totalS / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = totalS % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const raceElapsedFormatted = computed(() => {
  const start = raceStartedAt.value;
  if (start == null) return '00:00:00';
  return formatChronoMs(nowTick.value - start);
});

function startCourse() {
  if (raceStartedAt.value != null) return;
  raceStartedAt.value = Date.now();
  chronoInterval = setInterval(() => {
    nowTick.value = Date.now();
  }, 250);
}

function resetCourse() {
  raceStartedAt.value = null;
  if (chronoInterval != null) {
    clearInterval(chronoInterval);
    chronoInterval = null;
  }
}

/** Heure du premier passage détecté (horloge locale) */
function firstPassageTimeLabel(numero: number): string {
  const ms = firstDetectionMsByDossard.value.get(numero);
  if (ms == null) return '—';
  return new Date(ms).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function passageTitle(numero: number): string {
  const ms = firstDetectionMsByDossard.value.get(numero);
  if (ms == null) return 'Aucun passage détecté';
  return `Premier passage : ${new Date(ms).toLocaleString('fr-FR')}`;
}

const riders = ref<Rider[]>([]);
const ridersLoading = ref(false);
const ridersError = ref('');
/** Après « Valider », tri = premier horodatage de détection par dossard (aligné sur /riders/ranking) */
const sortByDetections = ref(false);
/** Valeurs du select HTML : `all` ou index catégorie sous forme de chaîne */
const categoryFilter = ref<string>('all');
/** `all` ou indice 0…10 (10 = au moins 10 tours) */
const tourFilter = ref<string>('all');

/** ms du premier enregistrement par valeur de dossard (chiffres détectés) */
const firstDetectionMsByDossard = computed(() => {
  const map = new Map<number, number>();
  for (const n of numbersStore.numbers) {
    const t = new Date(n.timestamp ?? 0).getTime();
    const prev = map.get(n.value);
    if (prev === undefined || t < prev) map.set(n.value, t);
  }
  return map;
});

/** Nombre de passages (tours) par dossard : une entrée dans les détections = un tour */
const tourCountByDossard = computed(() => {
  const map = new Map<number, number>();
  for (const n of numbersStore.numbers) {
    map.set(n.value, (map.get(n.value) ?? 0) + 1);
  }
  return map;
});

const displayRiders = computed(() => {
  const list = [...riders.value];
  if (!sortByDetections.value) {
    return list;
  }
  const timeMap = firstDetectionMsByDossard.value;
  return list.sort((a, b) => {
    const ta = timeMap.get(a.numero);
    const tb = timeMap.get(b.numero);
    const ia = ta ?? Number.POSITIVE_INFINITY;
    const ib = tb ?? Number.POSITIVE_INFINITY;
    if (ia !== ib) return ia - ib;
    return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
  });
});

function matchesTourCountFilter(passages: number, filter: string): boolean {
  if (filter === 'all') return true;
  const n = parseInt(filter, 10);
  if (Number.isNaN(n)) return true;
  if (n === TOUR_FILTER_MAX) return passages >= TOUR_FILTER_MAX;
  return passages === n;
}

const filteredRiders = computed(() => {
  const counts = tourCountByDossard.value;
  let list = displayRiders.value;
  if (categoryFilter.value !== 'all') {
    const cat = parseInt(categoryFilter.value, 10);
    if (!Number.isNaN(cat)) list = list.filter((r) => r.category === cat);
  }
  if (tourFilter.value !== 'all') {
    list = list.filter((r) =>
      matchesTourCountFilter(counts.get(r.numero) ?? 0, tourFilter.value)
    );
  }
  return list;
});

/** Libellés d’options du filtre tours (0…9 exact, 10 = 10+) */
function tourFilterOptionLabel(n: number): string {
  if (n === 0) return '0 tour';
  if (n === 1) return '1 tour';
  if (n === TOUR_FILTER_MAX) return `${TOUR_FILTER_MAX} tours ou plus`;
  return `${n} tours`;
}

const emptyFilterMessage = computed(() => {
  const hasCategory = categoryFilter.value !== 'all';
  const hasTours = tourFilter.value !== 'all';
  if (hasCategory && hasTours) return 'Aucun coureur ne correspond à ces critères.';
  if (hasCategory) return 'Aucun coureur dans cette catégorie.';
  if (hasTours) return 'Aucun coureur avec ce nombre de tours.';
  return 'Aucun résultat.';
});

/** Rang affiché : ordre détections validé et/ou filtre par nombre de tours */
const showRankColumn = computed(
  () => sortByDetections.value || tourFilter.value !== 'all'
);

function applyDetectionOrder() {
  sortByDetections.value = true;
  showNotification('Liste réordonnée selon les détections (premier passage par dossard).', 'success');
}

/** Libellé français pour le nombre de tours (passages détectés) */
function toursLabel(count: number): string {
  if (count === 1) return '1 tour';
  return `${count} tours`;
}

async function fetchRiders() {
  ridersLoading.value = true;
  ridersError.value = '';
  try {
    const res = await ridersApi.list();
    riders.value = res.data;
  } catch {
    ridersError.value = 'Impossible de charger les coureurs.';
  } finally {
    ridersLoading.value = false;
  }
}

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

const handleUpdate = async (id: string, value: number) => {
  try {
    await numbersStore.updateNumber(id, value);
    showNotification(`Chiffre mis à jour : ${value}`, 'success');
  } catch {
    showNotification('Erreur lors de la mise à jour', 'error');
  }
};

const handleDelete = async (id: string) => {
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

async function submitManualDossard() {
  manualError.value = '';
  const n = manualDossard.value;
  if (n == null || Number.isNaN(n) || n < 1 || n > 1000) {
    manualError.value = 'Indiquez un dossard entre 1 et 1000.';
    return;
  }
  manualSubmitting.value = true;
  try {
    const text = String(n);
    const response = await voiceApi.recognizeText(text, MANUAL_CONFIDENCE);
    if (response.success && response.data?.length) {
      showNotification(`Dossard ${n} enregistré`, 'success');
      await numbersStore.fetchNumbers();
      manualDossard.value = null;
    } else {
      manualError.value = 'Aucun dossard valide enregistré (vérifiez la plage 1–1000).';
    }
  } catch (e: unknown) {
    const msg = axios.isAxiosError(e)
      ? (e.response?.data as { error?: string } | undefined)?.error || e.message
      : 'Erreur réseau';
    manualError.value = typeof msg === 'string' ? msg : 'Impossible d’enregistrer le dossard.';
  } finally {
    manualSubmitting.value = false;
  }
}

onMounted(async () => {
  numbersStore.connectWebSocket();
  await Promise.all([numbersStore.fetchNumbers(), fetchRiders()]);
  showNotification('Page course prête', 'success');
});

onUnmounted(() => {
  resetCourse();
  numbersStore.disconnectWebSocket();
});
</script>
