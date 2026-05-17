import type {
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance,
} from '@/types/web-speech'

export function isWebSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export interface WebSpeechRecognizerOptions {
  onResult?: (transcript: string, meta: { final: boolean }) => void
  onError?: (err: Error) => void
  onEnd?: () => void
}

export interface WebSpeechSession {
  recognition: SpeechRecognitionInstance
  start: () => void
  stop: () => void
  abort: () => void
}

export function createWebSpeechRecognizer(options: WebSpeechRecognizerOptions = {}): WebSpeechSession {
  const { onResult, onError, onEnd } = options
  const SpeechRecognitionCtor: SpeechRecognitionConstructor | undefined =
    window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionCtor) {
    throw new Error('Web Speech API non supportée dans ce navigateur')
  }

  const recognition = new SpeechRecognitionCtor()
  recognition.lang = 'fr-FR'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i]
      const transcript = result[0]?.transcript.trim() ?? ''
      if (!transcript) continue
      onResult?.(transcript, { final: result.isFinal })
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    const err = new Error(event.error || 'speech recognition error')
    onError?.(err)
  }

  recognition.onend = () => {
    onEnd?.()
  }

  return {
    recognition,
    start() {
      try {
        recognition.start()
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)))
      }
    },
    stop() {
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
    },
    abort() {
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
    },
  }
}
