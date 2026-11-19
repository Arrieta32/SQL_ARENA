import type { QueryResult } from '../db/engine'

type Props = {
  result: QueryResult | null
  statusMessage?: string | null
  statusTone?: 'neutral' | 'success' | 'error'
  diagnosis?: string | null
  nextMissionLabel?: string | null
  onNextMission?: () => void
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function ResultsTable({
  result,
  statusMessage,
  statusTone = 'neutral',
  diagnosis,
  nextMissionLabel,
  onNextMission,
}: Props) {
  const toneClass =
    statusTone === 'success'
      ? 'border-arena-accent/40 bg-arena-accent/10 text-arena-accent'
      : statusTone === 'error'
        ? 'border-arena-danger/40 bg-arena-danger/10 text-arena-danger'
        : 'border-arena-border bg-arena-elevated text-arena-muted'

  return (
    <div className="flex h-full min-h-[160px] flex-col overflow-hidden rounded-xl border border-arena-border bg-arena-panel">
      <div className="border-b border-arena-border px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-arena-muted">
        Resultados
        {result ? ` · ${result.rowCount} fila(s)` : ''}
        {result?.affectedRows != null ? ` · afectadas: ${result.affectedRows}` : ''}
      </div>

      {(statusMessage || diagnosis) && (
        <div className={`mx-3 mt-3 space-y-2 rounded-lg border px-3 py-2 text-sm ${toneClass} ${statusTone === 'success' ? 'pulse-success' : ''}`}>
          {statusMessage && <p>{statusMessage}</p>}
          {diagnosis && <p className="text-arena-warn">{diagnosis}</p>}
          {statusTone === 'success' && nextMissionLabel && onNextMission && (
            <button
              type="button"
              onClick={onNextMission}
              className="mt-1 inline-flex items-center rounded-md bg-arena-accent px-3 py-1.5 text-xs font-semibold text-arena-bg transition hover:bg-arena-accent/90"
            >
              {nextMissionLabel}
            </button>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {!result || result.fields.length === 0 ? (
          <p className="text-sm text-arena-muted">
            Ejecuta una consulta para ver filas aquí. Los valores se muestran como texto plano.
          </p>
        ) : (
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead>
              <tr>
                {result.fields.map((f) => (
                  <th
                    key={f}
                    className="sticky top-0 border-b border-arena-border bg-arena-elevated px-3 py-2 font-mono text-xs font-semibold text-arena-info"
                  >
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="odd:bg-arena-elevated/30">
                  {result.fields.map((f) => (
                    <td key={f} className="border-b border-arena-border/40 px-3 py-1.5 font-mono text-xs">
                      {cellText(row[f])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
