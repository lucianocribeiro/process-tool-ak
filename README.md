# Repositorio de Procesos — Nordia Logística S.A.

Herramienta web para publicar el relevamiento de procesos de un cliente: cada proceso se
presenta como un diagrama de carriles navegable, con detalle paso a paso, excepciones,
requisitos y oportunidades de mejora, más un asistente de IA que responde consultas sobre
la documentación cargada.

> Los nombres de la empresa y de las personas son genéricos. Este repositorio es un ejemplo
> de entrega de mapeo de procesos, no contiene datos reales de ningún cliente.

## Qué incluye

- **Acceso con contraseña.** Login server-side con cookie de sesión firmada (HMAC-SHA256,
  `httpOnly`, 7 días) y middleware que protege todas las rutas.
- **Tres procesos relevados**
  - `PRO-01` Gestión de Tráfico — Operaciones
  - `PRO-02` Control de Patentes y Mantenimiento — Flota
  - `PRO-03` Liquidación de Choferes — Administración
- **Diagramas interactivos.** Diagramas de carriles renderizados en SVG a partir de datos,
  con ruteo ortogonal, zoom, ajuste automático al ancho disponible y resaltado de las
  conexiones del paso activo. Cada nodo es clickeable.
- **Detalle por paso.** Panel lateral con responsable, sistema, duración, entradas, salidas,
  reglas de negocio, hitos horarios, punto de dolor y oportunidad.
- **Pestañas por proceso.** Diagrama · Pasos · Excepciones y reglas · Oportunidades.
- **Asistente de Procesos.** Chat que responde sobre la documentación. Con
  `ANTHROPIC_API_KEY` configurada usa la API de Anthropic; sin clave responde en modo local,
  construyendo la respuesta a partir de la misma documentación.
- Todo en español.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · CSS propio, sin dependencias de UI.
Las rutas de API y el middleware corren en el runtime Edge.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # editar valores
npm run dev                  # http://localhost:3000
```

Contraseña por defecto si no se define `APP_PASSWORD`: `procesos2026`
(la pantalla de login lo avisa explícitamente mientras esté en ese modo).

## Deploy en Vercel

1. Subir el repositorio a GitHub e importarlo en Vercel. El framework se detecta solo
   (Next.js); no hace falta configurar comandos de build.
2. En **Settings → Environment Variables** cargar:

   | Variable            | Requerida | Descripción                                                                 |
   | ------------------- | --------- | --------------------------------------------------------------------------- |
   | `APP_PASSWORD`      | Sí        | Contraseña que se le comparte al cliente.                                    |
   | `SESSION_SECRET`    | Sí        | Cadena aleatoria larga para firmar la cookie de sesión.                      |
   | `ANTHROPIC_API_KEY` | No        | Habilita el asistente con IA. Sin ella el asistente funciona en modo local.  |
   | `ANTHROPIC_MODEL`   | No        | Modelo a utilizar. Por defecto `claude-sonnet-5`.                            |

   Para generar el secreto: `openssl rand -hex 32`

3. Deploy. La URL pública queda protegida por la pantalla de login.

Al cambiar `APP_PASSWORD` o `SESSION_SECRET` se invalidan las sesiones abiertas.

## Cómo cargar otros procesos

Toda la documentación vive en un único archivo: **`lib/processes.ts`**. Agregar un proceso
es agregar un objeto `Proceso` al array `PROCESOS`; el menú lateral, la portada, los
diagramas y el asistente se actualizan solos.

Cada proceso define:

- **`lanes`** — carriles del diagrama. `rows` permite apilar varias filas dentro de un carril.
- **`nodes`** — nodos con `lane`, `col` y `row` (grilla), y `kind`:
  `inicio` · `fin` · `tarea` · `decision` · `datos` · `documento`.
- **`edges`** — conexiones con `label` opcional y estrategia de ruteo:

  | `route`  | Recorrido                                                              |
  | -------- | ---------------------------------------------------------------------- |
  | `h`      | horizontal directo                                                     |
  | `v`      | vertical directo                                                       |
  | `hv`     | horizontal y luego vertical hacia el borde superior/inferior del destino |
  | `vh`     | vertical y luego horizontal hacia el borde lateral del destino          |
  | `jog`    | sale de costado `offset` px, va en vertical y entra de costado          |
  | `around` | rodea por arriba o abajo (`side` + `offset`); útil para retornos largos |

  `variant: "retorno"` dibuja la conexión punteada, para reprocesos y rechazos.

- **`pasos`** — el detalle que abre el panel lateral. El `id` debe coincidir con el del nodo.
- **`excepciones`**, **`requisitos`**, **`oportunidades`** — el resto de las pestañas.

## Estructura

```
app/
  (app)/inicio                 portada del repositorio
  (app)/procesos/[slug]        vista de proceso
  api/auth/login|logout        sesión
  api/chat                     asistente (Anthropic + fallback local)
  login                        pantalla de acceso
components/
  FlowDiagram.tsx              motor de diagramas SVG (layout + ruteo ortogonal)
  ProcessView.tsx              pestañas y contenido del proceso
  StepDrawer.tsx               panel de detalle de paso
  Agent.tsx                    asistente de procesos
lib/
  processes.ts                 documentación de los procesos (fuente única)
  knowledge.ts                 serialización de la documentación para el asistente
  fallback.ts                  respuestas locales sin API key
  auth.ts                      sesión firmada
middleware.ts                  protección de rutas
```
