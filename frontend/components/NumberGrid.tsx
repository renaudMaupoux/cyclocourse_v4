'use client'

import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NumberPill } from './NumberPill'
import type { NumberEntry } from '@/types/number'

interface NumberGridProps {
  numbers: NumberEntry[]
  onUpdate: (id: string, value: number) => void
  onDelete: (id: string) => void
  onReset: () => void
}

export function NumberGrid({ numbers, onUpdate, onDelete, onReset }: NumberGridProps) {
  const stats = useMemo(
    () => ({
      high: numbers.filter((n) => n.confidence >= 0.9).length,
      medium: numbers.filter((n) => n.confidence >= 0.7 && n.confidence < 0.9).length,
      low: numbers.filter((n) => n.confidence < 0.7).length,
      edited: numbers.filter((n) => n.isEdited).length,
    }),
    [numbers]
  )

  return (
    <Card className="border-white/20 bg-card/95 shadow-xl backdrop-blur">
      <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl text-card-foreground">Chiffres détectés</CardTitle>
        <Button
          variant="destructive"
          size="sm"
          disabled={numbers.length === 0}
          onClick={onReset}
        >
          <Trash2 className="h-4 w-4" />
          Réinitialiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Badge variant="secondary" className="text-foreground">
            Total <span className="ml-1 font-bold text-primary">{numbers.length}</span>
          </Badge>
          <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
            Haute
            <span className="ml-1 font-bold">{stats.high}</span>
          </Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-800 dark:text-amber-200">
            Moyenne
            <span className="ml-1 font-bold">{stats.medium}</span>
          </Badge>
          <Badge variant="outline" className="border-red-300 text-red-700 dark:text-red-300">
            Faible
            <span className="ml-1 font-bold">{stats.low}</span>
          </Badge>
          <Badge variant="outline" className="border-purple-300 text-purple-800 dark:text-purple-200">
            Édités
            <span className="ml-1 font-bold">{stats.edited}</span>
          </Badge>
        </div>

        {numbers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 py-16 text-center">
            <div className="mb-3 text-5xl">🎤</div>
            <p className="text-lg font-medium text-muted-foreground">Aucun chiffre détecté</p>
            <p className="mt-1 text-sm text-muted-foreground">Utilisez la reconnaissance vocale ci-dessus</p>
          </div>
        ) : (
          <div className="flex max-w-5xl flex-wrap gap-3">
            {numbers.map((number) => (
              <NumberPill
                key={number.id}
                number={number}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
