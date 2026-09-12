# tareas-qa-lab - Punto de Entrada para Agentes IA

> Laboratorio QA — mini gestión de tareas para diseño de pruebas

## Antes de empezar a trabajar (LEER EN ESTE ORDEN)

1. `docs/01-overview.md` — Qué es tareas-qa-lab y sus funcionalidades
2. `docs/10-status.md` — Estado actual del proyecto y roadmap
3. `docs/11-changelog.md` — Historial de cambios
4. `docs/02-stack.md` — Stack tecnológico
5. `docs/03-architecture.md` — Arquitectura y límites de capas
6. `docs/08-conventions.md` — Convenciones de código
7. `docs/09-git-deploy.md` — Flujo git y deploy
8. `docs/12-agent-workflow.md` — Metodología de trabajo OBLIGATORIA

## Principios no negociables

- **Arquitectura en capas**: Clean Architecture — Domain → Infrastructure → Application → Presentation. NUNCA cruces límites.
- **Lenguaje tipado estricto**: CERO `any`, CERO `@ts-ignore`.
- **Mobile-first y accesible**: todo UI debe ser usable en 390px y pasar criterios básicos de a11y.
- Todo async: try/catch + loading state + error visible al usuario.
- **NINGÚN cambio de código sin plan aprobado** (ver `docs/12-agent-workflow.md`).
- Commits convencionales (`feat:`, `fix:`, `refactor:`, `docs:`) y solo con aprobación explícita del usuario.
- Env vars secretas nunca se suben a git; las de cliente usan prefijo `VITE_*` (detalle en `docs/05-infrastructure.md`).
- **Strict TDD activo**: todo cambio pasa por ciclo RED → GREEN → REFACTOR con Vitest. Ver `docs/08-conventions.md` y `docs/12-agent-workflow.md`.

## Índice de documentación

| Doc | Contenido |
|-----|-----------|
| `docs/01-overview.md` | Visión, funcionalidades actuales |
| `docs/02-stack.md` | Stack y dependencias |
| `docs/03-architecture.md` | Arquitectura y límites |
| `docs/04-domain.md` | Entidades, repositorios, casos de uso |
| `docs/05-infrastructure.md` | Infraestructura, servicios externos, env vars |
| `docs/06-application.md` | Estado, hooks, servicios |
| `docs/07-presentation.md` | UI / transporte, rutas |
| `docs/08-conventions.md` | Convenciones y comandos |
| `docs/09-git-deploy.md` | Git y deploy |
| `docs/10-status.md` | Estado actual y roadmap |
| `docs/11-changelog.md` | Historial de cambios |
| `docs/12-agent-workflow.md` | Metodología de trabajo |

## Comandos rápidos

| Comando | Acción |
|---------|--------|
| `pnpm install` | Instalar dependencias |
| `pnpm dev` | Dev server (Vite) |
| `pnpm build` | Build producción |
| `pnpm test` | Tests con Vitest |
| `pnpm test:coverage` | Tests con cobertura |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm check` | typecheck + lint |

## Estructura de capas

```
src/
├── domain/           # Entidades puras, contratos de repositorio, casos de uso
├── infrastructure/   # Implementaciones técnicas (API, storage, repositorios concretos)
├── application/      # Stores, hooks, composición raíz (fábrica de dependencias)
├── presentation/     # Componentes React, páginas, rutas
└── lib/              # Utilidades compartidas (helpers, constants, cn)
docs/                 # Documentación del proyecto
```
