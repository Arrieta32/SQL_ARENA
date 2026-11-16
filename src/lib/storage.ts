export type StudentSession = {
  nombre: string
  ci: string
  misionesCompletadas: number[]
}

const SESSION_KEY = 'sql_arena_student_session'

const NOMBRE_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,80}$/
const CI_RE = /^[0-9-]{5,15}$/

export function validateNombre(nombre: string): string | null {
  const t = nombre.trim().replace(/\s+/g, ' ')
  if (!NOMBRE_RE.test(t)) {
    return 'El nombre debe tener entre 3 y 80 caracteres (solo letras, espacios y tildes).'
  }
  return null
}

export function validateCi(ci: string): string | null {
  const t = ci.trim()
  if (!CI_RE.test(t)) {
    return 'La C.I. debe tener entre 5 y 15 caracteres (solo dígitos y guiones).'
  }
  return null
}

export function loadSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StudentSession
    if (!parsed.nombre || !parsed.ci) return null
    return {
      nombre: parsed.nombre,
      ci: parsed.ci,
      misionesCompletadas: Array.isArray(parsed.misionesCompletadas)
        ? parsed.misionesCompletadas
        : [],
    }
  } catch {
    return null
  }
}

export function saveSession(session: StudentSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function markMissionComplete(missionId: number): StudentSession | null {
  const session = loadSession()
  if (!session) return null
  if (!session.misionesCompletadas.includes(missionId)) {
    session.misionesCompletadas = [...session.misionesCompletadas, missionId].sort(
      (a, b) => a - b,
    )
    saveSession(session)
  }
  return session
}
