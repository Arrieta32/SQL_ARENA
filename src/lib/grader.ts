import type { Mission } from '../data/missions'
import { runInternalSql, runStudentSql, type QueryResult } from '../db/engine'

export type GradeResult = {
  passed: boolean
  message: string
  diagnosis?: string
  studentResult?: QueryResult
}

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 't' : 'f'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value)
    return Number(value).toFixed(4).replace(/\.?0+$/, '') || '0'
  }
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') {
    const maybe = value as { toString?: () => string }
    if (typeof maybe.toString === 'function') {
      const s = maybe.toString()
      if (s !== '[object Object]') {
        const n = Number(s)
        if (!Number.isNaN(n) && s.trim() !== '') {
          if (Number.isInteger(n)) return String(n)
          return Number(n).toFixed(4).replace(/\.?0+$/, '') || '0'
        }
        return s
      }
    }
    return JSON.stringify(value)
  }
  const s = String(value)
  const asDate = Date.parse(s)
  if (!Number.isNaN(asDate) && /\d{4}-\d{2}-\d{2}/.test(s)) {
    return new Date(asDate).toISOString()
  }
  const n = Number(s)
  if (s.trim() !== '' && !Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(s.trim())) {
    if (Number.isInteger(n)) return String(n)
    return Number(n).toFixed(4).replace(/\.?0+$/, '') || '0'
  }
  return s
}

function rowKey(fields: string[], row: Record<string, unknown>): string {
  return fields.map((f) => normalizeCell(row[f])).join('\u0001')
}

function sortRows(fields: string[], rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...rows].sort((a, b) => rowKey(fields, a).localeCompare(rowKey(fields, b)))
}

function compareResults(
  expected: QueryResult,
  actual: QueryResult,
  expectedColumns: string[],
  requiresOrder: boolean,
): { ok: boolean; diagnosis?: string } {
  if (expectedColumns.length > 0) {
    if (actual.fields.length !== expectedColumns.length) {
      return {
        ok: false,
        diagnosis: `Se esperaban ${expectedColumns.length} columnas (${expectedColumns.join(', ')}), pero tu consulta devolvió ${actual.fields.length}: ${actual.fields.join(', ') || '(ninguna)'}.`,
      }
    }
    for (let i = 0; i < expectedColumns.length; i++) {
      if (actual.fields[i] !== expectedColumns[i]) {
        return {
          ok: false,
          diagnosis: `La columna ${i + 1} debe llamarse "${expectedColumns[i]}", pero obtuviste "${actual.fields[i]}". Revisa alias AS "NombreExacto". SELECT * solo pasa si las columnas coinciden exactamente.`,
        }
      }
    }
  }

  const fields = expectedColumns.length > 0 ? expectedColumns : expected.fields
  const expRows = requiresOrder ? expected.rows : sortRows(fields, expected.rows)
  const actRows = requiresOrder ? actual.rows : sortRows(fields, actual.rows)

  if (actRows.length !== expRows.length) {
    return {
      ok: false,
      diagnosis: `Cantidad de filas incorrecta: esperadas ${expRows.length}, obtenidas ${actRows.length}.`,
    }
  }

  for (let i = 0; i < expRows.length; i++) {
    for (const field of fields) {
      const e = normalizeCell(expRows[i][field])
      const a = normalizeCell(actRows[i][field])
      if (e !== a) {
        return {
          ok: false,
          diagnosis: requiresOrder
            ? `En la fila ${i + 1}, columna "${field}", se esperaba ${e} y obtuviste ${a}.`
            : `Los datos no coinciden en la columna "${field}" (esperado ${e}, obtenido ${a}). Revisa filtros, JOINs y agregaciones.`,
        }
      }
    }
  }

  return { ok: true }
}

