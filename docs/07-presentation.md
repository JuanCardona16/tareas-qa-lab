# Presentation Layer (React UI + API transport)

Importa de `application/`. **Nunca** de `infrastructure/` directo.

## Sistema de Diseño (web)

- Tailwind CSS como base utilitaria (previsto).
- Componentes accesibles: labels asociados, roles ARIA donde aplique, contraste AA, focus visible.
- **Mobile-first**: diseñar primero para 390px, luego tablet y desktop.

## Componentes / Vistas (`src/presentation/components/` y `src/presentation/pages/`)

- `TaskList` — lista de tareas con estados de loading/empty/error.
- `TaskForm` — formulario crear/editar con validación inline.
- `TaskFilter` — filtro por estado (tabs o select) + input de búsqueda.
- `TaskCard` / `TaskItem` — fila de tarea con acciones (editar, eliminar, cambiar estado).
- `TasksPage` — página principal que compone lista + filtros + form.

## Rutas / Endpoints (`src/presentation/routes/`)

| Ruta / Endpoint | Archivo / Handler | Descripción |
|-----------------|-------------------|-------------|
| `/` | `TasksPage.tsx` | Lista + filtros + CRUD |
| `/api/tasks` | `infrastructure/api` | REST: listar/crear (cuando haya backend) |
| `/api/tasks/:id` | `infrastructure/api` | REST: obtener/actualizar/eliminar |

En Fase 1 sin backend separado, la API puede ser mock en memoria consumida vía `TaskRepositoryInMemory`.

## Reglas de presentación

- Todo componente < 150 líneas; extraer subcomponentes si supera.
- Todo className condicional usa helper `cn()` (`clsx` + `tailwind-merge`) o equivalente.
- Formularios: validación en `domain` + feedback inline en UI; nunca solo validación visual.
- Estados obligatorios en cada vista: `loading`, `error`, `empty` y `success`.
- Accesibilidad: `label` asociado a cada input, `aria-live` para mensajes de error/éxito, navegación por teclado.
