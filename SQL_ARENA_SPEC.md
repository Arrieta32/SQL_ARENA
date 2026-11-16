# Especificación Técnica Completa: SQL Arena — E-Sports & Streaming

## 1. Visión General
**SQL Arena: E-Sports & Streaming** es una SPA interactiva estilo Codecademy para practicar PostgreSQL real en el navegador (Base de Datos I — Universidad del Norte — Prof. Msig. Marcos Arrieta).
- **Costo de Infraestructura:** $0 USD/mes.
- **Motor SQL:** `@electric-sql/pglite` (PostgreSQL real en WebAssembly corriendo en memoria del cliente).
- **Hosting:** Azure Static Web Apps.
- **Telemetría:** Webhook HTTP POST hacia Google Apps Script / Google Sheets.

---

## 2. Stack Tecnológico
- **Frontend:** Vite + React + TypeScript + Tailwind CSS + `lucide-react`
- **Editor SQL:** `@uiw/react-codemirror` + `@codemirror/lang-sql` (dialecto PostgreSQL)
- **Base de Datos:** `@electric-sql/pglite`

---

## 3. Esquema de Base de Datos y Datos Semilla

### 3.1. DDL Completo (Esquema `public`, PascalCase)
```sql
DROP TABLE IF EXISTS public."PatrocinioPartida" CASCADE;
DROP TABLE IF EXISTS public."Partida" CASCADE;
DROP TABLE IF EXISTS public."Torneo" CASCADE;
DROP TABLE IF EXISTS public."Caster" CASCADE;
DROP TABLE IF EXISTS public."Jugador" CASCADE;
DROP TABLE IF EXISTS public."Usuario" CASCADE;
DROP TABLE IF EXISTS public."ParametroItem" CASCADE;
DROP TABLE IF EXISTS public."Parametro" CASCADE;

CREATE TABLE public."Parametro" (
    "IdParametro" SERIAL PRIMARY KEY,
    "Codigo" VARCHAR(30) NOT NULL UNIQUE,
    "Nombre" VARCHAR(100) NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public."ParametroItem" (
    "IdParametroItem" SERIAL PRIMARY KEY,
    "IdParametro" INTEGER NOT NULL REFERENCES public."Parametro"("IdParametro"),
    "Codigo" VARCHAR(20) NOT NULL,
    "Descripcion" VARCHAR(120) NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE ("IdParametro", "Codigo")
);

CREATE TABLE public."Usuario" (
    "IdUsuario" SERIAL PRIMARY KEY,
    "Nickname" VARCHAR(50) NOT NULL UNIQUE,
    "NombreReal" VARCHAR(120) NOT NULL,
    "Email" VARCHAR(120) NOT NULL UNIQUE,
    "IdPais" INTEGER NOT NULL REFERENCES public."ParametroItem"("IdParametroItem"),
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public."Jugador" (
    "IdJugador" SERIAL PRIMARY KEY,
    "IdUsuario" INTEGER NOT NULL UNIQUE REFERENCES public."Usuario"("IdUsuario"),
    "IdJuegoPrincipal" INTEGER NOT NULL REFERENCES public."ParametroItem"("IdParametroItem"),
    "RankingElo" INTEGER NOT NULL DEFAULT 1000 CHECK ("RankingElo" >= 0),
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public."Caster" (
    "IdCaster" SERIAL PRIMARY KEY,
    "IdUsuario" INTEGER NOT NULL UNIQUE REFERENCES public."Usuario"("IdUsuario"),
    "Especialidad" VARCHAR(80) NOT NULL,
    "Verificado" BOOLEAN NOT NULL DEFAULT TRUE,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public."Torneo" (
    "IdTorneo" SERIAL PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL,
    "IdPaisSede" INTEGER NOT NULL REFERENCES public."ParametroItem"("IdParametroItem"),
    "PremioBase" NUMERIC(12, 2) NOT NULL CHECK ("PremioBase" > 0),
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public."Partida" (
    "IdPartida" SERIAL PRIMARY KEY,
    "IdTorneo" INTEGER NOT NULL REFERENCES public."Torneo"("IdTorneo"),
    "IdJugadorMVP" INTEGER NOT NULL REFERENCES public."Jugador"("IdJugador"),
    "IdCaster" INTEGER NOT NULL REFERENCES public."Caster"("IdCaster"),
    "FechaPartida" TIMESTAMP NOT NULL,
    "DuracionMinutos" INTEGER NOT NULL CHECK ("DuracionMinutos" > 0),
    "BolsaPremio" NUMERIC(12, 2) NOT NULL CHECK ("BolsaPremio" >= 0),
    "IdEstadoPartida" INTEGER NOT NULL REFERENCES public."ParametroItem"("IdParametroItem"),
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public."PatrocinioPartida" (
    "IdPatrocinio" SERIAL PRIMARY KEY,
    "IdPartida" INTEGER NOT NULL UNIQUE REFERENCES public."Partida"("IdPartida"),
    "MarcaSponsor" VARCHAR(80) NOT NULL,
    "IdMetodoDesembolso" INTEGER NOT NULL REFERENCES public."ParametroItem"("IdParametroItem"),
    "MontoBruto" NUMERIC(12, 2) NOT NULL,
    "ComisionLiga" NUMERIC(12, 2) NOT NULL,
    "PagoNetoJugador" NUMERIC(12, 2) NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 3.2. DML Seed Completo
```sql
INSERT INTO public."Parametro" ("IdParametro", "Codigo", "Nombre", "Activo") VALUES
(1, 'PAIS',           'País de Origen',     TRUE),
(2, 'JUEGO',          'Disciplina E-Sport', TRUE),
(3, 'ESTADO_PARTIDA', 'Estado de Partida',  TRUE),
(4, 'METODO_PAGO',    'Método Desembolso',  TRUE);

