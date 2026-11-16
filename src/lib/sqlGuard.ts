const BLOCKED_PATTERN =
  /\b(COPY|pg_read_file|pg_sleep|VACUUM|ALTER\s+SYSTEM|CREATE\s+EXTENSION|DO\s*\$\$)\b/i

export const MAX_SQL_LENGTH = 5000

export function assertSafeSql(sql: string): void {
  const trimmed = sql.trim()
  if (!trimmed) {
    throw new Error('Escribe una consulta SQL antes de ejecutar.')
  }
  if (trimmed.length > MAX_SQL_LENGTH) {
    throw new Error(`La consulta supera el límite de ${MAX_SQL_LENGTH} caracteres.`)
  }
  if (BLOCKED_PATTERN.test(trimmed)) {
    throw new Error(
      'Comando bloqueado por seguridad. No se permiten COPY, pg_sleep, ALTER SYSTEM, CREATE EXTENSION ni bloques DO $$.',
    )
  }
}
