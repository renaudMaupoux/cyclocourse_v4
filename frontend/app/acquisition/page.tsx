'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ridersApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import type { Rider } from '@/types/rider'

export default function AcquisitionPage() {
  const router = useRouter()
  const [riders, setRiders] = useState<Rider[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [form, setForm] = useState({ numero: 1, nom: '', club: '', category: 1 })
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRiders = async (searchTerm?: string) => {
    setLoading(true)
    setFormError('')
    try {
      const res = await ridersApi.list(searchTerm || undefined)
      setRiders(res.data)
    } catch {
      setFormError('Impossible de charger les coureurs.')
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetch = (searchTerm: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchRiders(searchTerm)
    }, 300)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    debouncedFetch(newSearch)
  }

  const onCsvFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    setImportMessage('')
    setFormError('')
    const file = ev.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const csvText = await file.text()
      const res = await ridersApi.importCsv(csvText)
      setImportMessage(res.message)
      await fetchRiders()
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string } | undefined)?.error
        : null
      setFormError(msg || "Impossible d'importer le CSV.")
    } finally {
      setLoading(false)
      ev.target.value = ''
    }
  }

  const addRider = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setImportMessage('')
    setLoading(true)
    try {
      await ridersApi.create({
        numero: form.numero,
        nom: form.nom.trim(),
        club: form.club.trim(),
        category: form.category,
      })
      setForm({ numero: 1, nom: '', club: '', category: 1 })
      await fetchRiders()
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string } | undefined)?.error
        : null
      setFormError(msg || "Impossible d'ajouter le coureur.")
    } finally {
      setLoading(false)
    }
  }

  const removeRider = async (id: string) => {
    if (!confirm('Supprimer ce coureur ?')) return
    await ridersApi.remove(id)
    await fetchRiders()
  }

  const goResultats = () => {
    router.push('/resultats-acquisition')
  }

  useEffect(() => {
    fetchRiders()
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white md:text-3xl">Acquisition des coureurs</h2>
        <p className="mt-2 text-sm text-white/80">
          Import CSV (<code className="rounded bg-black/30 px-1">numero;nom;club;categorie</code>), recherche, ajout
          manuel, puis résultats par ordre d'acquisition des numéros.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
        <h3 className="mb-2 text-sm font-semibold text-card-foreground">Importer un fichier CSV</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Séparateur point-virgule ou virgule. En-têtes :
          <strong> numero</strong>, <strong>nom</strong>, <strong>club</strong> (optionnel),
          <strong> categorie</strong> (1–6).
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onCsvFile}
          className="block w-full max-w-md text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
        />
        {importMessage && <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{importMessage}</p>}
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Filtrer</label>
          <input
            type="search"
            placeholder="Nom, club ou n° de dossard…"
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
          />
        </div>
        <Button type="button" className="shrink-0" onClick={goResultats}>
          Enregistrer et voir les résultats
        </Button>
      </div>

      <div className="mb-8 rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Ajouter un coureur</h3>
        <form className="grid gap-3 md:grid-cols-6" onSubmit={addRider}>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Dossard</label>
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: parseInt(e.target.value, 10) || 1 })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Nom</label>
            <input
              type="text"
              required
              maxLength={200}
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Club</label>
            <input
              type="text"
              maxLength={300}
              placeholder="Optionnel"
              value={form.club}
              onChange={(e) => setForm({ ...form, club: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Cat.</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: parseInt(e.target.value, 10) || 1 })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            >
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-6">
            <Button type="submit" disabled={loading}>
              Ajouter
            </Button>
          </div>
        </form>
        {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
      </div>

      <div className="rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Liste ({riders.length})</h3>
        {loading && !riders.length ? (
          <div className="py-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 pr-2">Dossard</th>
                  <th className="pb-2 pr-2">Nom</th>
                  <th className="pb-2 pr-2">Club</th>
                  <th className="pb-2 pr-2">Cat.</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {riders.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-mono font-semibold text-primary">{r.numero}</td>
                    <td className="py-2 pr-2">{r.nom}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{r.club || '—'}</td>
                    <td className="py-2 pr-2">{r.category}</td>
                    <td className="py-2 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() => removeRider(r.id)}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !riders.length && <p className="py-6 text-center text-muted-foreground">Aucun coureur</p>}
      </div>
    </div>
  )
}
