# Historial de Cambios (Changelog)

> Formato: **últimos cambios arriba**. Se agrega una entrada al cerrar cada módulo, fix o mejora aprobada.
> Formato de entrada: `YYYY-MM-DD — [tipo]: resumen`.

---

## 2026-09-11 — `fix(qa)`: service worker MSW ausente rompía `pnpm dev` + `docs`: informe de pruebas

**Fix**: `pnpm dev` renderizaba la página vacía porque faltaba `public/mockServiceWorker.js` (solo `msw init` lo genera). La suite Vitest no lo detectaba porque los tests usan `msw/node` (server), no el worker de browser.

- **Archivos**: `public/mockServiceWorker.js` (generado con `pnpm exec msw init public/`), `package.json` (`msw.workerDirectory`).
- **Verificación**: smoke manual en navegador — CRUD completo operable (crear tarea con aria-live "Tarea creada", card con estados/filtros).

**Informe académico**: se agregó `docs/informe-pruebas.md` con el diseño de 12 pruebas (6 tipos × 2) según el formato requerido por la actividad (objetivo, escenario, datos de entrada, resultados esperados, métricas), incluyendo pruebas de API REST con Postman/Insomnia, conclusiones y preguntas para retroalimentación en clase.

---

## 2026-09-11 — `docs`: inicialización del proyecto tareas-qa-lab

**Alcance**: proyecto iniciado. Documentación y estructura base generadas con la skill `new-project-scaffold`.

- **Archivos**: `docs/01..12`, `AGENTS.md`, `README.md`
- **Stack**: TypeScript + React + Vite + Vitest (Strict TDD activo)
- **Arquitectura**: Clean Architecture (domain / infrastructure / application / presentation / lib)
- **App**: mini gestión de tareas (CRUD + filtros por estado + API REST) como SUT para diseño de pruebas QA
- **Estructura carpetas**: `src/domain`, `src/infrastructure`, `src/application`, `src/presentation`, `src/lib`

---

## 2026-09-11 — `feat(qa)`: Fase 5 — QA tooling gate (S7) — SUT 100% listo

**Gate aplicado**: `pnpm check && pnpm test:coverage && pnpm build` verde.

- **Cobertura**: `vitest.config.ts` thresholds `statements 80 / branches 70 / functions 80 / lines 80`. Resultado: 92.27% stmts / 82.78% branches / 93.61% líneas (382/414 stmts, 337/360 líneas) — supera gate.
- **Postman**: `public/postman/collection.json` v2.1 validada por `src/infrastructure/api/postmanCollection.test.ts` (8 tests): schema, `{{baseUrl}}`, CRUD, 400×3/404×3, filtros AND case-insensitive, transición inválida, health, ≥14 requests. Correlación con `handlers.ts`.
- **Docs**: `docs/10-status.md` actualizado a SUT 100% (S0–S7 completas, checklist 6 dimensiones, instrucciones MSW/Postman/Insomnia). Este changelog.
- **Tests**: 131 → 139 (+8 Postman), 25 → 26 suites. `pnpm test:coverage` sin errores de threshold.
- **Archivos**: `vitest.config.ts` (thresholds), `src/infrastructure/api/postmanCollection.test.ts` (<150 líneas), `docs/10-status.md`, `docs/11-changelog.md`.

**Cómo verificar**: `pnpm test:coverage` (gate), `pnpm test src/infrastructure/api/postmanCollection.test.ts`, `pnpm check`, `pnpm build`. Postman: importar `public/postman/collection.json` con `pnpm dev` en `http://localhost:3000`.

---

## Pendiente: primera feature

> Agregar entradas aquí al cerrar cada módulo.
