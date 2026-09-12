# Estado del Proyecto

> Actualizado al cerrar cada módulo/mejora. Ver historial completo en `docs/11-changelog.md`.

## Estado actual — SUT 100% listo para laboratorio

**Fase 1 MVP completa (S0–S7) — verificado 2026-09-11**

- **Tests**: 139 verdes (25 suites) — Vitest + Testing Library + jsdom + MSW.
- **Cobertura**: 92.27% statements / 93.61% líneas / 82.78% branches — supera gate 80%.
- **Gate**: `pnpm check && pnpm test:coverage && pnpm build` verde con thresholds en `vitest.config.ts`.
- **Postman**: `public/postman/collection.json` v2.1 validada por test (CRUD + filtros + 400/404 + transición).
- **Build**: `tsc --noEmit && vite build` sin errores.

### Progreso

```
S0 Bootstrap ✅ — S1 Dominio ✅ — S2-3 Infra MSW/Http ✅ — S4 Application ✅ — S5-6 UI + a11y ✅ — S7 QA Gate ✅
SUT 100% — listo para diseño de pruebas (Fase 2 del laboratorio)
```

## Roadmap

### Fase 1 (MVP laboratorio) — Completada ✅
- [x] Estructura base + dominio Task (entidad, contratos, 5 casos de uso, validadores)
- [x] Repositorio InMemory + Http + MSW handlers (200/201/204/400/404/500)
- [x] Factory `createApp()` + hooks (`useTasks`, `useTaskMutations`, `useTaskFilters`, `useDebouncedValue` 300ms)
- [x] UI: TaskList/Card/Form/Filter + TasksPage (4 estados, aria-live, cn, <150 líneas)
- [x] API REST mock con Postman collection `{{baseUrl}}` + filtros AND case-insensitive
- [x] Tests Strict TDD (131 → 139) + axe 0 críticas + cobertura + build

### Fase 2 (Laboratorio QA — diseño de pruebas) — Siguiente
- [ ] Plan funcional (casos, bordes 1/100/101 y 0/500/501, particiones, estados)
- [ ] Plan API (contratos, validaciones, 400/404, idempotencia)
- [ ] Plan accesibilidad (axe, labels/focus, 390/768/1280)
- [ ] Plan seguridad (validación, inyección, transición estricta)
- [ ] Plan rendimiento (listas grandes, debounce, filtros)

### Fase 3 (Futuro) — Pendiente
- [ ] Persistencia real (SQLite/Supabase) si aplica
- [ ] Pipeline CI con `pnpm check` + `pnpm test:coverage` (thresholds 80%)
- [ ] Reportes HTML/LCOV publicados

## Cómo correr el SUT (MSW)

```sh
pnpm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
pnpm dev               # http://localhost:5173 — MSW intercepta /api/tasks
pnpm test              # 139 tests
pnpm test:coverage     # gate 80% líneas (actual 93.61%)
pnpm check && pnpm build
```

MSW: `src/mocks/browser.ts` (setupWorker) en dev, `src/mocks/server.ts` (setupServer) en tests. Sin backend externo. Desactivar quitando `setupWorker` en `src/main.tsx`.

## Postman / Insomnia

- Colección: `public/postman/collection.json` (Postman v2.1).
- Variable: `{{baseUrl}}` = `http://localhost:3000` (coincide con `VITE_API_URL`).
- Incluye: Health, List (filtros estado+q AND), Get 200/404, POST 201 + 3×400, PUT 200/400/404 + transición inválida, DELETE 204/404.
- Uso Postman: Importar colección → `Send` con `pnpm dev` corriendo.
- Uso Insomnia: Importar como Postman v2.1 → misma variable `baseUrl`.
- Validación automática: `pnpm test src/infrastructure/api/postmanCollection.test.ts` (8 casos) + `handlers.test.ts`.
- Newman (opcional): `npx newman run public/postman/collection.json --env-var baseUrl=http://localhost:3000` — no requerido para gate.

## Checklist SUT para laboratorio

| Dimensión | Qué ejercitar | Dónde en el SUT |
|-----------|---------------|-----------------|
| Funcionalidad | CRUD, validación 1-100/0-500, transición `pendiente→en_progreso→completada`, filtros AND | `taskValidators`, `UpdateTask`, `TaskRepositoryInMemory`, `TasksPage` |
| API | 200/201/204/400/404/500, `{error,details}`, filtros `estado`+`q` case-insensitive | `handlers.ts`, `client.ts`, `collection.json` |
| Rendimiento | Debounce 300ms (299=0, 300=1), listas grandes, re-render | `useDebouncedValue`, `TaskList` |
| Seguridad | Validación en dominio (no solo UI), transición estricta, id/clock inyectados | `domain/validators`, `factory.ts` |
| Compatibilidad | 390/768/1280, jsdom + fetch, MSW browser/server | `vite.config.ts`, `vitest.config.ts`, `TaskFilter` |
| Accesibilidad | labels/focus, aria-live, contraste, axe 0 críticas | `TaskForm`, `TasksPage.test.tsx` (jest-axe) |

## Riesgos y deuda técnica

- `TasksPage` 50% líneas (presentación orquestadora) — aceptable; lógica en hooks.
- `TaskFilter` 80% líneas (estado local) — cubierto por debounce tests.
- Sin persistencia real — intencional para laboratorio (reset en reload).
