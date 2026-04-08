import axios, { type AxiosInstance } from 'axios';
import type {
  NumberEntry,
  NumberSingleResponse,
  NumbersListResponse,
  VoiceRecognizeResponse
} from '@/types/number';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      console.error('Erreur API:', error.response?.data || error.message);
    } else {
      console.error('Erreur API:', error);
    }
    return Promise.reject(error);
  }
);

export const numbersApi = {
  getAll: async (): Promise<NumbersListResponse> => {
    const response = await apiClient.get<NumbersListResponse>('/numbers');
    return response.data;
  },

  getById: async (id: number): Promise<NumberSingleResponse> => {
    const response = await apiClient.get<NumberSingleResponse>(`/numbers/${id}`);
    return response.data;
  },

  update: async (id: number, value: number): Promise<NumberSingleResponse> => {
    const response = await apiClient.put<NumberSingleResponse>(`/numbers/${id}`, { value });
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/numbers/${id}`);
    return response.data;
  },

  reset: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>('/numbers/reset');
    return response.data;
  }
};

/** Phase 1 : texte issu du Web Speech API → extraction des chiffres côté serveur */
export const voiceApi = {
  recognizeText: async (text: string, confidence?: number): Promise<VoiceRecognizeResponse> => {
    const payload: { text: string; confidence?: number } = { text };
    if (typeof confidence === 'number') {
      payload.confidence = confidence;
    }
    const response = await apiClient.post<VoiceRecognizeResponse>('/voice/recognize-text', payload, {
      timeout: 15000
    });
    return response.data;
  }
};

export default apiClient;
