# Application Layer (orquestación, estado y servicios)

Importa de `domain/` e `infrastructure/`. Es el puente entre la presentación y las implementaciones técnicas.

## Estado global / Stores (`src/application/stores/`)

- `useTaskStore` — store de tareas (lista, filtros, loading, error). Previsto con Zustand o React Context + useReducer.
- Estado derivado: `filteredTasks` según `estado` y `q`.

> El store no contiene lógica de negocio; delega en casos de uso de `domain/usecases/`.

## Composición raíz (`src/application/factory.ts`)

La **única** fábrica de repositorios/servicios. La presentación nunca instancia dependencias técnicas directamente.

```ts
// factory.ts
import { TaskRepositoryInMemory } from '../infrastructure/repositories/TaskRepositoryInMemory';
import { CreateTask } from '../domain/usecases/CreateTask';
// ...

export function createApp() {
  const taskRepository = new TaskRepositoryInMemory();
  return {
    taskRepository,
    createTask: new CreateTask(taskRepository),
    // listTasks, updateTask, deleteTask, ...
  };
}
```

Para tests, la factory permite inyectar un repositorio fake sin tocar la UI.

## Hooks / Servicios de aplicación (`src/application/hooks/`)

| Servicio | Firma | Comportamiento |
|----------|-------|----------------|
| `useTasks` | `() => { tasks, loading, error, refresh }` | Carga lista con filtros, expone refresh |
| `useTaskMutations` | `() => { create, update, remove }` | Mutaciones con try/catch + loading + error visible |
| `useTaskFilters` | `() => { filters, setEstado, setQ }` | Controla estado y búsqueda |

## Reglas de aplicación

- Todo async: try/catch + loading state + error visible al usuario SIEMPRE.
- Las acciones de mutación refrescan los estados derivados para mantener coherencia (ej. crear → recargar lista).
- Los filtros no mutan el dominio; solo afectan la vista en `application`.
- La factory es el único lugar donde se elige `InMemory` vs `Http`.