INSERT INTO public."ParametroItem" ("IdParametroItem", "IdParametro", "Codigo", "Descripcion", "Activo") VALUES
(1,  1, 'PY',   'Paraguay',          TRUE),
(2,  1, 'AR',   'Argentina',         TRUE),
(3,  1, 'BR',   'Brasil',            TRUE),
(4,  1, 'CL',   'Chile',             TRUE),
(5,  2, 'VAL',  'Valorant',          TRUE),
(6,  2, 'CS2',  'Counter-Strike 2',  TRUE),
(7,  2, 'LOL',  'League of Legends', TRUE),
(8,  3, 'PROG', 'Programada',        TRUE),
(9,  3, 'LIVE', 'En Vivo',           TRUE),
(10, 3, 'FIN',  'Finalizada',        TRUE),
(11, 3, 'CANC', 'Cancelada',         TRUE),
(12, 4, 'TRAN', 'Transferencia',     TRUE),
(13, 4, 'USDT', 'Cripto USDT',       TRUE),
(14, 4, 'PAYP', 'PayPal',            TRUE);

INSERT INTO public."Usuario" ("IdUsuario", "Nickname", "NombreReal", "Email", "IdPais", "Activo") VALUES
(1,  'GuaraniSniper', 'Matías Benítez',    'matias@arena.gg',    1, TRUE),
(2,  'ValkyriePY',    'Sofía Insfrán',     'sofia@arena.gg',     1, TRUE),
(3,  'PampaRush',     'Lucas Fernández',   'lucas@arena.gg',     2, TRUE),
(4,  'SambaAce',      'Gabriel Costa',     'gabriel@arena.gg',   3, TRUE),
(5,  'AndesShadow',   'Diego Rojas',       'diego@arena.gg',     4, TRUE),
(6,  'TerereKing',    'Alejandro Vera',    'ale@arena.gg',       1, TRUE),
(7,  'NovaStrike',    'Camila Duarte',     'camila@arena.gg',    2, TRUE),
(8,  'ZeroPing',      'Bruno Silva',       'bruno@arena.gg',     3, TRUE),
(9,  'CasterPro',     'Carlos Mendoza',    'carlos@cast.gg',     1, TRUE),
(10, 'VoiceOfArena',  'Valeria Gómez',     'valeria@cast.gg',    2, TRUE),
(11, 'HypeMaster',    'Thiago Oliveira',   'thiago@cast.gg',     3, TRUE),
(12, 'RookieMic',     'Fernando Ortiz',    'fernando@cast.gg',   1, TRUE);

INSERT INTO public."Jugador" ("IdJugador", "IdUsuario", "IdJuegoPrincipal", "RankingElo", "Activo") VALUES
(1, 1, 5, 2150, TRUE),
(2, 2, 5, 1980, TRUE),
(3, 3, 6, 1850, TRUE),
(4, 4, 6, 2210, TRUE),
(5, 5, 7, 1620, TRUE),
(6, 6, 5, 1490, TRUE),
(7, 7, 7, 1740, TRUE),
(8, 8, 6, 1320, FALSE);

