<template>
  <div class="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
    <div class="mb-8 rounded-2xl border border-white/15 bg-card/90 p-8 shadow-xl backdrop-blur">
      <h2 class="mb-4 text-2xl font-bold text-card-foreground md:text-3xl">Logiciel CycloCourse</h2>
      <p class="text-muted-foreground">
        Classement par reconnaissance vocale pour les courses cyclistes — gestion des coureurs, acquisition
        des dossards et suivi des passages.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <RouterLink
          to="/acquisition"
          class="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Acquisition
        </RouterLink>
        <RouterLink
          to="/course"
          class="inline-flex rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
        >
          Lancer la course
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
