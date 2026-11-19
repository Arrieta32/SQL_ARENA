import { useState } from 'react'
import { BookOpen, ChevronDown, KeyRound, Link2, Trophy } from 'lucide-react'
import { EXAM_SCHEMA_DICTIONARY } from '../data/examSchema'

export function BonusExamPanel() {
  const [openTable, setOpenTable] = useState<string | null>('Partida')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto slide-up">
      <section className="rounded-xl border border-arena-accent/40 bg-arena-accent/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-arena-accent" />
          <h2 className="font-display text-lg font-bold text-arena-accent">
            Bonus: Esquema del Examen
          </h2>
        </div>
        <p className="text-sm text-arena-muted">
          Completaste las 10 misiones. Este material es de <strong className="text-arena-text">solo lectura</strong>:
          estructura y reglas para estudiar. Los datos y las consignas se entregarán el día del examen.
        </p>
      </section>

      <section className="rounded-xl border border-arena-border bg-arena-panel/90 p-4">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-arena-info" />
          <h3 className="font-display text-base font-bold">Guía de Reglas del Examen</h3>
        </div>
        <ul className="space-y-3 text-sm leading-relaxed text-arena-muted">
          <li>
            <span className="font-semibold text-arena-text">PascalCase entre comillas dobles.</span>{' '}
            En PostgreSQL los identificadores sin comillas se pliegan a minúsculas. Usá siempre
            formas como <code className="font-mono text-arena-info">public.&quot;Partida&quot;</code> y{' '}
            <code className="font-mono text-arena-info">&quot;IdPartida&quot;</code>.
          </li>
          <li>
            <span className="font-semibold text-arena-text">INNER JOIN vs LEFT JOIN.</span>{' '}
            <code className="font-mono text-arena-info">INNER JOIN</code> descarta filas sin match.
            Si la consigna pide incluir entidades <em>sin</em> movimientos (casters sin partidas,
            partidas sin sponsor, jugadores sin pagos), necesitás{' '}
            <code className="font-mono text-arena-info">LEFT JOIN</code> y, a menudo,{' '}
            <code className="font-mono text-arena-info">IS NULL</code> o{' '}
            <code className="font-mono text-arena-info">COUNT</code> sobre la PK del lado derecho.
          </li>
          <li>
            <span className="font-semibold text-arena-text">COALESCE en agregaciones.</span>{' '}
            <code className="font-mono text-arena-info">SUM</code>/<code className="font-mono text-arena-info">AVG</code>{' '}
            sobre conjuntos vacíos o sin match pueden devolver{' '}
            <code className="font-mono text-arena-info">NULL</code>. Envolvé con{' '}
            <code className="font-mono text-arena-info">COALESCE(..., 0)</code> cuando el enunciado
            pida ceros explícitos.
          </li>
          <li>
            <span className="font-semibold text-arena-text">Catálogos paramétricos.</span>{' '}
            Valores de dominio (país, juego, estado, método de pago) viven en{' '}
            <code className="font-mono text-arena-info">&quot;Parametro&quot;</code> +{' '}
            <code className="font-mono text-arena-info">&quot;ParametroItem&quot;</code>. Unite por
            FK y filtrá por <code className="font-mono text-arena-info">&quot;Codigo&quot;</code> del
            ítem (ej. <code className="font-mono text-arena-info">&apos;FIN&apos;</code>,{' '}
            <code className="font-mono text-arena-info">&apos;VAL&apos;</code>), no hardcodeés IDs
            mágicos si el enunciado habla de códigos.
          </li>
          <li>
            <span className="font-semibold text-arena-text">GROUP BY / HAVING.</span> Toda columna del
            SELECT que no esté dentro de una agregación debe ir en el{' '}
            <code className="font-mono text-arena-info">GROUP BY</code>. Usá{' '}
            <code className="font-mono text-arena-info">HAVING</code> para filtrar grupos (no{' '}
            <code className="font-mono text-arena-info">WHERE</code> sobre agregados).
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-arena-border bg-arena-panel/90 p-4">
        <h3 className="mb-1 font-display text-base font-bold">
          Diccionario / Esquema Estructural de Referencia
        </h3>
        <p className="mb-3 rounded-lg border border-arena-warn/30 bg-arena-warn/10 px-3 py-2 text-xs text-arena-warn">
          Material de estudio estructural — Los datos y consignas se entregarán el día del examen.
          Solo estructura DDL (tablas, columnas, tipos, PK/FK). Sin filas ni preguntas.
        </p>
        <div className="space-y-1.5">
          {EXAM_SCHEMA_DICTIONARY.map((table) => {
            const expanded = openTable === table.name
            return (
              <div
                key={table.name}
                className="rounded-lg border border-arena-border/70 bg-arena-elevated/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenTable(expanded ? null : table.name)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium"
                >
                  <span className="font-mono text-arena-info">&quot;{table.name}&quot;</span>
                  <ChevronDown
                    className={`h-4 w-4 text-arena-muted transition ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {expanded && (
                  <div className="border-t border-arena-border/60 px-3 pb-3 pt-2">
                    <p className="mb-2 text-xs text-arena-muted">{table.description}</p>
                    <ul className="space-y-1.5">
                      {table.columns.map((col) => (
                        <li
                          key={col.name}
                          className="flex flex-wrap items-center gap-1.5 text-xs font-mono"
                        >
                          <span className="text-arena-text">{col.name}</span>
                          <span className="text-arena-muted">{col.type}</span>
                          {col.pk && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-arena-warn/15 px-1 py-0.5 text-[10px] text-arena-warn">
                              <KeyRound className="h-3 w-3" /> PK
                            </span>
                          )}
                          {col.fk && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-arena-info/15 px-1 py-0.5 text-[10px] text-arena-info">
                              <Link2 className="h-3 w-3" /> FK → {col.fk}
                            </span>
                          )}
                          {col.notes && (
                            <span className="text-[10px] text-arena-muted">{col.notes}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
