import { PGlite } from '@electric-sql/pglite'
import { SCHEMA_SQL } from './schema'
import { assertSafeSql } from '../lib/sqlGuard'

export type QueryResult = {
  fields: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  affectedRows?: number
}

let db: PGlite | null = null
let initPromise: Promise<PGlite> | null = null

async function applySchema(instance: PGlite): Promise<void> {
  await instance.exec(`SET statement_timeout = '3000';`)
  await instance.exec(SCHEMA_SQL)
  await instance.exec(`SET statement_timeout = '3000';`)
}

export async function getDb(): Promise<PGlite> {
  if (db) return db
  if (!initPromise) {
    initPromise = (async () => {
      const instance = new PGlite()
      await applySchema(instance)
      db = instance
      return instance
    })()
  }
  return initPromise
}

export async function resetDatabase(): Promise<void> {
  const instance = await getDb()
  await applySchema(instance)
}

function mapResult(raw: {
  fields: { name: string }[]
  rows: unknown[]
  affectedRows?: number
}): QueryResult {
  return {
    fields: raw.fields.map((f) => f.name),
    rows: raw.rows as Record<string, unknown>[],
    rowCount: raw.rows.length,
    affectedRows: raw.affectedRows,
  }
}

/** Ejecuta SQL del estudiante con sandbox. */
export async function runStudentSql(sql: string): Promise<QueryResult> {
  assertSafeSql(sql)
  const instance = await getDb()
  const result = await instance.query<Record<string, unknown>>(sql)
  return mapResult(result)
}

/** Ejecuta SQL interno del grader (sin filtro léxico de estudiante). */
export async function runInternalSql(sql: string): Promise<QueryResult> {
  const instance = await getDb()
  const result = await instance.query<Record<string, unknown>>(sql)
  return mapResult(result)
}
