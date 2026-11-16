export type MissionKind = 'select' | 'update' | 'view'

export type Mission = {
  id: number
  title: string
  topic: string
  prompt: string
  hint: string
  kind: MissionKind
  /** Consulta canónica (misiones SELECT) o SQL de apoyo. */
  solutionSql: string
  expectedColumns: string[]
  requiresOrder: boolean
  starterSql: string
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Élite del Ranking',
    topic: 'SELECT, WHERE, ORDER BY',
    prompt:
      'Lista IdJugador y RankingElo de los jugadores activos (Activo = TRUE) cuyo RankingElo sea mayor o igual a 1800, ordenados de mayor a menor ELO.',
    hint: 'Filtra con WHERE sobre "Activo" y "RankingElo", y ordena con ORDER BY ... DESC.',
    kind: 'select',
    solutionSql:
      'SELECT "IdJugador", "RankingElo" FROM public."Jugador" WHERE "Activo" = TRUE AND "RankingElo" >= 1800 ORDER BY "RankingElo" DESC;',
    expectedColumns: ['IdJugador', 'RankingElo'],
    requiresOrder: true,
    starterSql: 'SELECT ',
  },
  {
    id: 2,
    title: 'Partidas de Alto Premio',
    topic: 'BETWEEN',
    prompt:
      "Obtén IdPartida, FechaPartida y BolsaPremio de las partidas jugadas entre '2026-09-01' y '2026-10-31' inclusive cuya BolsaPremio supere los 700.00.",
    hint: 'Usa BETWEEN sobre "FechaPartida" con extremos inclusivos y filtra "BolsaPremio" > 700.',
    kind: 'select',
    solutionSql:
      "SELECT \"IdPartida\", \"FechaPartida\", \"BolsaPremio\" FROM public.\"Partida\" WHERE \"FechaPartida\" BETWEEN '2026-09-01 00:00:00' AND '2026-10-31 23:59:59' AND \"BolsaPremio\" > 700.00;",
    expectedColumns: ['IdPartida', 'FechaPartida', 'BolsaPremio'],
    requiresOrder: false,
    starterSql: 'SELECT ',
  },
  {
    id: 3,
    title: 'Directorio Internacional',
    topic: 'INNER JOIN',
    prompt:
      'Muestra el Nickname, NombreReal y la descripción del país (alias "Pais") de todos los usuarios activos.',
    hint: 'Une "Usuario" con "ParametroItem" por "IdPais" y proyecta pi."Descripcion" AS "Pais".',
    kind: 'select',
    solutionSql:
      'SELECT u."Nickname", u."NombreReal", pi."Descripcion" AS "Pais" FROM public."Usuario" u JOIN public."ParametroItem" pi ON u."IdPais" = pi."IdParametroItem" WHERE u."Activo" = TRUE;',
    expectedColumns: ['Nickname', 'NombreReal', 'Pais'],
    requiresOrder: false,
    starterSql: 'SELECT ',
  },
  {
    id: 4,
    title: 'Escuadrón Valorant',
    topic: 'JOIN múltiple',
    prompt:
      "Lista IdJugador, Nickname y la descripción de su disciplina (alias \"Juego\") únicamente de los jugadores cuyo juego principal tenga código 'VAL'.",
    hint: 'Encadena Jugador → Usuario → ParametroItem y filtra pi."Codigo" = \'VAL\'.',
    kind: 'select',
    solutionSql:
      'SELECT j."IdJugador", u."Nickname", pi."Descripcion" AS "Juego" FROM public."Jugador" j JOIN public."Usuario" u ON j."IdUsuario" = u."IdUsuario" JOIN public."ParametroItem" pi ON j."IdJuegoPrincipal" = pi."IdParametroItem" WHERE pi."Codigo" = \'VAL\';',
    expectedColumns: ['IdJugador', 'Nickname', 'Juego'],
    requiresOrder: false,
    starterSql: 'SELECT ',
  },
  {
    id: 5,
    title: 'Cobertura de Casters',
    topic: 'LEFT JOIN + COUNT',
    prompt:
      'Lista todos los Caster verificados (Verificado = TRUE) mostrando su Nickname y la cantidad de partidas narradas (alias "TotalPartidas"). Incluye con 0 a quienes aún no narraron partidas.',
    hint: 'Parte de Caster/Usuario y usa LEFT JOIN hacia Partida. COUNT sobre la PK de Partida mantiene los ceros.',
    kind: 'select',
    solutionSql:
      'SELECT u."Nickname", COUNT(p."IdPartida") AS "TotalPartidas" FROM public."Caster" c JOIN public."Usuario" u ON c."IdUsuario" = u."IdUsuario" LEFT JOIN public."Partida" p ON c."IdCaster" = p."IdCaster" WHERE c."Verificado" = TRUE GROUP BY u."Nickname";',
    expectedColumns: ['Nickname', 'TotalPartidas'],
    requiresOrder: false,
    starterSql: 'SELECT ',
  },
  {
    id: 6,
    title: 'Partidas sin Sponsor',
    topic: 'LEFT JOIN + IS NULL',
    prompt:
      "Identifica IdPartida, FechaPartida y BolsaPremio de las partidas en estado 'FIN' (Finalizada) que aún no tienen patrocinio registrado en PatrocinioPartida.",
    hint: 'LEFT JOIN a PatrocinioPartida y filtra pp."IdPatrocinio" IS NULL junto con el código FIN.',
    kind: 'select',
    solutionSql:
      'SELECT p."IdPartida", p."FechaPartida", p."BolsaPremio" FROM public."Partida" p JOIN public."ParametroItem" pi ON p."IdEstadoPartida" = pi."IdParametroItem" LEFT JOIN public."PatrocinioPartida" pp ON p."IdPartida" = pp."IdPartida" WHERE pi."Codigo" = \'FIN\' AND pp."IdPatrocinio" IS NULL;',
    expectedColumns: ['IdPartida', 'FechaPartida', 'BolsaPremio'],
    requiresOrder: false,
    starterSql: 'SELECT ',
  },
  {
    id: 7,
    title: 'Inversión por Sponsor',
    topic: 'GROUP BY + SUM',
    prompt:
      'Calcula por cada MarcaSponsor: la cantidad de patrocinios (alias "Cantidad") y la suma de MontoBruto (alias "TotalInvertido"), ordenado por "TotalInvertido" descendente.',
    hint: 'GROUP BY "MarcaSponsor" con COUNT y SUM; ORDER BY el alias o la expresión agregada DESC.',
    kind: 'select',
    solutionSql:
      'SELECT "MarcaSponsor", COUNT("IdPatrocinio") AS "Cantidad", SUM("MontoBruto") AS "TotalInvertido" FROM public."PatrocinioPartida" GROUP BY "MarcaSponsor" ORDER BY "TotalInvertido" DESC;',
    expectedColumns: ['MarcaSponsor', 'Cantidad', 'TotalInvertido'],
    requiresOrder: true,
    starterSql: 'SELECT ',
  },
  {
    id: 8,
    title: 'Arenas Más Activas',
    topic: 'GROUP BY + HAVING',
    prompt:
      'Muestra el Nombre del torneo y el promedio de DuracionMinutos redondeado a 2 decimales (alias "PromedioDuracion") solo de los torneos con más de 3 partidas registradas.',
    hint: 'Usa ROUND(AVG(...), 2) y filtra grupos con HAVING COUNT(...) > 3.',
    kind: 'select',
    solutionSql:
      'SELECT t."Nombre", ROUND(AVG(p."DuracionMinutos"), 2) AS "PromedioDuracion" FROM public."Torneo" t JOIN public."Partida" p ON t."IdTorneo" = p."IdTorneo" GROUP BY t."Nombre" HAVING COUNT(p."IdPartida") > 3;',
    expectedColumns: ['Nombre', 'PromedioDuracion'],
    requiresOrder: false,
    starterSql: 'SELECT ',
  },
  {
    id: 9,
    title: 'Cierre de Partidas en Vivo',
    topic: 'UPDATE',
    prompt:
      "Actualiza todas las partidas que están en estado 'LIVE' para pasarlas al estado 'FIN'.",
    hint: 'Actualiza "IdEstadoPartida" de las filas LIVE al IdParametroItem de FIN (puedes usar subconsultas por "Codigo").',
    kind: 'update',
    solutionSql: `UPDATE public."Partida"
SET "IdEstadoPartida" = (
  SELECT "IdParametroItem" FROM public."ParametroItem" WHERE "Codigo" = 'FIN'
)
WHERE "IdEstadoPartida" = (
  SELECT "IdParametroItem" FROM public."ParametroItem" WHERE "Codigo" = 'LIVE'
);`,
    expectedColumns: [],
    requiresOrder: false,
    starterSql: 'UPDATE public."Partida"\nSET ',
  },
  {
    id: 10,
    title: 'Vista Ejecutiva',
    topic: 'CREATE VIEW',
    prompt:
      'Crea una vista llamada vw_ResumenJugadores que proyecte IdJugador, Nickname, total de partidas como MVP (alias "PartidasMVP") y suma de PagoNetoJugador usando COALESCE(..., 0) (alias "GananciaNeta").',
    hint: 'Parte de Jugador + Usuario, LEFT JOIN Partida por MVP y PatrocinioPartida; COALESCE(SUM(...), 0) evita NULL en el jugador 8.',
    kind: 'view',
    solutionSql: `CREATE OR REPLACE VIEW vw_ResumenJugadores AS
SELECT
  j."IdJugador",
  u."Nickname",
  COUNT(p."IdPartida") AS "PartidasMVP",
  COALESCE(SUM(pp."PagoNetoJugador"), 0) AS "GananciaNeta"
FROM public."Jugador" j
JOIN public."Usuario" u ON j."IdUsuario" = u."IdUsuario"
LEFT JOIN public."Partida" p ON j."IdJugador" = p."IdJugadorMVP"
LEFT JOIN public."PatrocinioPartida" pp ON p."IdPartida" = pp."IdPartida"
GROUP BY j."IdJugador", u."Nickname";`,
    expectedColumns: ['IdJugador', 'Nickname', 'PartidasMVP', 'GananciaNeta'],
    requiresOrder: true,
    starterSql: 'CREATE VIEW vw_ResumenJugadores AS\nSELECT ',
  },
]

export function getMission(id: number): Mission {
  const mission = MISSIONS.find((m) => m.id === id)
  if (!mission) throw new Error(`Misión ${id} no encontrada`)
  return mission
}
