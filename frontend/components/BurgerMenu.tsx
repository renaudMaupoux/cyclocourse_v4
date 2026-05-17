'use client'

import { useState } from 'react'
import Link from 'next/link'

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/acquisition', label: 'Acquisition' },
  { href: '/resultats-acquisition', label: 'Résultats acquisition' },
  { href: '/course', label: 'Course' },
] as const

export function BurgerMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative z-50 flex items-center">
      <button
        type="button"
        className="inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-white/20 bg-black/20 text-white hover:bg-white/10 md:h-11 md:w-11"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="block h-0.5 w-5 rounded bg-white" />
        <span className="block h-0.5 w-5 rounded bg-white" />
        <span className="block h-0.5 w-5 rounded bg-white" />
      </button>

      {open && (
        <>
          <ul className="absolute right-0 top-12 z-50 min-w-[220px] flex-col gap-0 rounded-lg border border-white/20 bg-slate-900/95 py-2 shadow-xl backdrop-blur">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
        </>
      )}
    </div>
  )
}
