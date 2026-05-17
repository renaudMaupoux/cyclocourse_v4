'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getConfidenceTwClasses } from '@/config/pillConfig'
import type { NumberEntry } from '@/types/number'

interface NumberPillProps {
  number: NumberEntry
  onUpdate: (id: string, value: number) => void
  onDelete: (id: string) => void
}

export function NumberPill({ number, onUpdate, onDelete }: NumberPillProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(number.value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const startEdit = () => {
    setIsEditing(true)
    setEditValue(number.value)
  }

  const saveEdit = () => {
    if (editValue >= 1 && editValue <= 1000 && editValue !== number.value) {
      onUpdate(number.id, editValue)
    }
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditValue(number.value)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'relative inline-flex min-w-[100px] cursor-pointer select-none items-center rounded-full border-2 px-4 py-3 text-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        getConfidenceTwClasses(number.confidence),
        isEditing && 'ring-2 ring-primary ring-offset-2',
        number.isEdited && 'border-dashed'
      )}
      role="button"
      tabIndex={0}
      aria-label={`Chiffre ${number.value}, confiance ${(number.confidence * 100).toFixed(0)}%`}
      onClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          startEdit()
        }
      }}
    >
      <div className="flex w-full items-center gap-3">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            min="1"
            max="1000"
            value={editValue}
            onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="w-20 rounded-lg border-2 border-current bg-background px-2 py-1 text-center text-xl font-semibold text-foreground [appearance:textfield] focus:ring-2 focus:ring-ring [&::-webkit-inner-spin-button]:opacity-100"
          />
        ) : (
          <span className="flex-1 text-center text-xl">{number.value}</span>
        )}

        <div className="flex items-center gap-2">
          <span
            className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium dark:bg-white/10"
            title={`Confiance : ${(number.confidence * 100).toFixed(1)}%`}
          >
            {(number.confidence * 100).toFixed(0)}%
          </span>
          {!isEditing && (
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-lg leading-none transition hover:bg-destructive/20 hover:text-destructive dark:bg-white/10"
              aria-label="Supprimer"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(number.id)
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {number.isEdited && (
        <div
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-sm shadow-md ring-1 ring-border"
          title="Modifié manuellement"
        >
          ✏️
        </div>
      )}
    </div>
  )
}
