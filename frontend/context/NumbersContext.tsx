'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import type { NumberEntry } from '@/types/number'
import { numbersApi } from '@/services/api'
import { websocketService } from '@/services/websocket'

interface NumbersContextType {
  numbers: NumberEntry[]
  loading: boolean
  error: string | null
  isRecording: boolean
  wsConnected: boolean
  sortedNumbers: NumberEntry[]
  numbersByConfidence: {
    high: NumberEntry[]
    medium: NumberEntry[]
    low: NumberEntry[]
  }
  totalNumbers: number
  editedNumbers: NumberEntry[]
  fetchNumbers: () => Promise<void>
  updateNumber: (id: string, value: number) => Promise<void>
  deleteNumber: (id: string) => Promise<void>
  resetNumbers: () => Promise<void>
  addNumber: (number: NumberEntry) => void
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  startRecognition: () => void
  stopRecognition: () => void
}

const NumbersContext = createContext<NumbersContextType | null>(null)

export function NumbersProvider({ children }: { children: ReactNode }) {
  const [numbers, setNumbers] = useState<NumberEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)

  const sortedNumbers = useMemo(
    () => [...numbers].sort((a, b) => (new Date(b.timestamp || 0).getTime()) - (new Date(a.timestamp || 0).getTime())),
    [numbers]
  )

  const numbersByConfidence = useMemo(() => {
    const high: NumberEntry[] = []
    const medium: NumberEntry[] = []
    const low: NumberEntry[] = []

    numbers.forEach((num) => {
      if (num.confidence >= 0.9) high.push(num)
      else if (num.confidence >= 0.7) medium.push(num)
      else low.push(num)
    })

    return { high, medium, low }
  }, [numbers])

  const totalNumbers = useMemo(() => numbers.length, [numbers])

  const editedNumbers = useMemo(() => numbers.filter((n) => n.isEdited), [numbers])

  const fetchNumbers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await numbersApi.getAll()
      setNumbers(response.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateNumber = useCallback(async (id: string, value: number) => {
    try {
      setError(null)
      const response = await numbersApi.update(id, value)
      setNumbers((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...response.data, isEdited: true }
            : n
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(message)
    }
  }, [])

  const deleteNumber = useCallback(async (id: string) => {
    try {
      setError(null)
      await numbersApi.delete(id)
      setNumbers((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(message)
    }
  }, [])

  const resetNumbers = useCallback(async () => {
    try {
      setError(null)
      await numbersApi.reset()
      setNumbers([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation'
      setError(message)
    }
  }, [])

  const addNumber = useCallback((number: NumberEntry) => {
    setNumbers((prev) => [number, ...prev])
  }, [])

  const connectWebSocket = useCallback(() => {
    websocketService.connect()
    setWsConnected(true)

    websocketService.on('number-detected', (data: unknown) => {
      if (data && typeof data === 'object' && 'id' in data) {
        addNumber(data as NumberEntry)
      }
    })

    websocketService.on('number-updated', (data: unknown) => {
      if (data && typeof data === 'object' && 'id' in data) {
        const updated = data as NumberEntry
        setNumbers((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n))
        )
      }
    })

    websocketService.on('number-deleted', (data: unknown) => {
      if (data && typeof data === 'object' && 'id' in data) {
        const { id } = data as { id: string }
        setNumbers((prev) => prev.filter((n) => n.id !== id))
      }
    })

    websocketService.on('numbers-reset', () => {
      setNumbers([])
    })

    websocketService.on('recognition-error', (data: unknown) => {
      console.error('Erreur de reconnaissance WebSocket:', data)
    })
  }, [addNumber])

  const disconnectWebSocket = useCallback(() => {
    websocketService.disconnect()
    setWsConnected(false)
  }, [])

  const startRecognition = useCallback(() => {
    setIsRecording(true)
    websocketService.startRecognition()
  }, [])

  const stopRecognition = useCallback(() => {
    setIsRecording(false)
    websocketService.stopRecognition()
  }, [])

  const value: NumbersContextType = {
    numbers,
    loading,
    error,
    isRecording,
    wsConnected,
    sortedNumbers,
    numbersByConfidence,
    totalNumbers,
    editedNumbers,
    fetchNumbers,
    updateNumber,
    deleteNumber,
    resetNumbers,
    addNumber,
    connectWebSocket,
    disconnectWebSocket,
    startRecognition,
    stopRecognition,
  }

  return <NumbersContext.Provider value={value}>{children}</NumbersContext.Provider>
}

export function useNumbers() {
  const context = useContext(NumbersContext)
  if (!context) {
    throw new Error('useNumbers doit être utilisé dans NumbersProvider')
  }
  return context
}
