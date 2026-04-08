<template>
  <Card class="border-white/20 bg-card/95 shadow-xl backdrop-blur">
    <CardHeader class="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <CardTitle class="text-xl text-card-foreground">Chiffres détectés</CardTitle>
      <Button variant="destructive" size="sm" :disabled="numbers.length === 0" @click="$emit('reset')">
        <Trash2 class="h-4 w-4" />
        Réinitialiser
      </Button>
    </CardHeader>
    <CardContent class="space-y-6 pt-6">
      <div class="flex flex-wrap gap-2 md:gap-3">
        <Badge variant="secondary" class="text-foreground">
          Total <span class="ml-1 font-bold text-primary">{{ numbers.length }}</span>
        </Badge>
        <Badge variant="outline" class="border-blue-300 text-blue-700 dark:text-blue-300">
          Haute
          <span class="ml-1 font-bold">{{ stats.high }}</span>
        </Badge>
        <Badge variant="outline" class="border-amber-300 text-amber-800 dark:text-amber-200">
          Moyenne
          <span class="ml-1 font-bold">{{ stats.medium }}</span>
        </Badge>
        <Badge variant="outline" class="border-red-300 text-red-700 dark:text-red-300">
          Faible
          <span class="ml-1 font-bold">{{ stats.low }}</span>
        </Badge>
        <Badge variant="outline" class="border-purple-300 text-purple-800 dark:text-purple-200">
          Édités
          <span class="ml-1 font-bold">{{ stats.edited }}</span>
        </Badge>
      </div>

      <div
        v-if="numbers.length === 0"
        class="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 py-16 text-center"
      >
        <div class="mb-3 text-5xl">🎤</div>
        <p class="text-lg font-medium text-muted-foreground">Aucun chiffre détecté</p>
        <p class="mt-1 text-sm text-muted-foreground">Utilisez la reconnaissance vocale ci-dessus</p>
      </div>

      <div v-else class="flex max-w-5xl flex-wrap gap-3">
        <NumberPill
          v-for="number in numbers"
          :key="number.id"
          :number="number"
          @update="handleUpdate"
          @delete="handleDelete"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import NumberPill from './NumberPill.vue';
import Card from './ui/card/Card.vue';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';
import CardContent from './ui/card/CardContent.vue';
import Button from './ui/button/Button.vue';
import Badge from './ui/badge/Badge.vue';
import type { NumberEntry } from '@/types/number';

const props = defineProps<{
  numbers: NumberEntry[];
}>();

const emit = defineEmits<{
  update: [id: number, value: number];
  delete: [id: number];
  reset: [];
}>();

const stats = computed(() => ({
  high: props.numbers.filter((n) => n.confidence >= 0.9).length,
  medium: props.numbers.filter((n) => n.confidence >= 0.7 && n.confidence < 0.9).length,
  low: props.numbers.filter((n) => n.confidence < 0.7).length,
  edited: props.numbers.filter((n) => n.isEdited).length
}));

const handleUpdate = (id: number, value: number) => emit('update', id, value);
const handleDelete = (id: number) => emit('delete', id);
</script>