function pedagogicalDiagnosis(
  mission: Mission,
  err: unknown,
  compareDiagnosis?: string,
  studentRowCount?: number,
  expectedRowCount?: number,
): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const codeMatch = msg.match(/\b(42803|42P01|42703)\b/)
  const code = codeMatch?.[1]

  if (code === '42803' || /must appear in the GROUP BY/i.test(msg)) {
    return 'Error de agrupación: Toda columna en el SELECT que no esté dentro de COUNT/SUM/AVG debe incluirse en el GROUP BY.'
  }
  if (code === '42P01' || code === '42703' || /does not exist/i.test(msg)) {
    return 'Tabla o columna no encontrada. Recuerda respetar las mayúsculas y comillas dobles (ej. public."Partida").'
  }
  if (/COALESCE/i.test(mission.prompt) && /NULL|null/.test(compareDiagnosis ?? '')) {
    return 'Pista: Algunos jugadores no tienen pagos asociados. Usa COALESCE(..., 0) para convertir NULL en cero.'
  }
  if (
    (mission.id === 5 || mission.id === 6 || mission.id === 8 || mission.id === 10) &&
    typeof studentRowCount === 'number' &&
    typeof expectedRowCount === 'number' &&
    studentRowCount < expectedRowCount
  ) {
    return 'Pista: Estás perdiendo registros sin actividad asociada. Revisa si necesitas un LEFT JOIN en lugar de INNER JOIN.'
  }
  if (mission.id === 6 && /INNER JOIN.*Patrocinio|JOIN public\."Patrocinio/i.test(msg + (compareDiagnosis ?? ''))) {
    return 'Pista: Para encontrar partidas sin sponsor necesitas LEFT JOIN + IS NULL, no INNER JOIN.'
  }
  if (compareDiagnosis) return compareDiagnosis
  if (msg) return msg
  return 'El resultado no coincide con lo esperado. Revisa la consigna, los alias y los filtros.'
}

async function gradeSelect(mission: Mission, studentSql: string): Promise<GradeResult> {
  let studentResult: QueryResult
  try {
    studentResult = await runStudentSql(studentSql)
  } catch (err) {
    return {
      passed: false,
      message: 'Tu consulta produjo un error.',
      diagnosis: pedagogicalDiagnosis(mission, err),
    }
  }

  const expected = await runInternalSql(mission.solutionSql)
  const cmp = compareResults(expected, studentResult, mission.expectedColumns, mission.requiresOrder)
  if (!cmp.ok) {
    return {
      passed: false,
      message: 'Aún no apruebas esta misión.',
      diagnosis: pedagogicalDiagnosis(
        mission,
        null,
        cmp.diagnosis,
        studentResult.rowCount,
        expected.rowCount,
      ),
      studentResult,
    }
  }
  return {
    passed: true,
    message: '¡Misión superada! El resultado coincide con lo esperado.',
    studentResult,
  }
}

async function gradeUpdate(mission: Mission, studentSql: string): Promise<GradeResult> {
  let studentResult: QueryResult | undefined
  try {
    studentResult = await runStudentSql(studentSql)
  } catch (err) {
    return {
      passed: false,
      message: 'Tu sentencia UPDATE produjo un error.',
      diagnosis: pedagogicalDiagnosis(mission, err),
    }
  }

  const live = await runInternalSql(`
    SELECT COUNT(*)::int AS "c"
    FROM public."Partida" p
    JOIN public."ParametroItem" pi ON p."IdEstadoPartida" = pi."IdParametroItem"
    WHERE pi."Codigo" = 'LIVE'
  `)
  const fin = await runInternalSql(`
    SELECT COUNT(*)::int AS "c"
    FROM public."Partida" p
    JOIN public."ParametroItem" pi ON p."IdEstadoPartida" = pi."IdParametroItem"
    WHERE pi."Codigo" = 'FIN'
  `)
  const canc = await runInternalSql(`
    SELECT COUNT(*)::int AS "c"
    FROM public."Partida" p
    JOIN public."ParametroItem" pi ON p."IdEstadoPartida" = pi."IdParametroItem"
    WHERE pi."Codigo" = 'CANC'
  `)

  const liveCount = Number(live.rows[0]?.c ?? -1)
  const finCount = Number(fin.rows[0]?.c ?? -1)
  const cancCount = Number(canc.rows[0]?.c ?? -1)

  if (liveCount === 0 && finCount === 17 && cancCount === 3) {
    return {
      passed: true,
      message: '¡Misión superada! LIVE=0, FIN=17 y las 3 CANC intactas.',
      studentResult,
    }
  }

  return {
    passed: false,
    message: 'La actualización no cumple la validación post-ejecución.',
    diagnosis: `Estado actual → LIVE: ${liveCount} (debe ser 0), FIN: ${finCount} (debe ser 17), CANC: ${cancCount} (debe seguir en 3). Si alteraste datos previos, pulsa Reiniciar Base de Datos e inténtalo de nuevo.`,
    studentResult,
  }
}

