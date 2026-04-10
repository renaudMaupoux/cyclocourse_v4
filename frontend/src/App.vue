<template>
  <div
    class="flex min-h-screen flex-col bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 text-foreground"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-card/95 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90 md:px-6"
    >
      <RouterLink to="/" class="text-lg font-bold tracking-tight text-card-foreground md:text-xl">
        CycloCourse
      </RouterLink>
      <BurgerMenu />
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-white/10 bg-black/40 py-5 text-center text-sm text-white/80">
      Web Speech API · Vue 3 · Express · Tailwind
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import BurgerMenu from '@/components/BurgerMenu.vue';
</script>
