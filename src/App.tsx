import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { Header } from './components/Header'
import { LoginModal } from './components/LoginModal'
import { MissionSidebar } from './components/MissionSidebar'
import { ResultsTable } from './components/ResultsTable'
import { SchemaDictionary } from './components/SchemaDictionary'
import { SqlEditor } from './components/SqlEditor'
import { MISSIONS, getMission } from './data/missions'
import { getDb, resetDatabase, runStudentSql, type QueryResult } from './db/engine'
import { gradeMission } from './lib/grader'
import {
  clearSession,
  loadSession,
  markMissionComplete,
  saveSession,
  type StudentSession,
} from './lib/storage'
import { sendWebhookEvent } from './lib/webhook'

export default function App() {
  const [session, setSession] = useState<StudentSession | null>(() => loadSession())
  const [ready, setReady] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)
  const [activeMissionId, setActiveMissionId] = useState(1)
  const [sql, setSql] = useState(() => getMission(1).starterSql)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<'neutral' | 'success' | 'error'>('neutral')
  const [diagnosis, setDiagnosis] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [busy, setBusy] = useState(false)

  const mission = useMemo(() => getMission(activeMissionId), [activeMissionId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await getDb()
        if (!cancelled) setReady(true)
      } catch (err) {
        if (!cancelled) {
          setBootError(err instanceof Error ? err.message : 'No se pudo iniciar PGlite')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = useCallback((nombre: string, ci: string) => {
    const existing = loadSession()
    const next: StudentSession = {
      nombre,
      ci,
      misionesCompletadas:
        existing && existing.ci === ci ? existing.misionesCompletadas : [],
    }
    saveSession(next)
    setSession(next)
    void sendWebhookEvent({
      nombre,
      ci,
      nivel: 'Acceso',
      mision: 'Inicio de Sesión',
      estado: 'INGRESO',
    })
  }, [])

  const handleChangeStudent = useCallback(() => {
    clearSession()
    setSession(null)
    setStatusMessage(null)
    setDiagnosis(null)
    setResult(null)
    setStatusTone('neutral')
  }, [])

  const selectMission = useCallback((id: number) => {
    setActiveMissionId(id)
    setSql(getMission(id).starterSql)
    setShowHint(false)
    setStatusMessage(null)
    setDiagnosis(null)
    setStatusTone('neutral')
    setResult(null)
  }, [])

  const handleExecute = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setDiagnosis(null)
    try {
      const res = await runStudentSql(sql)
      setResult(res)
      setStatusTone('neutral')
      setStatusMessage(
        res.fields.length > 0
          ? `Consulta ejecutada · ${res.rowCount} fila(s)`
          : `Sentencia ejecutada${res.affectedRows != null ? ` · filas afectadas: ${res.affectedRows}` : ''}`,
      )
    } catch (err) {
      setResult(null)
      setStatusTone('error')
      setStatusMessage('Error al ejecutar SQL')
      setDiagnosis(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [busy, sql])

  const handleValidate = useCallback(async () => {
    if (busy || !session) return
    setBusy(true)
    setDiagnosis(null)
    try {
      const grade = await gradeMission(mission, sql)
      setResult(grade.studentResult ?? null)
      if (grade.passed) {
        setStatusTone('success')
        setStatusMessage(grade.message)
        setDiagnosis(null)
        const updated = markMissionComplete(mission.id)
        if (updated) setSession(updated)
        void sendWebhookEvent({
          nombre: session.nombre,
          ci: session.ci,
          nivel: `Misión ${mission.id}`,
          mision: mission.title,
          estado: 'COMPLETADO',
        })
      } else {
        setStatusTone('error')
        setStatusMessage(grade.message)
        setDiagnosis(grade.diagnosis ?? null)
      }
    } catch (err) {
      setStatusTone('error')
      setStatusMessage('Error en el grader')
      setDiagnosis(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [busy, mission, session, sql])

  const handleResetDb = useCallback(async () => {
    if (busy) return
    setBusy(true)
    try {
      await resetDatabase()
      setResult(null)
      setStatusTone('neutral')
      setStatusMessage('Base de datos reiniciada con el esquema y datos semilla.')
      setDiagnosis(null)
    } catch (err) {
      setStatusTone('error')
      setStatusMessage('No se pudo reiniciar la base de datos')
      setDiagnosis(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [busy])

  if (bootError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-arena-danger">
        Error al iniciar el motor PostgreSQL: {bootError}
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 arena-grid">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-arena-accent border-t-transparent" />
        <p className="font-display text-lg text-arena-muted">Cargando motor PostgreSQL (PGlite)…</p>
      </div>
    )
  }

  if (!session) {
    return <LoginModal onSubmit={handleLogin} />
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Header
        session={session}
        completedCount={session.misionesCompletadas.length}
        totalMissions={MISSIONS.length}
        onChangeStudent={handleChangeStudent}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="max-h-[40vh] w-full shrink-0 overflow-y-auto border-b border-arena-border bg-arena-panel/80 p-3 lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
          <MissionSidebar
            missions={MISSIONS}
            activeId={activeMissionId}
            completed={session.misionesCompletadas}
            onSelect={selectMission}
          />
          <SchemaDictionary />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 md:p-4">
          <section className="rounded-xl border border-arena-border bg-arena-panel/90 p-4 slide-up">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-bold">
                Misión {mission.id}: {mission.title}
              </h2>
              <span className="rounded-md bg-arena-elevated px-2 py-0.5 text-xs text-arena-muted">
                {mission.topic}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-arena-muted">{mission.prompt}</p>
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-arena-warn transition hover:text-arena-warn/80"
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? 'Ocultar pista' : 'Ver pista'}
              {showHint ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showHint && (
              <p className="mt-2 rounded-lg border border-arena-warn/30 bg-arena-warn/10 px-3 py-2 text-sm text-arena-warn">
                {mission.hint}
              </p>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleExecute()}
              className="inline-flex items-center gap-2 rounded-lg bg-arena-info px-3 py-2 text-sm font-semibold text-arena-bg transition hover:bg-arena-info/90 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Ejecutar SQL
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleValidate()}
              className="inline-flex items-center gap-2 rounded-lg bg-arena-accent px-3 py-2 text-sm font-semibold text-arena-bg transition hover:bg-arena-accent/90 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Validar Misión
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleResetDb()}
              className="inline-flex items-center gap-2 rounded-lg border border-arena-border px-3 py-2 text-sm font-medium text-arena-muted transition hover:border-arena-warn/50 hover:text-arena-warn disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar Base de Datos
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-3 lg:grid-rows-2">
            <div className="min-h-[220px] lg:min-h-0">
              <SqlEditor value={sql} onChange={setSql} onExecute={() => void handleExecute()} />
            </div>
            <div className="min-h-[180px] lg:min-h-0">
              <ResultsTable
                result={result}
                statusMessage={statusMessage}
                statusTone={statusTone}
                diagnosis={diagnosis}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
