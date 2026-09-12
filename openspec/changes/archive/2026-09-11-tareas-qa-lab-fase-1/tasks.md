# Tasks: tareas-qa-lab Fase 1 — MVP

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1500 (25 archivos + 18 tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | WU1→WU2→WU3→WU4→WU5→WU6 |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | S0 Bootstrap | PR1→`feat/tareas-qa-lab-fase-1` | `pnpm check && pnpm test` | `pnpm dev` | revert `vite.config.ts`, `.env` |
| 2 | S1-2 Dominio | PR2→PR1 | `pnpm test src/domain` | `pnpm test:coverage` | revert `src/domain/**` |
| 3 | S3 MSW+Http | PR3→PR2 | `pnpm test src/infrastructure/api` | Postman `{{baseUrl}}/api/tasks` | revert `src/infrastructure/api/**`, `src/mocks/**` |
| 4 | S4 App | PR4→PR3 | `pnpm test src/application` | `pnpm test` | revert `src/application/**` |
| 5 | S5-6 UI | PR5→PR4 | `pnpm test src/presentation` | `pnpm dev` 390/768/1280 | revert `src/presentation/**` |
| 6 | S7 QA | PR6→PR5 | `pnpm check && pnpm build` | `pnpm build` | revert `public/postman/**` |

## Fase 0: Bootstrap (S0)

- [x] 0.1 Crear `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.env` `VITE_API_URL` — `pnpm check` verde.
- [x] 0.2 Instalar `msw`, `vitest`, `jsdom`, `testing-library`, `axe-core`, `clsx/tailwind-merge` + `vitest.config.ts`, `src/mocks/server.ts`, `src/mocks/browser.ts` — dummy R→G.
- [x] 0.3 Crear `src/lib/cn.ts` + `src/test/setup.ts` — `cn.test.ts` R→G, <150l.

## Fase 1: Dominio (S1) — dep: F0

- [x] 1.1 Crear `src/domain/entities/Task.ts` — R→G, `pnpm typecheck`.
- [x] 1.2 Crear `src/domain/validators/taskValidators.ts` — CA-01/02/03. R `"   "→"El título es obligatorio"`→G.
- [x] 1.3 Crear `src/domain/repositories/TaskRepository.ts` — 5 métodos R→G.
- [x] 1.4 Crear `src/domain/usecases/CreateTask.ts`, `UpdateTask.ts`, `DeleteTask.ts`, `ListTasks.ts`, `GetTaskById.ts` — CA-01/02/03/05. R→G→TRI 1/100/101, 500/501. `pnpm test src/domain`.

## Fase 2: Infra (S2-3) — dep: F1

- [x] 2.1 Crear `src/infrastructure/repositories/TaskRepositoryInMemory.ts` — CA-04 AND. R `list({q:"leche"})`→G.
- [x] 2.2 Crear `src/infrastructure/api/handlers.ts` (MSW `${VITE_API_URL}/api/tasks*` 200/201/204/400/404/500) — `{error,details}` R `404`→G.
- [x] 2.3 Crear `src/infrastructure/api/client.ts` + `src/infrastructure/repositories/TaskRepositoryHttp.ts` — sin `any`. R `msw/node`→G.
- [x] 2.4 Crear `public/postman/collection.json` + `src/mocks/browser.ts`/`server.ts` — CRUD+400/404 `{{baseUrl}}`. `pnpm build`.

## Fase 3: Application (S4) — dep: F2

- [x] 3.1 Crear `src/application/factory.ts` (`createApp()`) — única infra. R `repo falso`→G.
- [x] 3.2 Crear `src/application/hooks/useDebouncedValue.ts`, `useTasks.ts`, `useTaskMutations.ts`, `useTaskFilters.ts` — CA-06. R `299/300`→G, `error es`→G.

## Fase 4: Presentación (S5-6) — dep: F3

- [x] 4.1 Crear `src/presentation/components/TaskCard.tsx` + `TaskList.tsx` — 4 estados <150l `cn()`. R `empty`→G.
- [x] 4.2 Crear `src/presentation/components/TaskForm.tsx` + `src/lib/validators.ts` — 1-100/0-500 `aria-live`. R `"   "`→G.
- [x] 4.3 Crear `src/presentation/components/TaskFilter.tsx` + `src/presentation/pages/TasksPage.tsx` — AND 300, solo `application/`. R fakeTimers→G. `pnpm check`.

## Fase 5: QA (S7) — dep: F0–4

- [x] 5.1 Auditoría `axe-core` `TasksPage` labels/focus — 0 críticas R `axe`→G.
- [x] 5.2 Gate `pnpm check && pnpm test:coverage && pnpm build` — <150l, `msw/node`, clock/id sin flakiness.
