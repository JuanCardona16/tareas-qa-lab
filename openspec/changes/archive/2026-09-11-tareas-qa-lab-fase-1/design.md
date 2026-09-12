# Design: tareas-qa-lab Fase 1 — MVP

## Technical Approach

MSW `handlers.ts` fachada sobre `VITE_API_URL`, consumida por `TaskRepositoryHttp` y Postman. Dominio = fuente validación; `lib/validators` reexporta. `createApp()` elige `InMemory` vs `Http`, inyecta `clock`+`id`. Regla `presentation→application→infrastructure→domain`. Slices 0-7, Strict TDD.

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elegida |
|----------|----------|----------|---------|
| ADR-01 MSW fachada | MSW vs Express | Express = puerto/proceso extra | **MSW** `setupWorker`/`setupServer`; un `handlers.ts` para UI y Postman; `msw/node` en jsdom |
| ADR-02 Transición | libre vs `pendiente→en_progreso→completada` | Libre rompe trazabilidad QA | **Estricta en `UpdateTask`**; `"transición inválida"`; `updatedAt` solo si pasa |
| ADR-03 DELETE | 204 siempre vs 204/404 | 204 puro no testeable CA-05 | **204 si existe, 404 `{error,details}` si no**; `DeleteTask` lanza `NOT_FOUND` |
| ADR-04 Debounce | sync vs `useDebouncedValue(300)` | Sync = fetch por tecleo | **`application/hooks/useDebouncedValue.ts`**; `TaskFilter` escribe ya, `useTasks` consume debounced; `useFakeTimers` |
| ADR-05 Factory | directa vs `createApp()` | Directa viola capas | **`application/factory.ts`** única que importa `infrastructure/` |
| ADR-06 Validación | duplicada vs fuente dominio | Duplicada diverge | **Fuente en `domain/validators`**; `lib/validators.ts` reexporta |

## Data Flow

```
Usuario → TasksPage → TaskFilter/TaskForm/TaskList
            └→ useTasks/useTaskMutations/useTaskFilters ─┐
                 try/catch {tasks,loading,error}+refresh()│
                          ↓                               │
                    UseCases ← TaskRepository (interface) │
                          ↓         ▲          ▲          │
                   InMemory   TaskRepositoryHttp (fetch)  │
                          └─ MSW handlers.ts ◄───────────┘
                                 ↕ Postman {{baseUrl}}/api/tasks*
```

Crear: `Form → validators → useTaskMutations.create → CreateTask → repo.create → refresh`.
Filtros: `setQ → debounced 300ms → useTasks → ListTasks → repo.list() AND insensitive`.

## Estructura Carpetas

```
src/domain/entities/Task.ts, domain/repositories/TaskRepository.ts, domain/validators/taskValidators.ts
src/domain/usecases/{Create,Update,Delete,List,Get}Task.ts
src/infrastructure/api/{handlers.ts,client.ts}, infrastructure/repositories/{TaskRepositoryInMemory.ts,TaskRepositoryHttp.ts}
src/application/{factory.ts,hooks/useTasks.ts,hooks/useTaskMutations.ts,hooks/useTaskFilters.ts,hooks/useDebouncedValue.ts}
src/presentation/components/{TaskForm,TaskList,TaskCard,TaskFilter}.tsx, presentation/pages/TasksPage.tsx
src/lib/{validators.ts,cn.ts}, src/mocks/{browser,server}.ts, public/postman/collection.json
```
<150 líneas/archivo: un concepto por archivo; `TaskList` delega en `TaskCard`.

## File Changes

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `domain/entities/Task.ts` | Crear | `Task`+`TaskStatus`+`CreateTaskInput`/`UpdateTaskInput` |
| `domain/repositories/TaskRepository.ts` | Crear | Interface 5 métodos (firma exacta) |
| `domain/validators/taskValidators.ts` | Crear | `validateTitulo/descripcion/transicion` mensajes es |
| `domain/usecases/*.ts` | Crear | 5 usecases puros (repo+clock+id) |
| `infrastructure/api/handlers.ts` | Crear | MSW `${VITE_API_URL}/api/tasks*` 200/201/204/400/404/500 |
| `infrastructure/api/client.ts` | Crear | `fetch` tipado |
| `infrastructure/repositories/TaskRepositoryInMemory.ts` | Crear | Memoria AND insensitive |
| `infrastructure/repositories/TaskRepositoryHttp.ts` | Crear | Via `client.ts` |
| `application/factory.ts` | Crear | `createApp(opts?)` única infra |
| `application/hooks/*` | Crear | `useTasks`, `useTaskMutations`, `useTaskFilters`, `useDebouncedValue` |
| `presentation/components/*` | Crear | `TaskForm/List/Card/Filter` solo `application/` |
| `presentation/pages/TasksPage.tsx` | Crear | Compone lista+filtros+form |
| `src/mocks/*`, `lib/*`, `public/postman/collection.json` | Crear | `setupWorker/Server`, colección 400/404 |

