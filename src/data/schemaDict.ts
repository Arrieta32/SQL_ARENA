export type ColumnMeta = {
  name: string
  type: string
  pk?: boolean
  fk?: string
  notes?: string
}

export type TableMeta = {
  name: string
  description: string
  columns: ColumnMeta[]
}

export const SCHEMA_DICTIONARY: TableMeta[] = [
  {
    name: 'Parametro',
    description: 'Catálogo maestro de parámetros del dominio.',
    columns: [
      { name: 'IdParametro', type: 'SERIAL', pk: true },
      { name: 'Codigo', type: 'VARCHAR(30)', notes: 'UNIQUE' },
      { name: 'Nombre', type: 'VARCHAR(100)' },
      { name: 'Activo', type: 'BOOLEAN' },
    ],
  },
  {
    name: 'ParametroItem',
    description: 'Valores de cada parámetro (país, juego, estado, pago).',
    columns: [
      { name: 'IdParametroItem', type: 'SERIAL', pk: true },
      { name: 'IdParametro', type: 'INTEGER', fk: 'Parametro.IdParametro' },
      { name: 'Codigo', type: 'VARCHAR(20)' },
      { name: 'Descripcion', type: 'VARCHAR(120)' },
      { name: 'Activo', type: 'BOOLEAN' },
    ],
  },
  {
    name: 'Usuario',
    description: 'Entidad base de personas (jugadores y/o casters).',
    columns: [
      { name: 'IdUsuario', type: 'SERIAL', pk: true },
      { name: 'Nickname', type: 'VARCHAR(50)', notes: 'UNIQUE' },
      { name: 'NombreReal', type: 'VARCHAR(120)' },
      { name: 'Email', type: 'VARCHAR(120)', notes: 'UNIQUE' },
      { name: 'IdPais', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'Activo', type: 'BOOLEAN' },
    ],
  },
  {
    name: 'Jugador',
    description: 'Rol jugador (1:1 con Usuario).',
    columns: [
      { name: 'IdJugador', type: 'SERIAL', pk: true },
      { name: 'IdUsuario', type: 'INTEGER', fk: 'Usuario.IdUsuario', notes: 'UNIQUE' },
      { name: 'IdJuegoPrincipal', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'RankingElo', type: 'INTEGER' },
      { name: 'Activo', type: 'BOOLEAN' },
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
      { name: 'Activo', type: 'BOOLEAN' },
    ],
  },
  {
    name: 'Torneo',
    description: 'Torneos / arenas del circuito.',
    columns: [
      { name: 'IdTorneo', type: 'SERIAL', pk: true },
      { name: 'Nombre', type: 'VARCHAR(100)' },
      { name: 'IdPaisSede', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'PremioBase', type: 'NUMERIC(12,2)' },
      { name: 'Activo', type: 'BOOLEAN' },
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
      { name: 'DuracionMinutos', type: 'INTEGER' },
      { name: 'BolsaPremio', type: 'NUMERIC(12,2)' },
      { name: 'IdEstadoPartida', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'Activo', type: 'BOOLEAN' },
    ],
  },
  {
    name: 'PatrocinioPartida',
    description: 'Patrocinio 1:1 asociado a una partida.',
    columns: [
      { name: 'IdPatrocinio', type: 'SERIAL', pk: true },
      { name: 'IdPartida', type: 'INTEGER', fk: 'Partida.IdPartida', notes: 'UNIQUE' },
      { name: 'MarcaSponsor', type: 'VARCHAR(80)' },
      { name: 'IdMetodoDesembolso', type: 'INTEGER', fk: 'ParametroItem.IdParametroItem' },
      { name: 'MontoBruto', type: 'NUMERIC(12,2)' },
      { name: 'ComisionLiga', type: 'NUMERIC(12,2)' },
      { name: 'PagoNetoJugador', type: 'NUMERIC(12,2)' },
      { name: 'Activo', type: 'BOOLEAN' },
    ],
  },
]
