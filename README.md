# tareas-qa-lab

> Laboratorio QA — mini gestión de tareas para diseño de pruebas

Aplicación web de gestión de tareas (CRUD, filtros por estado y API REST) diseñada como laboratorio académico para practicar diseño de pruebas de funcionalidad, rendimiento, seguridad, compatibilidad, accesibilidad y API.

## Funcionalidades

- **CRUD completo de tareas**: crear, listar, editar y eliminar tareas con validación.
- **Filtros por estado y búsqueda**: filtrar por `pendiente | en_progreso | completada` y búsqueda por texto/título.
- **API REST para tareas**: endpoints REST con validación, códigos HTTP correctos y manejo de errores.
- **Base para diseño de pruebas QA**: la app es el SUT (System Under Test) para diseñar planes de prueba en 6 dimensiones: funcionalidad, rendimiento, seguridad, compatibilidad, accesibilidad y API.

## Stack

TypeScript + React + Vite + Vitest + Testing Library. Ver detalle en [`docs/02-stack.md`](docs/02-stack.md).

## Requisitos

- Node.js 20+ (recomendado 22 LTS)
- pnpm 9+

## Desarrollo

```sh
pnpm install
pnpm dev        # dev server (Vite)
pnpm build      # build producción
pnpm check      # typecheck + lint
pnpm test       # tests Vitest
pnpm test:coverage  # cobertura
```

### Variables de entorno

Copia `.env.example` a `.env` (nunca se sube a git):

```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=tareas-qa-lab
```

Solo las variables con prefijo `VITE_*` llegan al cliente. El resto es server-only. Ver `docs/05-infrastructure.md`.

## Documentación

Toda la documentación vive en [`docs/`](docs/): visión, stack, arquitectura, convenciones, estado del proyecto, historial de cambios y metodología de trabajo para agentes IA. Ver [`AGENTS.md`](AGENTS.md) como punto de entrada.

## Licencia

Open-source (uso académico).
