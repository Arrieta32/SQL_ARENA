const SENT_EVENTS_KEY = 'sql_arena_sent_events'
const LAST_SENT_AT_KEY = 'sql_arena_webhook_last_sent'
const COOLDOWN_MS = 5000

export type WebhookPayload = {
  token: string
  nombre: string
  ci: string
  nivel: string
  mision: string
  estado: 'INGRESO' | 'COMPLETADO'
}

function readSentEvents(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_EVENTS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function writeSentEvents(events: Set<string>): void {
  localStorage.setItem(SENT_EVENTS_KEY, JSON.stringify([...events]))
}

function eventKey(payload: WebhookPayload): string {
  return `${payload.ci}::${payload.estado}::${payload.nivel}::${payload.mision}`
}

export async function sendWebhookEvent(
  partial: Omit<WebhookPayload, 'token'>,
): Promise<void> {
  const url = import.meta.env.VITE_GOOGLE_WEBHOOK_URL as string | undefined
  const token = (import.meta.env.VITE_WEBHOOK_SECRET as string | undefined) ?? ''

  if (!url) {
    console.warn('[SQL Arena] Webhook omitido: VITE_GOOGLE_WEBHOOK_URL no configurada.')
    return
  }

  const payload: WebhookPayload = { ...partial, token }
  const key = eventKey(payload)
  const sent = readSentEvents()
  if (sent.has(key)) {
    return
  }

  const last = Number(localStorage.getItem(LAST_SENT_AT_KEY) ?? '0')
  const now = Date.now()
  if (now - last < COOLDOWN_MS) {
    console.warn('[SQL Arena] Webhook en cooldown (5s). Evento diferido/omitido.')
    return
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    localStorage.setItem(LAST_SENT_AT_KEY, String(now))
    sent.add(key)
    writeSentEvents(sent)
  } catch (err) {
    console.warn('[SQL Arena] Falló el envío del webhook:', err)
  }
}

export function clearWebhookDedupForCi(ci: string): void {
  const sent = readSentEvents()
  for (const key of [...sent]) {
    if (key.startsWith(`${ci}::`)) sent.delete(key)
  }
  writeSentEvents(sent)
}
