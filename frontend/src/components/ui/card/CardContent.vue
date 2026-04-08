<script setup lang="ts">
import type { ClassValue } from 'clsx';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: ClassValue;
}>();
</script>

<template>
  <div :class="cn('p-6 pt-0', props.class)">
    <slot />
  </div>
</template>
