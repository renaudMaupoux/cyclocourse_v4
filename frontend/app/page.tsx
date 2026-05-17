import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
      <div className="mb-8 rounded-2xl border border-white/15 bg-card/90 p-8 shadow-xl backdrop-blur">
        <h2 className="mb-4 text-2xl font-bold text-card-foreground md:text-3xl">Logiciel CycloCourse</h2>
        <p className="text-muted-foreground">
          Classement par reconnaissance vocale pour les courses cyclistes — gestion des coureurs, acquisition
          des dossards et suivi des passages.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/acquisition"
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Acquisition
          </Link>
          <Link
            href="/course"
            className="inline-flex rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Lancer la course
          </Link>
        </div>
      </div>
    </div>
  )
}