INSERT INTO public."Caster" ("IdCaster", "IdUsuario", "Especialidad", "Verificado", "Activo") VALUES
(1, 9,  'Tactical Shooters', TRUE,  TRUE),
(2, 10, 'MOBA & Estrategia', TRUE,  TRUE),
(3, 11, 'Análisis Post-Game',TRUE,  TRUE),
(4, 2,  'Cobertura Regional',FALSE, TRUE);

INSERT INTO public."Torneo" ("IdTorneo", "Nombre", "IdPaisSede", "PremioBase", "Activo") VALUES
(1, 'Asunción Masters Cup',   1, 1500.00, TRUE),
(2, 'Buenos Aires Pro League',2, 2500.00, TRUE),
(3, 'São Paulo Major Arena',  3, 4000.00, TRUE),
(4, 'Santiago Cyber Clash',   4, 1800.00, TRUE),
(5, 'Copa Sudamericana Open', 1, 1200.00, TRUE);

INSERT INTO public."Partida" ("IdPartida", "IdTorneo", "IdJugadorMVP", "IdCaster", "FechaPartida", "DuracionMinutos", "BolsaPremio", "IdEstadoPartida", "Activo") VALUES
(1,  1, 1, 1, '2026-08-05 18:00:00', 42, 450.00,  10, TRUE),
(2,  1, 2, 1, '2026-08-12 19:30:00', 38, 520.00,  10, TRUE),
(3,  2, 3, 2, '2026-08-20 20:00:00', 51, 800.00,  10, TRUE),
(4,  2, 4, 1, '2026-09-02 18:15:00', 47, 950.00,  10, TRUE),
(5,  3, 4, 2, '2026-09-10 21:00:00', 55, 1200.00, 10, TRUE),
(6,  3, 1, 1, '2026-09-18 19:00:00', 44, 1100.00, 10, TRUE),
(7,  1, 6, 2, '2026-09-25 17:30:00', 35, 400.00,  10, TRUE),
(8,  4, 5, 1, '2026-10-03 20:00:00', 49, 650.00,  10, TRUE),
(9,  4, 7, 2, '2026-10-11 18:45:00', 53, 720.00,  10, TRUE),
(10, 3, 2, 1, '2026-10-19 21:30:00', 46, 1300.00, 10, TRUE),
(11, 2, 3, 2, '2026-10-27 19:00:00', 41, 780.00,  10, TRUE),
(12, 1, 1, 1, '2026-11-02 18:00:00', 39, 600.00,  10, TRUE),
(13, 3, 4, 2, '2026-11-06 20:15:00', 58, 1500.00, 10, TRUE),
(14, 5, 5, 1, '2026-11-10 17:00:00', 36, 350.00,  10, TRUE),
(15, 5, 7, 2, '2026-11-12 19:30:00', 43, 480.00,  10, TRUE),
(16, 2, 6, 1, '2026-09-14 16:00:00', 15, 300.00,  11, TRUE),
(17, 4, 3, 2, '2026-10-15 16:30:00', 12, 400.00,  11, TRUE),
(18, 5, 2, 1, '2026-11-08 15:00:00', 10, 250.00,  11, FALSE),
(19, 1, 1, 1, '2026-11-16 15:00:00', 28, 700.00,  9,  TRUE),
(20, 3, 4, 2, '2026-11-16 15:30:00', 31, 1400.00, 9,  TRUE);

INSERT INTO public."PatrocinioPartida" ("IdPatrocinio", "IdPartida", "MarcaSponsor", "IdMetodoDesembolso", "MontoBruto", "ComisionLiga", "PagoNetoJugador", "Activo") VALUES
(1,  1,  'HyperX Latam',   12, 450.00,  45.00,  405.00,  TRUE),
(2,  2,  'RedBull Gaming', 13, 520.00,  52.00,  468.00,  TRUE),
(3,  3,  'Logitech G',     12, 800.00,  80.00,  720.00,  TRUE),
(4,  4,  'HyperX Latam',   14, 950.00,  95.00,  855.00,  TRUE),
(5,  5,  'RedBull Gaming', 13, 1200.00, 120.00, 1080.00, TRUE),
(6,  6,  'NVIDIA GeForce', 12, 1100.00, 110.00, 990.00,  TRUE),
(7,  7,  'Logitech G',     14, 400.00,  40.00,  360.00,  TRUE),
(8,  8,  'HyperX Latam',   12, 650.00,  65.00,  585.00,  TRUE),
(9,  9,  'NVIDIA GeForce', 13, 720.00,  72.00,  648.00,  TRUE),
(10, 10, 'RedBull Gaming', 13, 1300.00, 130.00, 1170.00, TRUE),
(11, 11, 'Logitech G',     12, 780.00,  78.00,  702.00,  TRUE),
(12, 12, 'NVIDIA GeForce', 14, 600.00,  60.00,  540.00,  TRUE);