## Interfaces / Contratos

```ts
type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
interface Task { id:string; titulo:string; descripcion?:string; estado:TaskStatus; createdAt:Date; updatedAt:Date; }
type CreateTaskInput = Pick<Task,'titulo'|'descripcion'>;
type UpdateTaskInput = Partial<Pick<Task,'titulo'|'descripcion'|'estado'>>;
interface TaskFilters { estado?: TaskStatus; q?: string; }
interface TaskRepository {
  list(filters?: TaskFilters): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>; // NOT_FOUND si no existe
}
class CreateTask { constructor(repo:TaskRepository, o:{clock:()=>Date;id:()=>string}){} execute(i:CreateTaskInput):Promise<Task> }
class UpdateTask { execute(id:string, i:UpdateTaskInput):Promise<Task> } // valida transición
class DeleteTask { execute(id:string):Promise<void> }
class ListTasks  { execute(f?:TaskFilters):Promise<Task[]> }
class GetTaskById{ execute(id:string):Promise<Task|null> }
type AppDeps={repo?:TaskRepository;clock?:()=>Date;id?:()=>string};
function createApp(d?:AppDeps):{repo:TaskRepository;createTask:CreateTask;updateTask:UpdateTask;deleteTask:DeleteTask;listTasks:ListTasks;getTask:GetTaskById};
 // MSW: GET /api/tasks?estado=&q= →200 | GET /:id →200|404 | POST →201|400 | PUT →200|400|404 | DELETE →204|404
function useTasks(f:TaskFilters):{tasks:Task[];loading:boolean;error:string|null;refresh():Promise<void>}
function useDebouncedValue<T>(v:T,ms:300):T
type ApiErrorBody={error:string;details:Record<string,string>|null};
```
Mensajes es: `"El título es obligatorio"`, `"máximo 100"`, `"máximo 500"`, `"transición inválida"`.

## Testing Strategy

| Capa | Qué | Cómo |
|------|-----|------|
| Domain | validación, transición, clock/id, AND | Vitest, bordes 1/100/101 500/501 |
| Infrastructure | InMemory+Http `msw/node`, 400/404/500 | `setupServer(handlers)` |
| Application | `createApp`, `useTasks` loading/error, debounce 299=0/300=1 | TL + `useFakeTimers` |
| Presentation | `TaskForm` aria-live, 4 estados, sin `infrastructure/`, axe 0 | `axe-core`, lint |
| Postman | CRUD+filtros+400/404 | Newman `{{baseUrl}}` |

## Threat Matrix

N/A — sin shell/subprocess/routing/VCS. MSW intercepta `fetch` en memoria; sin `exec`.

## Migration / Rollout

Sin migración (memoria volátil). Rollout slices 0-7, `git revert`. Quitar `setupWorker` desactiva MSW.

## Plan Slices para sdd-tasks

| Slice | Tareas | Dep |
|-------|--------|-----|
| 0 Bootstrap | Vite+React+TS strict, Vitest+jsdom+TL, MSW browser/server, axe, `cn`, `VITE_API_URL` | — |
| 1 Dominio | `Task`, `taskValidators`, `TaskRepository` interface, 5 usecases clock/id | 0 |
| 2 InMemory | `TaskRepositoryInMemory` AND insensitive | 1 |
| 3 MSW+Http+Postman | `handlers.ts` 5 rutas, `client.ts`, `TaskRepositoryHttp`, `collection.json` 400/404 | 1-2 |
| 4 Factory+Hooks | `factory.ts`, `useTasks/Mutations/Filters/DebouncedValue` | 2-3 |
| 5 UI base | `TaskForm/List/Card/TasksPage` 4 estados, `cn`, `aria-live` | 4 |
| 6 Filtros+Debounce | `TaskFilter` AND + debounce cableado | 5 |
| 7 QA Tooling | axe 0 críticas, docs Postman/Insomnia, `pnpm check/test` verde | 0-6 |

Cada slice: evidencia TDD + `pnpm check` verde.

## Open Questions

- [ ] ¿Incluir export Insomnia además de Postman o solo referencia?
- [ ] ¿Context+useReducer (Fase 1) vs Zustand? Propuesta: Context mínimo, migrar si escala.
