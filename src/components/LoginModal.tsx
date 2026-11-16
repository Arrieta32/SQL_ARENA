import { useState, type FormEvent } from 'react'
import { Gamepad2 } from 'lucide-react'
import { validateCi, validateNombre } from '../lib/storage'

type Props = {
  onSubmit: (nombre: string, ci: string) => void
}

export function LoginModal({ onSubmit }: Props) {
  const [nombre, setNombre] = useState('')
  const [ci, setCi] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nErr = validateNombre(nombre)
    if (nErr) {
      setError(nErr)
      return
    }
    const cErr = validateCi(ci)
    if (cErr) {
      setError(cErr)
      return
    }
    onSubmit(nombre.trim().replace(/\s+/g, ' '), ci.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm fade-in">
      <div className="w-full max-w-md slide-up rounded-2xl border border-arena-border bg-arena-panel p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-arena-accent/15 text-arena-accent">
            <Gamepad2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-arena-text">
              SQL Arena
            </h1>
            <p className="text-sm text-arena-muted">E-Sports & Streaming · Identifícate</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-arena-muted">Nombre y Apellido</span>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-arena-border bg-arena-elevated px-3 py-2.5 text-arena-text outline-none transition focus:border-arena-accent"
              placeholder="Ej. Ana López"
              maxLength={80}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-arena-muted">Cédula de Identidad</span>
            <input
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              className="w-full rounded-lg border border-arena-border bg-arena-elevated px-3 py-2.5 text-arena-text outline-none transition focus:border-arena-accent"
              placeholder="Ej. 1234567"
              maxLength={15}
            />
          </label>
          {error && (
            <p className="rounded-lg border border-arena-danger/40 bg-arena-danger/10 px-3 py-2 text-sm text-arena-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-arena-accent py-2.5 font-semibold text-arena-bg transition hover:bg-arena-accent/90"
          >
            Entrar a la Arena
          </button>
        </form>
      </div>
    </div>
  )
}
