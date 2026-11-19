# CONTEXT.md — SQL Arena: E-Sports & Streaming

Documento de handoff para otro agente (landing / marketing / SEO).  
Objetivo: **incluir y promocionar este proyecto en la landing** para aumentar tráfico cualificado hacia la práctica de PostgreSQL.

---

## 1. Qué es el producto

**SQL Arena: E-Sports & Streaming** es una SPA educativa estilo Codecademy para practicar **PostgreSQL real en el navegador** (sin backend).

| Campo | Valor |
|--------|--------|
| Nombre público | SQL Arena: E-Sports & Streaming |
| Tipo | App web interactiva (misiones SQL gamificadas) |
| Audiencia | Estudiantes universitarios de Base de Datos I (y autodidactas de SQL) |
| Institución / docente | Universidad del Norte — Prof. Msig. Marcos Arrieta |
| Dominio de datos | E-Sports & Streaming (jugadores, casters, torneos, partidas, patrocinios) |
| Costo de infra | $0/mes (estático + PGlite en el cliente) |
| Repo | https://github.com/Arrieta32/SQL_ARENA |
| Spec canónica | `SQL_ARENA_SPEC.md` en la raíz del repo |
| README técnico | `README.md` |

**URL de producción (confirmar):**  
`https://wonderful-bush-06c2aab1e.azurestaticapps.net`  
(Nombre del recurso Azure Static Web Apps del workflow. Si el dominio cambió, reemplazar aquí.)

**URL de desarrollo local:** `http://localhost:5173`

---

## 2. Propuesta de valor (para copy de landing)

Usá estos mensajes; no inventes features que no existan.

### Headline sugerido
**Practicá PostgreSQL de verdad en el navegador — con un universo E-Sports.**

### Subheadline
10 misiones progresivas, motor PostgreSQL real (PGlite/WASM), feedback pedagógico al instante. Sin instalar nada.

### Bullets de valor
- **PostgreSQL real**, no un simulador: consultas se ejecutan en el navegador con PGlite.
- **10 misiones** desde SELECT/WHERE hasta UPDATE y CREATE VIEW.
- Tema **E-Sports & Streaming** (más atractivo que el típico “empleados/pedidos”).
- **Editor SQL** con resaltado (CodeMirror) y atajo Ctrl/Cmd+Enter.
- **Diccionario de tablas** (PK/FK/tipos) dentro de la misma pantalla.
- **Grader automático** con diagnóstico pedagógico (LEFT JOIN, GROUP BY, comillas PascalCase).
- Progresión secuencial (1→10) y Bonus de esquema del examen al completar el 100%.
- Identificación simple (Nombre + C.I.) y progreso en el dispositivo.
- Hosting estático en Azure — rápido y gratis.

### CTA primario
**Entrar a SQL Arena** → link a la URL de producción.

### CTA secundario
**Ver el repo / cómo desplegar** → GitHub.

### Anti-claims (no decir)
- No es un curso completo con video.
- No guarda progreso en la nube (es `localStorage`).
- No hay multiplayer ni ranking público de estudiantes en la UI.
- El webhook a Google Sheets es telemetría del docente, no un feature de marketing.

---

## 3. Experiencia del usuario (flujo)

1. Modal de ingreso: **Nombre y Apellido** + **C.I.**
2. Sidebar: **Misiones 1–10** con desbloqueo secuencial (candado hasta aprobar la anterior) + **Bonus: Esquema del Examen** (al 10/10) + Diccionario de Tablas de práctica.
3. Panel central: consigna, pista opcional, editor SQL, botones:
   - Ejecutar SQL
   - Validar Misión
   - Reiniciar Base de Datos
4. Tabla de resultados + mensajes de éxito/error pedagógicos.
5. Header: progreso X/10 + “Cambiar Estudiante”.

### Las 10 misiones (títulos para la landing)

1. Élite del Ranking — SELECT, WHERE, ORDER BY  
2. Partidas de Alto Premio — BETWEEN  
3. Directorio Internacional — INNER JOIN  
4. Escuadrón Valorant — JOIN múltiple  
5. Cobertura de Casters — LEFT JOIN + COUNT  
6. Partidas sin Sponsor — LEFT JOIN + IS NULL  
7. Inversión por Sponsor — GROUP BY + SUM  
8. Arenas Más Activas — GROUP BY + HAVING  
9. Cierre de Partidas en Vivo — UPDATE  
10. Vista Ejecutiva — CREATE VIEW  

---

## 4. Stack (por si la landing habla de tecnología)

