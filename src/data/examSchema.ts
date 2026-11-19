import type { TableMeta } from './schemaDict'

/**
 * Esquema estructural de referencia del examen (solo DDL / metadatos).
 * Sin filas de datos ni consignas — material de estudio al completar las 10 misiones.
 */
export const EXAM_SCHEMA_DICTIONARY: TableMeta[] = [
  {
    name: 'Parametro',
    description: 'Catálogo maestro de parámetros del dominio (PAIS, JUEGO, ESTADO, etc.).',
    columns: [
      { name: 'IdParametro', type: 'SERIAL', pk: true },
      { name: 'Codigo', type: 'VARCHAR(30)', notes: 'UNIQUE' },
      { name: 'Nombre', type: 'VARCHAR(100)' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'ParametroItem',
    description: 'Ítems de cada parámetro (valores concretos del catálogo).',
    columns: [
      { name: 'IdParametroItem', type: 'SERIAL', pk: true },
      { name: 'IdParametro', type: 'INTEGER', fk: 'Parametro.IdParametro' },
      { name: 'Codigo', type: 'VARCHAR(20)' },
      { name: 'Descripcion', type: 'VARCHAR(120)' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'Usuario',
    description: 'Entidad base de personas; evita duplicar datos entre roles.',
    columns: [
      { name: 'IdUsuario', type: 'SERIAL', pk: true },
      { name: 'Nickname', type: 'VARCHAR(50)', notes: 'UNIQUE' },
      { name: 'NombreReal', type: 'VARCHAR(120)' },
      { name: 'Email', type: 'VARCHAR(120)', notes: 'UNIQUE' },
      { name: 'IdPais', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'Jugador',
    description: 'Rol jugador (relación 1:1 con Usuario vía IdUsuario UNIQUE).',
    columns: [
      { name: 'IdJugador', type: 'SERIAL', pk: true },
      { name: 'IdUsuario', type: 'INTEGER', fk: 'Usuario.IdUsuario', notes: 'UNIQUE' },
      { name: 'IdJuegoPrincipal', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'RankingElo', type: 'INTEGER', notes: 'CHECK >= 0' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'Caster',
    description: 'Rol caster / comentarista (1:1 con Usuario).',
    columns: [
      { name: 'IdCaster', type: 'SERIAL', pk: true },
      { name: 'IdUsuario', type: 'INTEGER', fk: 'Usuario.IdUsuario', notes: 'UNIQUE' },
      { name: 'Especialidad', type: 'VARCHAR(80)' },
      { name: 'Verificado', type: 'BOOLEAN' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'Torneo',
    description: 'Torneos / arenas del circuito.',
    columns: [
      { name: 'IdTorneo', type: 'SERIAL', pk: true },
      { name: 'Nombre', type: 'VARCHAR(100)' },
      { name: 'IdPaisSede', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'PremioBase', type: 'NUMERIC(12,2)', notes: 'CHECK > 0' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'Partida',
    description: 'Entidad transaccional central de encuentros.',
    columns: [
      { name: 'IdPartida', type: 'SERIAL', pk: true },
      { name: 'IdTorneo', type: 'INTEGER', fk: 'Torneo.IdTorneo' },
      { name: 'IdJugadorMVP', type: 'INTEGER', fk: 'Jugador.IdJugador' },
      { name: 'IdCaster', type: 'INTEGER', fk: 'Caster.IdCaster' },
      { name: 'FechaPartida', type: 'TIMESTAMP' },
      { name: 'DuracionMinutos', type: 'INTEGER', notes: 'CHECK > 0' },
      { name: 'BolsaPremio', type: 'NUMERIC(12,2)', notes: 'CHECK >= 0' },
      { name: 'IdEstadoPartida', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
  {
    name: 'PatrocinioPartida',
    description: 'Patrocinio asociado 1:1 a una partida (IdPartida UNIQUE).',
    columns: [
      { name: 'IdPatrocinio', type: 'SERIAL', pk: true },
      { name: 'IdPartida', type: 'INTEGER', fk: 'Partida.IdPartida', notes: 'UNIQUE' },
      { name: 'MarcaSponsor', type: 'VARCHAR(80)' },
      { name: 'IdMetodoDesembolso', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'MontoBruto', type: 'NUMERIC(12,2)' },
      { name: 'ComisionLiga', type: 'NUMERIC(12,2)' },
      { name: 'PagoNetoJugador', type: 'NUMERIC(12,2)' },
      { name: 'Activo', type: 'BOOLEAN', notes: 'DEFAULT TRUE' },
    ],
  },
]
