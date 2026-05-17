<template>
  <div class="relative z-50 flex items-center">
    <button
      type="button"
      class="inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-white/20 bg-black/20 text-white hover:bg-white/10 md:h-11 md:w-11"
      aria-label="Menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="block h-0.5 w-5 rounded bg-white" />
      <span class="block h-0.5 w-5 rounded bg-white" />
      <span class="block h-0.5 w-5 rounded bg-white" />
    </button>

    <ul
      v-show="open"
      class="absolute right-0 top-12 z-50 min-w-[220px] flex-col gap-0 rounded-lg border border-white/20 bg-slate-900/95 py-2 shadow-xl backdrop-blur"
    >
      <li v-for="link in links" :key="link.to">
        <RouterLink
          :to="link.to"
          class="block px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
          active-class="bg-white/15 text-white"
          @click="open = false"
        >
          {{ link.label }}
        </RouterLink>
      </li>
    </ul>

    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-black/40"
      aria-hidden="true"
      @click="open = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/acquisition', label: 'Acquisition' },
  { to: '/resultats-acquisition', label: 'Résultats acquisition' },
  { to: '/course', label: 'Course' }
] as const;
</script>
