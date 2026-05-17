import type { Metadata } from 'next'
import { NumbersProvider } from '@/context/NumbersContext'
import { BurgerMenu } from '@/components/BurgerMenu'
import './globals.css'

export const metadata: Metadata = {
  title: 'CycloCourse v4 - Reconnaissance Vocale',
  description: 'Application de reconnaissance vocale pour détection de chiffres',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NumbersProvider>
          <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-white">🚴 CycloCourse</div>
              </div>
              <BurgerMenu />
            </div>
          </header>

          <main className="min-h-[calc(100vh-var(--header-height))]">{children}</main>

          <footer className="border-t border-white/10 bg-slate-950 py-6 text-center text-sm text-white/60">
            <p>Web Speech API · React · Express · Tailwind</p>
          </footer>
        </NumbersProvider>
      </body>
    </html>
  )
}
