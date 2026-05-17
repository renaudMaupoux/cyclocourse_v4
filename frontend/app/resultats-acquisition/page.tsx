'use client'

import { useState, useEffect } from 'react'
import { ridersApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import type { RiderRankingRow } from '@/types/rider'

export default function ResultatsAcquisitionPage() {
  const [rows, setRows] = useState<RiderRankingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
    } catch {
      return iso
    }
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await ridersApi.ranking()
      setRows(res.data)
    } catch {
      setError('Impossible de charger le classement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">Résultats — ordre d'acquisition</h2>
          <p className="mt-2 text-sm text-white/80">
            Classement selon la date du premier enregistrement du dossard (reconnaissance vocale). Sans passage
            encore : en bas de liste.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={load}>
          Actualiser
        </Button>
      </div>

      <div className="rounded-xl border border-white/15 bg-card/90 p-4 shadow-lg backdrop-blur">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 pr-2">Rang</th>
                <th className="pb-2 pr-2">Dossard</th>
                <th className="pb-2 pr-2">Nom</th>
                <th className="pb-2 pr-2">Club</th>
                <th className="pb-2 pr-2">Cat.</th>
                <th className="pb-2">1er passage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-semibold text-primary">{row.rank}</td>
                  <td className="py-2 pr-2 font-mono">{row.numero}</td>
                  <td className="py-2 pr-2">{row.nom}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{row.club || '—'}</td>
                  <td className="py-2 pr-2">{row.category}</td>
                  <td className="py-2 text-muted-foreground">
                    {mounted && row.firstAcquisitionAt ? formatDate(row.firstAcquisitionAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !rows.length && <p className="py-8 text-center text-muted-foreground">Aucun coureur en base</p>}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  )
}
