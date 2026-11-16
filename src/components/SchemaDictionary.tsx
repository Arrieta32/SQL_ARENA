import { useState } from 'react'
import { ChevronDown, KeyRound, Link2 } from 'lucide-react'
import { SCHEMA_DICTIONARY } from '../data/schemaDict'

export function SchemaDictionary() {
  const [open, setOpen] = useState<string | null>('Partida')

  return (
    <div className="mt-4 border-t border-arena-border pt-4">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-arena-muted">
        Diccionario de Tablas
      </h2>
      <div className="space-y-1">
        {SCHEMA_DICTIONARY.map((table) => {
          const expanded = open === table.name
          return (
            <div key={table.name} className="rounded-lg border border-arena-border/70 bg-arena-elevated/40">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : table.name)}
                className="flex w-full items-center justify-between px-2.5 py-2 text-left text-sm font-medium"
              >
                <span className="font-mono text-arena-info">&quot;{table.name}&quot;</span>
                <ChevronDown
                  className={`h-4 w-4 text-arena-muted transition ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
              {expanded && (
                <div className="border-t border-arena-border/60 px-2.5 pb-2.5 pt-2">
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
    </div>
  )
}