- Vite + React + TypeScript + Tailwind CSS + Lucide  
- `@electric-sql/pglite` (PostgreSQL en WebAssembly)  
- CodeMirror 6 + dialecto PostgreSQL  
- Azure Static Web Apps + `staticwebapp.config.json`  
- Telemetría opcional: webhook → Google Apps Script / Sheets  

---

## 5. Cómo integrar en la landing (brief para el otro agente)

### Objetivo de negocio
Aumentar tráfico y clics hacia SQL Arena; posicionar la marca docente/institucional como “práctica SQL moderna”.

### Piezas mínimas a agregar en la landing

1. **Sección hero o bloque destacado “SQL Arena”**
   - Brand fuerte: “SQL Arena”
   - 1 headline + 1 frase de apoyo + CTA “Practicar ahora”
   - Visual: captura del IDE oscuro / editor + misiones (o mock estilo e-sports)

2. **Sección “Cómo funciona”** (3 pasos)
   - Entrá con tu nombre → Elegí una misión → Ejecutá y validá SQL

3. **Sección “Qué vas a aprender”**
   - Lista corta de temas SQL (JOIN, GROUP BY, VIEW…) usando los títulos de misiones

4. **Prueba social / académica**
   - “Diseñado para Base de Datos I — Universidad del Norte”
   - Opcional: “PostgreSQL real en el navegador”

5. **SEO / metadatos**
   - Title: `SQL Arena | Práctica PostgreSQL E-Sports`
   - Description: `Practicá PostgreSQL en el navegador con 10 misiones gamificadas de e-sports y streaming. Sin instalar nada.`
   - Keywords naturales: PostgreSQL, práctica SQL, PGlite, e-sports, Base de Datos, Universidad del Norte
   - Open Graph con imagen del producto + link absoluto a la app

6. **Analytics**
   - Evento `cta_sql_arena_click` en el botón principal
   - UTM en el CTA:  
     `?utm_source=landing&utm_medium=cta&utm_campaign=sql_arena`

### Copy CTA listo para pegar

```text
Botón: Practicar SQL ahora
Link: https://wonderful-bush-06c2aab1e.azurestaticapps.net/?utm_source=landing&utm_medium=cta&utm_campaign=sql_arena
Aria: Abrir SQL Arena en una nueva pestaña
```

### Prompt corto para el agente de la landing

```text
Usando CONTEXT.md de SQL Arena, agregá a la landing una sección destacada
(y/o hero secundario) que promocione SQL Arena: E-Sports & Streaming.
Incluí headline, 1 frase, 3 bullets de valor, CTA a la URL de producción
con UTM, y metadatos SEO/OG. Mantené el design system de la landing;
no inventes features fuera de CONTEXT.md. Objetivo: más tráfico hacia la app.
```

---

## 6. Assets / diseño

- UI de la app: modo oscuro “IDE / E-Sports”, tipografías Syne + Outfit + JetBrains Mono, acento verde `#2EE59D`.
- Favicon: `public/favicon.svg`
- Capturas: sacar screenshots reales de la app en desktop (login, misión + editor, diccionario).
- Evitar en la landing: stock genérico de “código morado”, promesas de certificación, o dashboards inventados.

---

## 7. Restricciones técnicas útiles al linkear

- Es SPA estática: el link debe ir a la raíz de Azure SWA (o custom domain si existe).
- Primera carga descarga WASM de PGlite (~varios MB): mencionar “funciona offline en el navegador tras cargar” está OK; no decir “instantáneo 0 KB”.
- Telemetría (Sheets) requiere secrets de build; la práctica funciona igual sin ella.

---

## 8. Checklist de aceptación (landing)

- [ ] CTA visible above-the-fold o en sección propia no enterrada  
- [ ] Link correcto + UTM  
- [ ] Nombre del producto “SQL Arena” como señal de marca  
- [ ] Menciona PostgreSQL real / en el navegador  
- [ ] Menciona 10 misiones + tema e-sports  
- [ ] Meta description + OG image  
- [ ] Mobile: CTA usable  
- [ ] No contradice este CONTEXT  

---

## 9. Contacto / ownership

- Repo owner: `Arrieta32/SQL_ARENA`  
- Docente: Prof. Msig. Marcos Arrieta — Base de Datos I  
- Spec y comportamiento pedagógico: `SQL_ARENA_SPEC.md` es la fuente de verdad  

Cuando peques este archivo a otro agente, agregá también la **URL final de la landing** y, si aplica, el **design system / repo de la landing**.
