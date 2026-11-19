import { MISSIONS } from '../data/missions'

/** Misión 1 siempre libre; N requiere haber aprobado N-1. */
export function isMissionUnlocked(missionId: number, completed: number[]): boolean {
  if (missionId <= 1) return true
  return completed.includes(missionId - 1)
}

export function isBonusUnlocked(completed: number[]): boolean {
  return MISSIONS.every((m) => completed.includes(m.id))
}

export function nextMissionId(currentId: number): number | null {
  const next = currentId + 1
  return MISSIONS.some((m) => m.id === next) ? next : null
}