SELECT setval(pg_get_serial_sequence('public."Parametro"', 'IdParametro'), COALESCE(MAX("IdParametro"), 1)) FROM public."Parametro";
SELECT setval(pg_get_serial_sequence('public."ParametroItem"', 'IdParametroItem'), COALESCE(MAX("IdParametroItem"), 1)) FROM public."ParametroItem";
SELECT setval(pg_get_serial_sequence('public."Usuario"', 'IdUsuario'), COALESCE(MAX("IdUsuario"), 1)) FROM public."Usuario";
SELECT setval(pg_get_serial_sequence('public."Jugador"', 'IdJugador'), COALESCE(MAX("IdJugador"), 1)) FROM public."Jugador";
SELECT setval(pg_get_serial_sequence('public."Caster"', 'IdCaster'), COALESCE(MAX("IdCaster"), 1)) FROM public."Caster";
SELECT setval(pg_get_serial_sequence('public."Torneo"', 'IdTorneo'), COALESCE(MAX("IdTorneo"), 1)) FROM public."Torneo";
SELECT setval(pg_get_serial_sequence('public."Partida"', 'IdPartida'), COALESCE(MAX("IdPartida"), 1)) FROM public."Partida";
SELECT setval(pg_get_serial_sequence('public."PatrocinioPartida"', 'IdPatrocinio'), COALESCE(MAX("IdPatrocinio"), 1)) FROM public."PatrocinioPartida";
```

Cardinalidades: 4 parámetros, 14 ítems, 12 usuarios (2 roles duales), 8 jugadores, 4 casters, 5 torneos, 20 partidas, 12 patrocinios.

---

## 4. Catálogo de 10 Misiones y Soluciones Canónicas

### Misión 1 — Élite del Ranking (SELECT, WHERE, ORDER BY)
**Enunciado:** Lista IdJugador y RankingElo de los jugadores activos (Activo = TRUE) cuyo RankingElo sea mayor o igual a 1800, ordenados de mayor a menor ELO.
**Solución:** `SELECT "IdJugador", "RankingElo" FROM public."Jugador" WHERE "Activo" = TRUE AND "RankingElo" >= 1800 ORDER BY "RankingElo" DESC;`

### Misión 2 — Partidas de Alto Premio (BETWEEN)
**Enunciado:** Obtén IdPartida, FechaPartida y BolsaPremio de las partidas jugadas entre '2026-09-01' y '2026-10-31' inclusive cuya BolsaPremio supere los 700.00.
**Solución:** `SELECT "IdPartida", "FechaPartida", "BolsaPremio" FROM public."Partida" WHERE "FechaPartida" BETWEEN '2026-09-01 00:00:00' AND '2026-10-31 23:59:59' AND "BolsaPremio" > 700.00;`

### Misión 3 — Directorio Internacional (INNER JOIN con Catálogo)
**Enunciado:** Muestra el Nickname, NombreReal y la descripción del país (alias "Pais") de todos los usuarios activos.
**Solución:** `SELECT u."Nickname", u."NombreReal", pi."Descripcion" AS "Pais" FROM public."Usuario" u JOIN public."ParametroItem" pi ON u."IdPais" = pi."IdParametroItem" WHERE u."Activo" = TRUE;`

### Misión 4 — Escuadrón Valorant (JOIN Múltiple)
**Enunciado:** Lista IdJugador, Nickname y la descripción de su disciplina (alias "Juego") únicamente de los jugadores cuyo juego principal tenga código 'VAL'.
**Solución:** `SELECT j."IdJugador", u."Nickname", pi."Descripcion" AS "Juego" FROM public."Jugador" j JOIN public."Usuario" u ON j."IdUsuario" = u."IdUsuario" JOIN public."ParametroItem" pi ON j."IdJuegoPrincipal" = pi."IdParametroItem" WHERE pi."Codigo" = 'VAL';`

### Misión 5 — Cobertura de Casters (LEFT JOIN + COUNT)
**Enunciado:** Lista todos los Caster verificados (Verificado = TRUE) mostrando su Nickname y la cantidad de partidas narradas (alias "TotalPartidas"). Incluye con 0 a quienes aún no narraron partidas.
**Solución:** `SELECT u."Nickname", COUNT(p."IdPartida") AS "TotalPartidas" FROM public."Caster" c JOIN public."Usuario" u ON c."IdUsuario" = u."IdUsuario" LEFT JOIN public."Partida" p ON c."IdCaster" = p."IdCaster" WHERE c."Verificado" = TRUE GROUP BY u."Nickname";`

### Misión 6 — Partidas sin Sponsor (LEFT JOIN + IS NULL)
**Enunciado:** Identifica IdPartida, FechaPartida y BolsaPremio de las partidas en estado 'FIN' (Finalizada) que aún no tienen patrocinio registrado en PatrocinioPartida.
**Solución:** `SELECT p."IdPartida", p."FechaPartida", p."BolsaPremio" FROM public."Partida" p JOIN public."ParametroItem" pi ON p."IdEstadoPartida" = pi."IdParametroItem" LEFT JOIN public."PatrocinioPartida" pp ON p."IdPartida" = pp."IdPartida" WHERE pi."Codigo" = 'FIN' AND pp."IdPatrocinio" IS NULL;`

### Misión 7 — Inversión por Sponsor (GROUP BY + SUM)
**Enunciado:** Calcula por cada MarcaSponsor: la cantidad de patrocinios (alias "Cantidad") y la suma de MontoBruto (alias "TotalInvertido"), ordenado por "TotalInvertido" descendente.
**Solución:** `SELECT "MarcaSponsor", COUNT("IdPatrocinio") AS "Cantidad", SUM("MontoBruto") AS "TotalInvertido" FROM public."PatrocinioPartida" GROUP BY "MarcaSponsor" ORDER BY "TotalInvertido" DESC;`

### Misión 8 — Arenas Más Activas (GROUP BY + HAVING)
**Enunciado:** Muestra el Nombre del torneo y el promedio de DuracionMinutos redondeado a 2 decimales (alias "PromedioDuracion") solo de los torneos con más de 3 partidas registradas.
**Solución:** `SELECT t."Nombre", ROUND(AVG(p."DuracionMinutos"), 2) AS "PromedioDuracion" FROM public."Torneo" t JOIN public."Partida" p ON t."IdTorneo" = p."IdTorneo" GROUP BY t."Nombre" HAVING COUNT(p."IdPartida") > 3;`

### Misión 9 — Cierre de Partidas en Vivo (UPDATE)
**Enunciado:** Actualiza todas las partidas que están en estado 'LIVE' para pasarlas al estado 'FIN'.
**Validación:** `SELECT COUNT(*) ... WHERE pi."Codigo" = 'LIVE'` = 0 y total de 'FIN' = 17 (sin tocar las 3 'CANC').

### Misión 10 — Vista Ejecutiva (CREATE VIEW)
**Enunciado:** Crea una vista llamada `vw_ResumenJugadores` que proyecte IdJugador, Nickname, total de partidas como MVP (alias "PartidasMVP") y suma de PagoNetoJugador usando COALESCE(..., 0) (alias "GananciaNeta").
**Validación:** `SELECT * FROM vw_ResumenJugadores ORDER BY "IdJugador"` — 8 jugadores; jugador 8 con 0 partidas y 0 ganancia.

---

## 5. Especificación del Grader Pedagógico
Misiones 1–8: compara columnas esperadas y filas (normalizando NUMERIC/BIGINT; ordenar en JS si la misión no pide ORDER BY).
Diagnósticos:
- Filas faltantes en Misión 5/8/10 → pista LEFT JOIN
- Error 42803 → GROUP BY
- Error 42P01 → comillas dobles / PascalCase

---

## 6. UI / UX (100% en Español)
Acceso libre a misiones 1–10. Modal Nombre/C.I. Persistencia localStorage. CodeMirror 6. Diccionario de tablas. Ejecutar / Validar / Reiniciar BD.

---

## 7. Telemetría Webhook
Variables: `VITE_GOOGLE_WEBHOOK_URL`, `VITE_WEBHOOK_SECRET`.
`fetch` con `mode: 'no-cors'`. Payload: token, nombre, ci, nivel, mision, estado (`INGRESO` | `COMPLETADO`).

---

## 8. Azure Static Web Apps
`public/staticwebapp.config.json` con navigationFallback, mimeTypes `.wasm`, globalHeaders (CSP con `wasm-unsafe-eval`).

---

## 9. Seguridad y Sandboxing
- `SET statement_timeout = '3000';`
- Editor máx. 5000 caracteres
- Bloquear: COPY, pg_read_file, pg_sleep, ALTER SYSTEM, CREATE EXTENSION, DO $$
- Permitir SELECT/INSERT/UPDATE/DELETE/CREATE VIEW/DROP VIEW
- Deduplicación webhook + cooldown 5s
