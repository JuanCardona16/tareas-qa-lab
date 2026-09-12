# Infrastructure Layer (implementación técnica)

Solo importa de `domain/`. Implementa los contratos de repositorio y servicios técnicos.

## Cliente / Conexión (`src/infrastructure/api/`)

- Cliente HTTP para la API REST de tareas (fetch/axios). Base URL en `VITE_API_URL`.
- Las env vars para el cliente **deben** usar prefijo `VITE_*` para estar disponibles en el código cliente (Vite).
- Nunca exponer claves secretas en cliente. Este proyecto no requiere auth en Fase 1; si se añade, usar claves publishable.

## Esquema de Base de Datos (Fase 1: in-memory)

```sql
-- Fase 1: sin DB real, repositorio en memoria para el laboratorio
-- Fase 2 (si se añade persistencia):
-- table tasks (
--   id text primary key,
--   titulo text not null check (length(titulo) between 1 and 100),
--   descripcion text check (length(descripcion) <= 500),
--   estado text not null check (estado in ('pendiente','en_progreso','completada')),
--   created_at timestamptz not null,
--   updated_at timestamptz not null
-- );
```

## Repositorios concretos (`src/infrastructure/repositories/`)

- `TaskRepositoryInMemory` — implementación en memoria para desarrollo y tests unitarios.
- `TaskRepositoryHttp` — implementación contra API REST (cuando exista backend separado).

Ambos implementan `TaskRepository` de `domain/repositories/TaskRepository.ts`.

## Servicios externos

- Ninguno en Fase 1. En fases posteriores: posible deploy en Vercel/Netlify (ver `docs/09-git-deploy.md`).

## API REST prevista (`src/infrastructure/api/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tasks?estado=&q=` | Listar con filtros |
| GET | `/api/tasks/:id` | Obtener por id |
| POST | `/api/tasks` | Crear |
| PUT | `/api/tasks/:id` | Actualizar |
| DELETE | `/api/tasks/:id` | Eliminar |

Códigos: 200/201/204, 400 (validación), 404 (no encontrado), 500 (error inesperado).

## Variables de Entorno (`.env` — NUNCA subir a git)

```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=tareas-qa-lab
```

- `.env` y `.env.local` en `.gitignore`.
- Solo `VITE_*` llega al cliente; sin ese prefijo la variable no existe en el bundle.
- Documentar cada nueva env var aquí y en `README.md`.
