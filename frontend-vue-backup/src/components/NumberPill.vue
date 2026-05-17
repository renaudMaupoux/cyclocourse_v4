<template>
  <div
    :class="
      cn(
        'relative inline-flex min-w-[100px] cursor-pointer select-none items-center rounded-full border-2 px-4 py-3 text-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        getConfidenceTwClasses(number.confidence),
        isEditing && 'ring-2 ring-primary ring-offset-2',
        number.isEdited && 'border-dashed'
      )
    "
    role="button"
    tabindex="0"
    :aria-label="`Chiffre ${number.value}, confiance ${(number.confidence * 100).toFixed(0)}%`"
    @click="startEdit"
    @keydown.enter.prevent="startEdit"
  >
    <div class="flex w-full items-center gap-3">
      <input
        v-if="isEditing"
        ref="inputRef"
        v-model.number="editValue"
        type="number"
        min="1"
        max="1000"
        class="w-20 rounded-lg border-2 border-current bg-background px-2 py-1 text-center text-xl font-semibold text-foreground [appearance:textfield] focus:ring-2 focus:ring-ring [&::-webkit-inner-spin-button]:opacity-100"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.esc="cancelEdit"
      />
      <span v-else class="flex-1 text-center text-xl">{{ number.value }}</span>

      <div class="flex items-center gap-2">
        <span
          class="rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium dark:bg-white/10"
          :title="`Confiance : ${(number.confidence * 100).toFixed(1)}%`"
        >
          {{ (number.confidence * 100).toFixed(0) }}%
        </span>
        <button
          v-if="!isEditing"
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-lg leading-none transition hover:bg-destructive/20 hover:text-destructive dark:bg-white/10"
          aria-label="Supprimer"
          @click.stop="$emit('delete', number.id)"
        >
          ×
        </button>
      </div>
    </div>

    <div
      v-if="number.isEdited"
      class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-sm shadow-md ring-1 ring-border"
      title="Modifié manuellement"
    >
      ✏️
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { cn } from '@/lib/utils';
import { getConfidenceTwClasses } from '@/config/pillConfig';
import type { NumberEntry } from '@/types/number';

const props = defineProps<{
  number: NumberEntry;
}>();

const emit = defineEmits<{
  update: [id: string, value: number];
  delete: [id: string];
}>();

const isEditing = ref(false);
const editValue = ref(props.number.value);
const inputRef = ref<HTMLInputElement | null>(null);

const startEdit = () => {
  isEditing.value = true;
  editValue.value = props.number.value;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

const saveEdit = () => {
  if (editValue.value >= 1 && editValue.value <= 1000 && editValue.value !== props.number.value) {
    emit('update', props.number.id, editValue.value);
  }
  isEditing.value = false;
};

const cancelEdit = () => {
  editValue.value = props.number.value;
  isEditing.value = false;
};
</script>
