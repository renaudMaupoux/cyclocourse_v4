'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
import { useNumbers } from '@/context/NumbersContext'
import { ridersApi, voiceApi } from '@/services/api'
import { VoiceRecognitionStatus } from '@/components/VoiceRecognitionStatus'
import { NumberGrid } from '@/components/NumberGrid'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { NumberEntry } from '@/types/number'
import type { Rider } from '@/types/rider'

const MANUAL_CONFIDENCE = 0.95
const RIDER_CATEGORIES = [1, 2, 3, 4, 5, 6] as const
const TOUR_FILTER_MAX = 10
const TOUR_FILTER_RANGE = Array.from({ length: TOUR_FILTER_MAX + 1 }, (_, i) => i)

type ToastType = 'success' | 'error' | 'info'

function formatChronoMs(ms: number): string {
  const x = Math.max(0, ms)
  const totalS = Math.floor(x / 1000)
  const h = Math.floor(totalS / 3600)
  const m = Math.floor((totalS % 3600) / 60)
  const s = totalS % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CoursePage() {
  const numbersStore = useNumbers()
  const [notification, setNotification] = useState<{ message: string; type: ToastType } | null>(null)
  const [manualDossard, setManualDossard] = useState<number | null>(null)
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualError, setManualError] = useState('')
  const [raceStartedAt, setRaceStartedAt] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const chronoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setNowTick(Date.now())
    setMounted(true)
  }, [])
  const [riders, setRiders] = useState<Rider[]>([])
  const [ridersLoading, setRidersLoading] = useState(false)
  const [ridersError, setRidersError] = useState('')
  const [sortByDetections, setSortByDetections] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [tourFilter, setTourFilter] = useState<string>('all')

  const raceElapsedFormatted = !mounted || raceStartedAt == null ? '00:00:00' : formatChronoMs(nowTick - raceStartedAt)

  const startCourse = () => {
    if (raceStartedAt != null) return
    const now = Date.now()
    setRaceStartedAt(now)
    if (chronoIntervalRef.current) clearInterval(chronoIntervalRef.current)
    chronoIntervalRef.current = setInterval(() => {
      setNowTick(Date.now())
    }, 250)
  }

  const resetCourse = () => {
    setRaceStartedAt(null)
    if (chronoIntervalRef.current) {
      clearInterval(chronoIntervalRef.current)
      chronoIntervalRef.current = null
    }
  }

  const firstDetectionMsByDossard = useMemo(() => {
    const map = new Map<number, number>()
    for (const n of numbersStore.numbers) {
      const t = new Date(n.timestamp ?? 0).getTime()
      const prev = map.get(n.value)
      if (prev === undefined || t < prev) map.set(n.value, t)
    }
    return map
  }, [numbersStore.numbers])

  const tourCountByDossard = useMemo(() => {
    const map = new Map<number, number>()
    for (const n of numbersStore.numbers) {
      map.set(n.value, (map.get(n.value) ?? 0) + 1)
    }
    return map
  }, [numbersStore.numbers])

  const displayRiders = useMemo(() => {
    const list = [...riders]
    if (!sortByDetections) return list
    const timeMap = firstDetectionMsByDossard
    return list.sort((a, b) => {
      const ta = timeMap.get(a.numero)
      const tb = timeMap.get(b.numero)
      const ia = ta ?? Number.POSITIVE_INFINITY
      const ib = tb ?? Number.POSITIVE_INFINITY
      if (ia !== ib) return ia - ib
      return a.nom.localeCompare(b.nom, 'fr')
    })
  }, [riders, sortByDetections, firstDetectionMsByDossard])

  const matchesTourCountFilter = (passages: number, filter: string): boolean => {
    if (filter === 'all') return true
    const n = parseInt(filter, 10)
    if (Number.isNaN(n)) return true
    if (n === TOUR_FILTER_MAX) return passages >= TOUR_FILTER_MAX
    return passages === n
  }

  const filteredRiders = useMemo(() => {
    const counts = tourCountByDossard
    let list = displayRiders
    if (categoryFilter !== 'all') {
      const cat = parseInt(categoryFilter, 10)
      if (!Number.isNaN(cat)) list = list.filter((r) => r.category === cat)
    }
    if (tourFilter !== 'all') {
      list = list.filter((r) => matchesTourCountFilter(counts.get(r.numero) ?? 0, tourFilter))
    }
    return list
  }, [displayRiders, categoryFilter, tourFilter, tourCountByDossard])

  const showNotification = (message: string, type: ToastType = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const firstPassageTimeLabel = (numero: number) => {
    const ms = firstDetectionMsByDossard.get(numero)
    if (ms == null) return '—'
    return new Date(ms).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris',
    })
  }

  const tourFilterOptionLabel = (n: number): string => {
    if (n === 0) return '0 tour'
    if (n === 1) return '1 tour'
    if (n === TOUR_FILTER_MAX) return `${TOUR_FILTER_MAX} tours ou plus`
    return `${n} tours`
  }

  const emptyFilterMessage = useMemo(() => {
    const hasCategory = categoryFilter !== 'all'
    const hasTours = tourFilter !== 'all'
    if (hasCategory && hasTours) return 'Aucun coureur ne correspond à ces critères.'
    if (hasCategory) return 'Aucun coureur dans cette catégorie.'
    if (hasTours) return 'Aucun coureur avec ce nombre de tours.'
    return 'Aucun résultat.'
  }, [categoryFilter, tourFilter])

  const showRankColumn = sortByDetections || tourFilter !== 'all'

  const toursLabel = (count: number): string => {
    if (count === 1) return '1 tour'
    return `${count} tours`
  }

  const fetchRiders = async () => {
    setRidersLoading(true)
    setRidersError('')
    try {
      const res = await ridersApi.list()
      setRiders(res.data)
    } catch {
      setRidersError('Impossible de charger les coureurs.')
    } finally {
      setRidersLoading(false)
    }
  }

  const toastClass = (type: ToastType) => {
    const base = 'rounded-xl px-6 py-4 font-semibold shadow-lg ring-1 ring-black/5'
    if (type === 'success') return `${base} bg-emerald-600 text-white`
    if (type === 'error') return `${base} bg-red-600 text-white`
    return `${base} bg-primary text-primary-foreground`
  }

  const handleRecognitionSuccess = async (numbers: NumberEntry[]) => {
    showNotification(`${numbers.length} chiffre(s) détecté(s)`, 'success')
    await numbersStore.fetchNumbers()
  }

  const handleRecognitionError = (error: string) => {
    showNotification(error, 'error')
  }

  const submitManualDossard = async (e: React.FormEvent) => {
    e.preventDefault()
    setManualError('')
    const n = manualDossard
    if (n == null || Number.isNaN(n) || n < 1 || n > 1000) {
      setManualError('Indiquez un dossard entre 1 et 1000.')
      return
    }
    setManualSubmitting(true)
    try {
      const text = String(n)
      const response = await voiceApi.recognizeText(text, MANUAL_CONFIDENCE)
      if (response.success && response.data?.length) {
        showNotification(`Dossard ${n} enregistré`, 'success')
        await numbersStore.fetchNumbers()
        setManualDossard(null)
      } else {
        setManualError('Aucun dossard valide enregistré (vérifiez la plage 1–1000).')
      }
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string } | undefined)?.error || e.message
        : 'Erreur réseau'
      setManualError(typeof msg === 'string' ? msg : 'Impossible d\'enregistrer le dossard.')
    } finally {
      setManualSubmitting(false)
    }
  }

  useEffect(() => {
    numbersStore.connectWebSocket()
    Promise.all([numbersStore.fetchNumbers(), fetchRiders()]).then(() => {
      showNotification('Page course prête', 'success')
    })

    return () => {
      resetCourse()
      numbersStore.disconnectWebSocket()
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold text-white md:text-3xl">Course — Reconnaissance vocale</h2>
        <p className="mt-1 text-sm text-white/80">Détection et édition des dossards 1 à 1000</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2 xl:items-start xl:gap-10">
        <div className="min-w-0 space-y-8">
          <Card className="border-white/20 bg-card/95 shadow-xl backdrop-blur">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg text-card-foreground">Course</CardTitle>
              <p className="text-sm text-muted-foreground">
                Démarrez le chronomètre au lancement réel de la course (affichage temps écoulé).
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Temps écoulé</p>
                <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {raceElapsedFormatted}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {raceStartedAt == null ? (
                  <Button type="button" className="min-w-[10rem]" onClick={startCourse}>
                    Démarrer la course
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={resetCourse}>
                    Réinitialiser le chrono
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
            <VoiceRecognitionStatus
              wsConnected={numbersStore.wsConnected}
              embedded
              onRecognitionSuccess={handleRecognitionSuccess}
              onRecognitionError={handleRecognitionError}
            />

            <Card className="flex h-full min-h-0 flex-col border-white/20 bg-card/95 shadow-xl backdrop-blur">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg text-card-foreground">Saisie manuelle</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Entrez un numéro entre 1 et 1000 pour l'enregistrer comme un passage.
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-6">
                <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={submitManualDossard}>
                  <div className="flex-1">
                    <label htmlFor="manual-dossard" className="mb-1 block text-xs font-medium text-muted-foreground">
                      Numéro de dossard
                    </label>
                    <input
                      id="manual-dossard"
                      type="number"
                      min="1"
                      max="1000"
                      required
                      placeholder="ex. 42"
                      value={manualDossard ?? ''}
                      onChange={(e) => setManualDossard(parseInt(e.target.value, 10) || null)}
                      disabled={manualSubmitting}
                      className="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </div>
                  <Button type="submit" disabled={manualSubmitting}>
                    {manualSubmitting ? 'Envoi…' : 'Enregistrer le dossard'}
                  </Button>
                </form>
                {!numbersStore.wsConnected && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    WebSocket déconnecté : les mises à jour temps réel peuvent être retardées.
                  </p>
                )}
                {manualError && <p className="mt-2 text-sm text-destructive">{manualError}</p>}
              </CardContent>
            </Card>
          </div>

          <NumberGrid
            numbers={numbersStore.sortedNumbers}
            onUpdate={numbersStore.updateNumber}
            onDelete={numbersStore.deleteNumber}
            onReset={numbersStore.resetNumbers}
          />
        </div>

        <aside className="min-w-0 w-full xl:sticky xl:top-6 xl:self-start" aria-label="Liste des coureurs">
          <Card className="border-white/20 bg-card/95 shadow-xl backdrop-blur">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg text-card-foreground">Coureurs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Après validation, l'ordre suit le <strong className="font-medium text-foreground">premier passage</strong> détecté par dossard.
              </p>
              <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label htmlFor="rider-category-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Filtrer par catégorie
                  </label>
                  <select
                    id="rider-category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="all">Toutes les catégories</option>
                    {RIDER_CATEGORIES.map((c) => (
                      <option key={c} value={String(c)}>
                        Catégorie {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="rider-tour-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Filtrer par nombre de tours
                  </label>
                  <select
                    id="rider-tour-filter"
                    value={tourFilter}
                    onChange={(e) => setTourFilter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="all">Tous</option>
                    {TOUR_FILTER_RANGE.map((n) => (
                      <option key={n} value={String(n)}>
                        {tourFilterOptionLabel(n)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  disabled={ridersLoading || !riders.length}
                  onClick={() => {
                    setSortByDetections(true)
                    showNotification('Liste réordonnée selon les détections (premier passage par dossard).', 'success')
                  }}
                >
                  Valider l'ordre des détections
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {ridersLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Chargement des coureurs…</div>
              ) : ridersError ? (
                <p className="text-sm text-destructive">{ridersError}</p>
              ) : (
                <div className="max-h-[min(70vh,40rem)] overflow-y-auto pr-1">
                  <ul className="space-y-2 text-sm">
                    {filteredRiders.map((r, index) => (
                      <li key={r.id} className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
                        <div className="flex gap-3">
                          <div className="flex w-12 shrink-0 flex-col items-end gap-0.5 sm:w-14">
                            {showRankColumn && (
                              <span className="text-xs font-medium leading-none text-muted-foreground">
                                {index + 1}
                              </span>
                            )}
                            <span className="font-mono text-base font-semibold leading-none text-primary">
                              {r.numero}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="truncate font-medium text-foreground" title={r.nom}>
                                {r.nom}
                              </span>
                              <div className="flex shrink-0 items-center gap-2 tabular-nums text-xs text-muted-foreground">
                                <span className="min-w-[4.5rem] text-right">{mounted ? firstPassageTimeLabel(r.numero) : '—'}</span>
                                <span className="text-border" aria-hidden="true">
                                  |
                                </span>
                                <span>{toursLabel(tourCountByDossard.get(r.numero) ?? 0)}</span>
                              </div>
                            </div>
                            <p className="mt-1 text-xs leading-snug text-muted-foreground">
                              <span className="whitespace-nowrap">Catégorie {r.category}</span>
                              <span className="mx-1.5 text-border" aria-hidden="true">
                                ·
                              </span>
                              <span className="break-words">{r.club?.trim() ? r.club : '—'}</span>
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {!riders.length ? (
                    <p className="py-4 text-center text-muted-foreground">
                      Aucun coureur — ajoutez-en depuis la page Acquisition.
                    </p>
                  ) : !filteredRiders.length ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">{emptyFilterMessage}</p>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm transition md:bottom-8 md:right-8 ${toastClass(notification.type)}`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}
