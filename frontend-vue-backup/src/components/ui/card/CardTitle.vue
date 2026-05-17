<script setup lang="ts">
import type { ClassValue } from 'clsx';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: ClassValue;
}>();
</script>

<template>
  <h3 :class="cn('text-2xl font-semibold leading-none tracking-tight', props.class)">
    <slot />
  </h3>
</template>
