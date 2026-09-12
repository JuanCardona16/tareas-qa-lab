# Propuesta: tareas-qa-lab Fase 1 — MVP

## Intención

MVP trazable para SUT QA (0% actual, docs/10-status.md). CRUD Task + filtros/búsqueda + API mock habilitan pruebas funcionales/API/a11y sin backend, con Clean Architecture y Strict TDD.

## Requisitos

**RF-01** Crear titulo 1-100 trim obligatorio, descripcion 0-500 opcional, estado pendiente, mensajes es.
**RF-02** Listar `estado`+`q` AND, q case-insensitive titulo/descripcion.
**RF-03** GET id 200|404. **RF-04** PUT con transición estricta `pendiente→en_progreso→completada`, updatedAt. **RF-05** DELETE 204|404 (404 testeable). **RF-06** UI es TaskList/Form/Filter/TasksPage, debounce 300ms.

**RNF-01** `presentation→application→infrastructure→domain`. **RNF-02** Strict TDD RED-GREEN-TRIANGULATE-REFACTOR, `pnpm check/test` OK. **RNF-03** strict:true, sin any, <150l, `cn()`. **RNF-04** WCAG AA+axe. **RNF-05** memoria + `randomUUID`+clock inyectable. **RNF-06** 390/768/1280, async try/catch+loading+error.

## Alcance

**Dentro:** Task+TaskRepository+5 usecases; InMemory+Http+factory; MSW `/api/tasks*` `VITE_API_URL=http://localhost:3000` Postman; stores/hooks; UI; Postman (+Insomnia).
**Fuera:** persistencia real, auth, deploy, planes Fase 2, paginación.

## Capacidades

**Nuevas:** `task-domain`, `task-api-mock` (MSW 200/201/204/400/404/500), `task-application`, `tasks-ui`, `qa-tooling` (axe+Postman).
**Modificadas:** Ninguna.

## Enfoque A

MSW `handlers.ts` intercepta `VITE_API_URL`; Http y Postman mismo contrato. Validadores en `lib/validators.ts`. Clock/id inyectables. Descarta B (Express) por costo.

## Slices 0-7

| # | Entregable |
|---|------------|
| 0 | Bootstrap Vite+React+Vitest+MSW+axe |
| 1 | Dominio Task + validación |
| 2 | TaskRepositoryInMemory |
| 3 | MSW handlers + client + Http + Postman |
| 4 | Factory + stores/hooks |
| 5 | TaskForm/List/Card + TasksPage |
| 6 | Filtros AND + debounce 300ms |
| 7 | axe + Postman/Insomnia + docs |

## Criterios BDD

- **CA-01** titulo "   " → 400 "El título es obligatorio".
- **CA-02** 101c → 400 "máximo 100".
- **CA-03** pendiente→completada → 400 transición inválida.
- **CA-04** q=leche retorna "Comprar leche" y "LECHE" (AND estado).
- **CA-05** DELETE id inexistente →404.
- **CA-06** tecleo → fetch tras 300ms.
- **CA-07** teclado → focus/labels ok, axe 0 críticas.

## Áreas

| Área | Impacto |
|------|---------|
| `src/domain/**` | Nuevo |
| `src/infrastructure/repositories/TaskRepositoryInMemory.ts` | Nuevo |
| `src/infrastructure/api/handlers.ts,client.ts` | Nuevo |
| `src/application/factory.ts,stores/*,hooks/*` | Nuevo |
| `src/presentation/components/*,pages/TasksPage.tsx` | Nuevo |
| `public/postman/collection.json` | Nuevo |

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| MSW jsdom | `msw/node` |
| No determinismo | now/id inyectables |
| Debounce | `useFakeTimers` |
| Validación diverge | fuente dominio |

## Rollback

`git revert` slice; memoria volátil; quitar `setupWorker` desactiva MSW.

## Dependencias

`msw`, `vitest`, `testing-library`, `jsdom`, `axe-core`, `clsx/tailwind-merge`, Node20/pnpm9, `VITE_API_URL`.

## Éxito

- [ ] CRUD+filtros vía UI y Postman (MSW).
- [ ] typecheck/lint/test verde RED→GREEN por slice.
- [ ] 404/400 con mensaje es.
- [ ] debounce+axe+responsive ok.
- [ ] Postman versionada.
