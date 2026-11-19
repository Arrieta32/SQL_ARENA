import { CheckCircle2, Circle, Lock, Trophy } from 'lucide-react'
import type { Mission } from '../data/missions'
import { isBonusUnlocked, isMissionUnlocked } from '../lib/progress'

export type SidebarView = { type: 'mission'; id: number } | { type: 'bonus' }

type Props = {
  missions: Mission[]
  active: SidebarView
  completed: number[]
  onSelectMission: (id: number) => void
  onSelectBonus: () => void
}

export function MissionSidebar({
  missions,
  active,
  completed,
  onSelectMission,
  onSelectBonus,
}: Props) {
  const bonusReady = isBonusUnlocked(completed)

  return (
    <nav className="space-y-1">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-arena-muted">
        Misiones
      </h2>
      {missions.map((m) => {
        const done = completed.includes(m.id)
        const unlocked = isMissionUnlocked(m.id, completed)
        const isActive = active.type === 'mission' && active.id === m.id

        return (
          <button
            key={m.id}
            type="button"
            disabled={!unlocked}
            onClick={() => unlocked && onSelectMission(m.id)}
            title={
              unlocked
                ? undefined
                : `Completá la Misión ${m.id - 1} para desbloquear`
            }
            className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
              !unlocked
                ? 'cursor-not-allowed opacity-45 text-arena-muted'
                : isActive
                  ? 'bg-arena-accent/15 text-arena-accent ring-1 ring-arena-accent/40'
                  : 'text-arena-text hover:bg-arena-elevated'
            }`}
          >
            {!unlocked ? (
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-arena-muted" />
            ) : done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-arena-accent" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-arena-muted" />
            )}
            <span>
              <span className="font-medium">
                {m.id}. {m.title}
              </span>
              <span className="mt-0.5 block text-xs text-arena-muted">
                {unlocked ? m.topic : 'Bloqueada'}
              </span>
            </span>
          </button>
        )
      })}

      <div className="my-3 border-t border-arena-border pt-3">
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-arena-muted">
          Recompensa
        </h2>
        <button
          type="button"
          disabled={!bonusReady}
          onClick={() => bonusReady && onSelectBonus()}
          title={
            bonusReady
              ? 'Abrir material de estudio del examen'
              : 'Completá las 10 misiones para desbloquear el Bonus'
          }
          className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
            !bonusReady
              ? 'cursor-not-allowed opacity-45 text-arena-muted'
              : active.type === 'bonus'
                ? 'bg-arena-warn/15 text-arena-warn ring-1 ring-arena-warn/40'
                : 'text-arena-text hover:bg-arena-elevated'
          }`}
        >
          {!bonusReady ? (
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-arena-muted" />
          ) : (
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-arena-warn" />
          )}
          <span>
            <span className="font-medium">Bonus: Esquema del Examen</span>
            <span className="mt-0.5 block text-xs text-arena-muted">
              {bonusReady ? 'Desbloqueado · material de estudio' : 'Requiere 10/10 misiones'}
            </span>
          </span>
        </button>
      </div>
    </nav>
  )
}
