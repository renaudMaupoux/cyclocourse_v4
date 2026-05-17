<template>
  <div class="mx-auto max-w-5xl px-4 py-8 md:px-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white md:text-3xl">Acquisition des coureurs</h2>
      <p class="mt-2 text-sm text-white/80">
        Import CSV (<code class="rounded bg-black/30 px-1">numero;nom;club;categorie</code>), recherche, ajout
        manuel, puis résultats par ordre d’acquisition des numéros.
      </p>
    </div>

    <div class="mb-6 rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
      <h3 class="mb-2 text-sm font-semibold text-card-foreground">Importer un fichier CSV</h3>
      <p class="mb-3 text-xs text-muted-foreground">
        Séparateur point-virgule ou virgule. En-têtes :
        <strong>numero</strong>, <strong>nom</strong>, <strong>club</strong> (optionnel),
        <strong>categorie</strong> (1–6).
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        class="block w-full max-w-md text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
        @change="onCsvFile"
      />
      <p v-if="importMessage" class="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{{ importMessage }}</p>
    </div>

    <div class="mb-6 flex flex-col gap-4 rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur md:flex-row md:items-end">
      <div class="flex-1">
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Filtrer</label>
        <input
          v-model="search"
          type="search"
          placeholder="Nom, club ou n° de dossard…"
          class="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
          @input="debouncedFetch"
        />
      </div>
      <Button type="button" class="shrink-0" @click="goResultats"> Enregistrer et voir les résultats </Button>
    </div>

    <div class="mb-8 rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
      <h3 class="mb-4 text-lg font-semibold text-card-foreground">Ajouter un coureur</h3>
      <form class="grid gap-3 md:grid-cols-6" @submit.prevent="addRider">
        <div>
          <label class="mb-1 block text-xs text-muted-foreground">Dossard</label>
          <input
            v-model.number="form.numero"
            type="number"
            min="1"
            max="1000"
            required
            class="w-full rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs text-muted-foreground">Nom</label>
          <input
            v-model="form.nom"
            type="text"
            required
            maxlength="200"
            class="w-full rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs text-muted-foreground">Club</label>
          <input
            v-model="form.club"
            type="text"
            maxlength="300"
            placeholder="Optionnel"
            class="w-full rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-muted-foreground">Cat.</label>
          <select v-model.number="form.category" class="w-full rounded-lg border border-input bg-background px-3 py-2">
            <option v-for="c in 6" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="md:col-span-6">
          <Button type="submit" :disabled="loading">Ajouter</Button>
        </div>
      </form>
      <p v-if="formError" class="mt-2 text-sm text-destructive">{{ formError }}</p>
    </div>

    <div class="rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
      <h3 class="mb-4 text-lg font-semibold text-card-foreground">Liste ({{ riders.length }})</h3>
      <div v-if="loading && !riders.length" class="py-8 text-center text-muted-foreground">Chargement…</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr class="border-b border-border text-muted-foreground">
              <th class="pb-2 pr-2">Dossard</th>
              <th class="pb-2 pr-2">Nom</th>
              <th class="pb-2 pr-2">Club</th>
              <th class="pb-2 pr-2">Cat.</th>
              <th class="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in riders" :key="r.id" class="border-b border-border/60">
              <td class="py-2 pr-2 font-mono font-semibold text-primary">{{ r.numero }}</td>
              <td class="py-2 pr-2">{{ r.nom }}</td>
              <td class="py-2 pr-2 text-muted-foreground">{{ r.club || '—' }}</td>
              <td class="py-2 pr-2">{{ r.category }}</td>
              <td class="py-2 text-right">
                <Button variant="destructive" size="sm" type="button" @click="removeRider(r.id)">Supprimer</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!loading && !riders.length" class="py-6 text-center text-muted-foreground">Aucun coureur</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ridersApi } from '@/services/api';
import type { Rider } from '@/types/rider';
import Button from '@/components/ui/button/Button.vue';

const router = useRouter();
const riders = ref<Rider[]>([]);
const search = ref('');
const loading = ref(false);
const formError = ref('');
const importMessage = ref('');
const form = ref({ numero: 1, nom: '', club: '', category: 1 });

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchRiders() {
  loading.value = true;
  formError.value = '';
  try {
    const res = await ridersApi.list(search.value || undefined);
    riders.value = res.data;
  } catch {
    formError.value = 'Impossible de charger les coureurs.';
  } finally {
    loading.value = false;
  }
}

function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void fetchRiders(), 300);
}

async function onCsvFile(ev: Event) {
  importMessage.value = '';
  formError.value = '';
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  loading.value = true;
  try {
    const csvText = await file.text();
    const res = await ridersApi.importCsv(csvText);
    importMessage.value = res.message;
    await fetchRiders();
  } catch (e: unknown) {
    const msg = axios.isAxiosError(e)
      ? (e.response?.data as { error?: string } | undefined)?.error
      : null;
    formError.value = msg || "Impossible d'importer le CSV.";
  } finally {
    loading.value = false;
    input.value = '';
  }
}

async function addRider() {
  formError.value = '';
  importMessage.value = '';
  loading.value = true;
  try {
    await ridersApi.create({
      numero: form.value.numero,
      nom: form.value.nom.trim(),
      club: form.value.club.trim(),
      category: form.value.category
    });
    form.value = { numero: 1, nom: '', club: '', category: 1 };
    await fetchRiders();
  } catch (e: unknown) {
    const msg = axios.isAxiosError(e)
      ? (e.response?.data as { error?: string } | undefined)?.error
      : null;
    formError.value = msg || "Impossible d'ajouter le coureur.";
  } finally {
    loading.value = false;
  }
}

async function removeRider(id: string) {
  if (!confirm('Supprimer ce coureur ?')) return;
  await ridersApi.remove(id);
  await fetchRiders();
}

function goResultats() {
  void router.push({ name: 'resultats-acquisition' });
}

onMounted(() => void fetchRiders());
</script>
