import { LogOut, Trophy } from 'lucide-react'
import type { StudentSession } from '../lib/storage'

type Props = {
  session: StudentSession
  completedCount: number
  totalMissions: number
  onChangeStudent: () => void
}

export function Header({ session, completedCount, totalMissions, onChangeStudent }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-arena-border bg-arena-panel/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="font-display text-xl font-extrabold tracking-tight">
          <span className="text-arena-accent">SQL</span>
          <span className="text-arena-text"> Arena</span>
        </div>
        <span className="hidden text-sm text-arena-muted sm:inline">
          E-Sports & Streaming · PostgreSQL en el navegador
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-arena-border bg-arena-elevated px-3 py-1.5 text-sm">
          <Trophy className="h-4 w-4 text-arena-warn" />
          <span>
            {completedCount}/{totalMissions} misiones
          </span>
        </div>
        <div className="text-sm text-arena-muted">
          <span className="font-medium text-arena-text">{session.nombre}</span>
          <span className="mx-1.5 text-arena-border">·</span>
          C.I. {session.ci}
        </div>
        <button
          type="button"
          onClick={onChangeStudent}
          className="inline-flex items-center gap-1.5 rounded-lg border border-arena-border px-3 py-1.5 text-sm text-arena-muted transition hover:border-arena-danger/50 hover:text-arena-danger"
        >
          <LogOut className="h-4 w-4" />
          Cambiar Estudiante
        </button>
      </div>
    </header>
  )
}
