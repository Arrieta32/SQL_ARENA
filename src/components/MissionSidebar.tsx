import { CheckCircle2, Circle } from 'lucide-react'
import type { Mission } from '../data/missions'

type Props = {
  missions: Mission[]
  activeId: number
  completed: number[]
  onSelect: (id: number) => void
}

export function MissionSidebar({ missions, activeId, completed, onSelect }: Props) {
  return (
    <nav className="space-y-1">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-arena-muted">
        Misiones
      </h2>
      {missions.map((m) => {
        const done = completed.includes(m.id)
        const active = m.id === activeId
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
              active
                ? 'bg-arena-accent/15 text-arena-accent ring-1 ring-arena-accent/40'
                : 'text-arena-text hover:bg-arena-elevated'
            }`}
          >
            {done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-arena-accent" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-arena-muted" />
            )}
            <span>
              <span className="font-medium">
                {m.id}. {m.title}
              </span>
              <span className="mt-0.5 block text-xs text-arena-muted">{m.topic}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
