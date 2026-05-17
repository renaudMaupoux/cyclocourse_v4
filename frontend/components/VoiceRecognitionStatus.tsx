'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Mic, Square } from 'lucide-react'
import axios from 'axios'
import { voiceApi } from '@/services/api'
import { createWebSpeechRecognizer, isWebSpeechSupported, type WebSpeechSession } from '@/services/webSpeechRecognition'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import type { NumberEntry } from '@/types/number'

const WEB_SPEECH_CONFIDENCE = 0.82

interface VoiceRecognitionStatusProps {
  wsConnected?: boolean
  embedded?: boolean
  onRecognitionSuccess: (numbers: NumberEntry[]) => void
  onRecognitionError: (message: string) => void
}

export function VoiceRecognitionStatus({
  wsConnected = false,
  embedded = false,
  onRecognitionSuccess,
  onRecognitionError,
}: VoiceRecognitionStatusProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [webListening, setWebListening] = useState(false)
  const [webInterim, setWebInterim] = useState('')
  const webSessionRef = useRef<WebSpeechSession | null>(null)
  const webSpeechOk = useMemo(() => isWebSpeechSupported(), [])
  const isBusy = uploading || webListening

  useEffect(() => {
    return () => {
      if (webSessionRef.current) {
        webSessionRef.current.stop()
        webSessionRef.current = null
      }
    }
  }, [])

  const applyVoiceResponse = (response: { success: boolean; data: NumberEntry[] }, label: string) => {
    if (response.success && response.data && response.data.length > 0) {
      setLastResult(
        `${label}: ${response.data.length} chiffre(s) — ${response.data.map((n) => n.value).join(', ')}`
      )
      onRecognitionSuccess(response.data)
    } else {
      setLastResult(`${label}: aucun chiffre détecté (1–1000).`)
    }
  }

  const sendTextToApi = async (text: string) => {
    const response = await voiceApi.recognizeText(text, WEB_SPEECH_CONFIDENCE)
    applyVoiceResponse(response, 'Navigateur')
  }

  const startWebSpeech = () => {
    setError(null)
    setWebInterim('')
    try {
      webSessionRef.current = createWebSpeechRecognizer({
        onResult: async (transcript, meta) => {
          if (!meta.final) {
            setWebInterim(transcript)
            return
          }
          setWebInterim('')
          if (!transcript || !wsConnected) return
          setUploading(true)
          try {
            await sendTextToApi(transcript)
          } catch (err: unknown) {
            let msg = 'Erreur envoi texte'
            if (axios.isAxiosError(err)) {
              msg = (err.response?.data as { error?: string })?.error || err.message || msg
            } else if (err instanceof Error) {
              msg = err.message
            }
            setError(msg)
            onRecognitionError(msg)
          } finally {
            setUploading(false)
          }
        },
        onError: (e) => {
          setError(e.message || 'Erreur Web Speech')
          onRecognitionError(e.message || 'Erreur Web Speech')
          setWebListening(false)
        },
        onEnd: () => {
          setWebListening(false)
        },
      })
      webSessionRef.current.start()
      setWebListening(true)
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Impossible de démarrer Web Speech'
      setError(errorMsg)
      onRecognitionError(errorMsg)
    }
  }

  const stopWebSpeech = () => {
    setWebInterim('')
    if (webSessionRef.current) {
      webSessionRef.current.stop()
      webSessionRef.current = null
    }
    setWebListening(false)
  }

  return (
    <div className={embedded ? 'flex h-full w-full flex-col px-1' : 'mx-auto mb-8 max-w-3xl px-1'}>
      <Card
        className={cn(
          embedded && 'flex h-full min-h-0 flex-col',
          'border-white/20 bg-card/95 shadow-xl backdrop-blur transition-shadow',
          wsConnected && 'ring-1 ring-emerald-500/40',
          isBusy && 'ring-2 ring-primary/50'
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <CardTitle className="text-xl text-card-foreground">Reconnaissance vocale (navigateur)</CardTitle>
          <Badge variant={wsConnected ? 'default' : 'destructive'} className="shrink-0">
            {wsConnected ? 'Connecté' : 'Déconnecté'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {!wsConnected && (
            <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
              Connexion au serveur perdue. La sauvegarde des chiffres nécessite l'API.
            </Alert>
          )}

          {error && <Alert variant="destructive">{error}</Alert>}

          <p className="text-sm leading-relaxed text-muted-foreground">
            Reconnaissance via <strong className="text-foreground">Web Speech API</strong> dans le navigateur. Chaque phrase
            est envoyée au serveur pour extraire les chiffres <strong className="text-foreground">1 à 1000</strong>. Préférez
            <strong className="text-foreground"> Chrome</strong> ou <strong className="text-foreground"> Edge</strong>.
          </p>

          <div className="space-y-3">
            {!webSpeechOk ? (
              <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
                Web Speech API indisponible. Utilisez Chrome ou Edge.
              </Alert>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!wsConnected || webListening || uploading}
                    className="gap-2"
                    onClick={startWebSpeech}
                  >
                    <Mic className="h-4 w-4" />
                    Écouter
                  </Button>
                  <Button variant="secondary" disabled={!webListening} className="gap-2" onClick={stopWebSpeech}>
                    <Square className="h-4 w-4" />
                    Arrêter
                  </Button>
                </div>
                {webInterim && (
                  <p className="min-h-[1.25em] text-sm italic text-muted-foreground">… {webInterim}</p>
                )}
                {webListening && (
                  <p className="animate-pulse-soft text-sm font-semibold text-primary">Écoute en cours…</p>
                )}
              </>
            )}
          </div>

          {lastResult && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm dark:bg-primary/10">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Dernier résultat</p>
              <p className="text-foreground">{lastResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
