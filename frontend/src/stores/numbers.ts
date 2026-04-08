import { defineStore } from 'pinia';
import { numbersApi } from '@/services/api';
import websocketService from '@/services/websocket';
import type { NumberEntry } from '@/types/number';

export const useNumbersStore = defineStore('numbers', {
  state: () => ({
    numbers: [] as NumberEntry[],
    loading: false,
    error: null as string | null,
    isRecording: false,
    wsConnected: false
  }),

  getters: {
    sortedNumbers: (state): NumberEntry[] => {
      return [...state.numbers].sort(
        (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
      );
    },

    numbersByConfidence: (state) => {
      return {
        high: state.numbers.filter((n) => n.confidence >= 0.9),
        medium: state.numbers.filter((n) => n.confidence >= 0.7 && n.confidence < 0.9),
        low: state.numbers.filter((n) => n.confidence < 0.7)
      };
    },

    totalNumbers: (state): number => state.numbers.length,

    editedNumbers: (state): NumberEntry[] => state.numbers.filter((n) => n.isEdited)
  },

  actions: {
    async fetchNumbers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await numbersApi.getAll();
        this.numbers = response.data || [];
        console.log(`✅ ${this.numbers.length} chiffre(s) chargé(s)`);
      } catch (error) {
        this.error = 'Erreur lors du chargement des chiffres';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async updateNumber(id: number, value: number) {
      try {
        const response = await numbersApi.update(id, value);

        const index = this.numbers.findIndex((n) => n.id === id);
        if (index !== -1) {
          this.numbers[index] = { ...this.numbers[index], ...response.data };
        }

        console.log(`✅ Chiffre ${id} mis à jour: ${value}`);
      } catch (error) {
        this.error = 'Erreur lors de la mise à jour du chiffre';
        console.error(error);
        throw error;
      }
    },

    async deleteNumber(id: number) {
      try {
        await numbersApi.delete(id);

        const index = this.numbers.findIndex((n) => n.id === id);
        if (index !== -1) {
          this.numbers.splice(index, 1);
        }

        console.log(`✅ Chiffre ${id} supprimé`);
      } catch (error) {
        this.error = 'Erreur lors de la suppression du chiffre';
        console.error(error);
        throw error;
      }
    },

    async resetNumbers() {
      try {
        await numbersApi.reset();
        this.numbers = [];
        console.log('✅ Tous les chiffres ont été supprimés');
      } catch (error) {
        this.error = 'Erreur lors de la réinitialisation';
        console.error(error);
        throw error;
      }
    },

    addNumber(number: NumberEntry) {
      this.numbers.unshift(number);
    },

    connectWebSocket() {
      websocketService.connect();

      websocketService.on('number-detected', (data) => {
        this.addNumber(data as NumberEntry);
      });

      websocketService.on('number-updated', (data) => {
        const payload = data as NumberEntry;
        const index = this.numbers.findIndex((n) => n.id === payload.id);
        if (index !== -1) {
          this.numbers[index] = { ...this.numbers[index], ...payload };
        }
      });

      websocketService.on('number-deleted', (data) => {
        const payload = data as { id: number };
        const index = this.numbers.findIndex((n) => n.id === payload.id);
        if (index !== -1) {
          this.numbers.splice(index, 1);
        }
      });

      websocketService.on('numbers-reset', () => {
        this.numbers = [];
      });

      this.wsConnected = true;
    },

    disconnectWebSocket() {
      websocketService.disconnect();
      this.wsConnected = false;
    },

    startRecognition() {
      this.isRecording = true;
      websocketService.startRecognition();
    },

    stopRecognition() {
      this.isRecording = false;
      websocketService.stopRecognition();
    }
  }
});
