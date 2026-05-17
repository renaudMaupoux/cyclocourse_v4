<template>
  <div class="mx-auto max-w-4xl px-4 py-8 md:px-6">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white md:text-3xl">Résultats — ordre d’acquisition</h2>
        <p class="mt-2 text-sm text-white/80">
          Classement selon la date du premier enregistrement du dossard (reconnaissance vocale). Sans passage
          encore : en bas de liste.
        </p>
      </div>
      <Button type="button" variant="secondary" @click="load">Actualiser</Button>
    </div>

    <div class="rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
      <div v-if="loading" class="py-10 text-center text-muted-foreground">Chargement…</div>
      <table v-else class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-border text-muted-foreground">
            <th class="pb-2 pr-2">Rang</th>
            <th class="pb-2 pr-2">Dossard</th>
            <th class="pb-2 pr-2">Nom</th>
            <th class="pb-2 pr-2">Club</th>
            <th class="pb-2 pr-2">Cat.</th>
            <th class="pb-2">1er passage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-b border-border/60">
            <td class="py-2 pr-2 font-semibold text-primary">{{ row.rank }}</td>
            <td class="py-2 pr-2 font-mono">{{ row.numero }}</td>
            <td class="py-2 pr-2">{{ row.nom }}</td>
            <td class="py-2 pr-2 text-muted-foreground">{{ row.club || '—' }}</td>
            <td class="py-2 pr-2">{{ row.category }}</td>
            <td class="py-2 text-muted-foreground">
              {{ row.firstAcquisitionAt ? formatDate(row.firstAcquisitionAt) : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!loading && !rows.length" class="py-8 text-center text-muted-foreground">Aucun coureur en base</p>
    </div>

    <p v-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ridersApi } from '@/services/api';
import type { RiderRankingRow } from '@/types/rider';
import Button from '@/components/ui/button/Button.vue';

const rows = ref<RiderRankingRow[]>([]);
const loading = ref(false);
const error = ref('');

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return iso;
  }
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await ridersApi.ranking();
    rows.value = res.data;
  } catch {
    error.value = 'Impossible de charger le classement.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => void load());
</script>