async function gradeView(mission: Mission, studentSql: string): Promise<GradeResult> {
  try {
    await runStudentSql(studentSql)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/already exists/i.test(msg)) {
      return {
        passed: false,
        message: 'La vista ya existe con otra definición.',
        diagnosis:
          'Pista: Ejecuta DROP VIEW IF EXISTS vw_ResumenJugadores; y vuelve a crear la vista, o usa CREATE OR REPLACE VIEW.',
      }
    }
    return {
      passed: false,
      message: 'No se pudo crear la vista.',
      diagnosis: pedagogicalDiagnosis(mission, err),
    }
  }

  let actual: QueryResult
  try {
    actual = await runInternalSql(
      'SELECT * FROM vw_ResumenJugadores ORDER BY "IdJugador"',
    )
  } catch (err) {
    return {
      passed: false,
      message: 'La vista no se puede consultar.',
      diagnosis: pedagogicalDiagnosis(mission, err),
    }
  }

  const expected = await runInternalSql(`
    SELECT
      j."IdJugador",
      u."Nickname",
      COUNT(p."IdPartida") AS "PartidasMVP",
      COALESCE(SUM(pp."PagoNetoJugador"), 0) AS "GananciaNeta"
    FROM public."Jugador" j
    JOIN public."Usuario" u ON j."IdUsuario" = u."IdUsuario"
    LEFT JOIN public."Partida" p ON j."IdJugador" = p."IdJugadorMVP"
    LEFT JOIN public."PatrocinioPartida" pp ON p."IdPartida" = pp."IdPartida"
    GROUP BY j."IdJugador", u."Nickname"
    ORDER BY j."IdJugador"
  `)

  const cmp = compareResults(expected, actual, mission.expectedColumns, true)
  if (!cmp.ok) {
    const player8 = actual.rows.find((r) => Number(r.IdJugador) === 8)
    let diagnosis = pedagogicalDiagnosis(
      mission,
      null,
      cmp.diagnosis,
      actual.rowCount,
      expected.rowCount,
    )
    if (player8) {
      const mvp = normalizeCell(player8.PartidasMVP)
      const gain = normalizeCell(player8.GananciaNeta)
      if (mvp !== '0' || gain !== '0') {
        diagnosis =
          'Pista: El jugador 8 no tiene partidas MVP ni pagos. Usa LEFT JOIN y COALESCE(..., 0) para obtener 0 en PartidasMVP y GananciaNeta.'
      }
    } else if (actual.rowCount < 8) {
      diagnosis =
        'Pista: Estás perdiendo registros sin actividad asociada. Revisa si necesitas un LEFT JOIN en lugar de INNER JOIN.'
    }
    return {
      passed: false,
      message: 'La vista no proyecta el resumen esperado.',
      diagnosis,
      studentResult: actual,
    }
  }

  return {
    passed: true,
    message: '¡Misión superada! vw_ResumenJugadores proyecta los 8 jugadores correctamente.',
    studentResult: actual,
  }
}

export async function gradeMission(mission: Mission, studentSql: string): Promise<GradeResult> {
  if (mission.kind === 'update') return gradeUpdate(mission, studentSql)
  if (mission.kind === 'view') return gradeView(mission, studentSql)
  return gradeSelect(mission, studentSql)
}
