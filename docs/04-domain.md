# Domain Layer (capa de negocio)

Capa **pura**: sin dependencias externas ni de infraestructura. Solo tipos, contratos y lógica de negocio.

## Entidades (`src/domain/entities/`)

```ts
// Task.ts — entidad central del laboratorio
type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';

interface Task {
  id: string;
  titulo: string;        // requerido, 1-100 chars
  descripcion?: string;  // opcional, max 500 chars
  estado: TaskStatus;    // default: 'pendiente'
  createdAt: Date;
  updatedAt: Date;
}

// Reglas de negocio previstas:
// - titulo no puede ser vacío ni solo espacios
// - transición de estados válida (pendiente → en_progreso → completada)
// - updatedAt se actualiza en cada mutación
```

> Dominio mínimo intencional: Task es la única entidad en Fase 1 para mantener el SUT trazable para el diseño de pruebas.

## Repositorios / Contratos (`src/domain/repositories/` - SOLO interfaces)

```ts
// TaskRepository.ts
interface TaskRepository {
  list(filters?: TaskFilters): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
}

interface TaskFilters {
  estado?: TaskStatus;
  q?: string; // búsqueda por titulo/descripcion
}

type CreateTaskInput = Pick<Task, 'titulo' | 'descripcion' | 'estado'>;
type UpdateTaskInput = Partial<Pick<Task, 'titulo' | 'descripcion' | 'estado'>>;
```

## Casos de Uso / Servicios de negocio (`src/domain/usecases/`)

Cada caso es una función/clase con UNA sola responsabilidad:

- `CreateTask` — valida y crea una tarea
- `UpdateTask` — valida y actualiza una tarea existente
- `DeleteTask` — elimina por id (idempotente)
- `ListTasks` — lista con filtros por estado y búsqueda
- `GetTaskById` — obtiene una tarea por id

Flujo: los casos de uso reciben el `TaskRepository` por inyección y no conocen la infraestructura concreta.

## Validaciones de dominio (para ejercitar pruebas)

- Título requerido, longitud, trim.
- Descripción opcional con límite.
- Estado solo valores del enum.
- IDs inmutables y generados en infraestructura.

Estas reglas son el origen de los casos de prueba funcionales y de API.
