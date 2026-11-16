# SQL Arena: E-Sports & Streaming

Plataforma interactiva estilo Codecademy para practicar **PostgreSQL real en el navegador** (PGlite / WebAssembly), sin backend. Dominio: e-sports y streaming. Hosting previsto: **Azure Static Web Apps** ($0 de servidor).

## Stack

- Vite + React + TypeScript + Tailwind CSS
- `@electric-sql/pglite` — motor PostgreSQL en el cliente
- CodeMirror 6 (`@uiw/react-codemirror` + `@codemirror/lang-sql`)
- Telemetría opcional hacia Google Sheets vía Apps Script webhook

## Desarrollo local

```bash
npm install
cp .env.example .env   # opcional: webhook
npm run dev
```

Abrí `http://localhost:5173`, ingresá Nombre + C.I. y practicá las 10 misiones.

```bash
npm run build    # genera dist/
npm run preview  # sirve el build
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_GOOGLE_WEBHOOK_URL` | URL del Web App de Google Apps Script |
| `VITE_WEBHOOK_SECRET` | Token que valida tu script (`token` en el JSON) |

Si faltan, la app funciona igual; el webhook solo escribe `console.warn`.

### Importante: Vite las embebe en el BUILD (no en runtime)

`import.meta.env.VITE_*` se sustituye al ejecutar `npm run build`.  
**Las Application Settings del portal de Azure Static Web Apps NO inyectan valores en el JavaScript del frontend** (solo sirven a APIs/Functions).

Para que el webhook funcione en producción:

1. En GitHub → **Settings → Secrets and variables → Actions**, creá **repository secrets** (no Environment secrets de Azure):
   - `VITE_GOOGLE_WEBHOOK_URL` = URL completa del Web App de Apps Script  
     (ej. `https://script.google.com/macros/s/..../exec`)
   - `VITE_WEBHOOK_SECRET` = tu token
2. El workflow hace `npm run build` **fuera** del contenedor de Azure (con esos secrets) y luego sube `dist/` con `skip_app_build`.
3. Si faltan los secrets, el workflow **falla a propósito** con un mensaje claro.
4. Tras crearlos: merge/push a `main` o *Re-run all jobs*. Hard-refresh del sitio (Ctrl+Shift+R).

### Payload del webhook

```json
{
  "token": "VALOR_DE_VITE_WEBHOOK_SECRET",
  "nombre": "Nombre del Estudiante",
  "ci": "1234567",
  "nivel": "Misión 5",
  "mision": "Cobertura de Casters",
  "estado": "COMPLETADO"
}
```

Ingreso: `"nivel": "Acceso"`, `"mision": "Inicio de Sesión"`, `"estado": "INGRESO"`.

Envío con `fetch(..., { mode: 'no-cors' })`, deduplicación en `localStorage` y cooldown de 5 segundos.

### Ejemplo mínimo de Google Apps Script

1. Creá un Google Sheet y Extensiones → Apps Script.
2. Pegá un `doPost(e)` que lea `JSON.parse(e.postData.contents)`, valide `token` y escriba una fila.
3. Implementá como **Web App** (acceso: cualquiera) y copiá la URL a `VITE_GOOGLE_WEBHOOK_URL`.

## Despliegue en Azure Static Web Apps

1. Subí este repositorio a GitHub.
2. En Azure Portal → **Static Web Apps** → Create.
3. Conectá el repo; configuración típica:
   - **App location:** `/`
   - **Output location:** `dist`
   - **Build:** `npm run build` (o el workflow SWA por defecto con Node)
4. **No alcanza** con Application settings del portal Azure para el frontend Vite.
   En GitHub → Secrets and variables → Actions agregá `VITE_GOOGLE_WEBHOOK_URL` y `VITE_WEBHOOK_SECRET`, luego redesplegá (nuevo build).
5. El archivo [`public/staticwebapp.config.json`](public/staticwebapp.config.json) se copia a `dist/` y cubre:
   - SPA fallback a `index.html`
   - MIME `application/wasm`
   - Cabeceras de seguridad + CSP con `wasm-unsafe-eval` y `connect-src` hacia Apps Script

## Seguridad (cliente)

- `SET statement_timeout = '3000'`
- Editor máx. 5000 caracteres
- Bloqueo léxico de `COPY`, `pg_read_file`, `pg_sleep`, `VACUUM`, `ALTER SYSTEM`, `CREATE EXTENSION`, `DO $$`
- DML/DDL de práctica permitido (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE VIEW`, …)
- Resultados renderizados como texto (sin `dangerouslySetInnerHTML`)

## Spec

La fuente de verdad pedagógica y de datos está en [`SQL_ARENA_SPEC.md`](SQL_ARENA_SPEC.md).

## Docente

Universidad del Norte — Base de Datos I — Prof. Msig. Marcos Arrieta.
