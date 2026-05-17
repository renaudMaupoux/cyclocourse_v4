import axios, { type AxiosInstance } from 'axios'
import type {
  NumberSingleResponse,
  NumbersListResponse,
  VoiceRecognizeResponse,
} from '@/types/number'
import type { Rider, RiderRankingResponse, RidersListResponse } from '@/types/rider'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      console.error('Erreur API:', error.response?.data || error.message)
    } else {
      console.error('Erreur API:', error)
    }
    return Promise.reject(error)
  }
)

export const numbersApi = {
  getAll: async (): Promise<NumbersListResponse> => {
    const response = await apiClient.get<NumbersListResponse>('/numbers')
    return response.data
  },

  getById: async (id: string): Promise<NumberSingleResponse> => {
    const response = await apiClient.get<NumberSingleResponse>(`/numbers/${id}`)
    return response.data
  },

  update: async (id: string, value: number): Promise<NumberSingleResponse> => {
    const response = await apiClient.put<NumberSingleResponse>(`/numbers/${id}`, { value })
    return response.data
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/numbers/${id}`)
    return response.data
  },

  reset: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>('/numbers/reset')
    return response.data
  },
}

export const ridersApi = {
  list: async (search?: string): Promise<RidersListResponse> => {
    const response = await apiClient.get<RidersListResponse>('/riders', {
      params: search ? { search } : undefined,
    })
    return response.data
  },

  create: async (
    payload: Pick<Rider, 'numero' | 'nom' | 'category'> & { club?: string }
  ): Promise<{ success: boolean; data: Rider }> => {
    const response = await apiClient.post<{ success: boolean; data: Rider }>('/riders', payload)
    return response.data
  },

  importCsv: async (
    csvText: string
  ): Promise<{ success: boolean; imported: number; message: string }> => {
    const response = await apiClient.post<{ success: boolean; imported: number; message: string }>(
      '/riders/import-csv',
      { csvText }
    )
    return response.data
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/riders/${id}`)
    return response.data
  },

  ranking: async (): Promise<RiderRankingResponse> => {
    const response = await apiClient.get<RiderRankingResponse>('/riders/ranking')
    return response.data
  },
}

export const voiceApi = {
  recognizeText: async (text: string, confidence?: number): Promise<VoiceRecognizeResponse> => {
    const payload: { text: string; confidence?: number } = { text }
    if (typeof confidence === 'number') {
      payload.confidence = confidence
    }
    const response = await apiClient.post<VoiceRecognizeResponse>('/voice/recognize-text', payload, {
      timeout: 15000,
    })
    return response.data
  },
}

export default apiClient
