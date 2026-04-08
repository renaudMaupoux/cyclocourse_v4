<script setup lang="ts">
import { computed } from 'vue';
import type { ClassValue } from 'clsx';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'destructive';
    class?: ClassValue;
  }>(),
  {
    variant: 'default',
    class: ''
  }
);

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const classes = computed(() => cn(alertVariants({ variant: props.variant }), props.class));
</script>

<template>
  <div role="alert" :class="classes">
    <slot />
  </div>
</template>
