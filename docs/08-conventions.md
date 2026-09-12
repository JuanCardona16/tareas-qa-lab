# Convenciones de Código

## Nomenclatura

- Componentes/Vistas: `PascalCase` (`TaskList`, `TaskForm`)
- Hooks/Servicios: `useCamelCase` / `camelCase` (`useTasks`, `createTask`)
- Funciones/variables: `camelCase`
- Env vars cliente: prefijo `VITE_*` (`VITE_API_URL`)

## Tipado estricto

- Type-checking estricto habilitado (`strict: true` en tsconfig).
- CERO `any`, CERO `@ts-ignore` / `@ts-expect-error`.
- Todo nuevo código debe pasar `pnpm typecheck` sin errores.

## Clases condicionales

Usar helper `cn()` (`clsx` + `tailwind-merge`) para className condicional. Nada de ternarios concatenados manuales.

## Responsive / UX

- Mobile-first: verificar en 390px, tablet (768px) y desktop (1280px).
- Verificar a11y básico: labels, focus, contraste, aria-live.

## Async y errores

- Toda llamada async: try/catch + loading state + error visible al usuario SIEMPRE.

## Formato

- Prettier como formatter, ESLint flat config como linter.
- Prettier y ESLint como herramientas del proyecto.

## Comandos

| Comando | Acción |
|---------|--------|
| `pnpm install` | Instalar dependencias |
| `pnpm dev` | Dev server (Vite) |
| `pnpm build` | Build producción |
| `pnpm preview` | Previsualizar build |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm lint` | ESLint |
| `pnpm check` | typecheck + lint |
| `pnpm test` | Tests (Vitest) |
| `pnpm test:coverage` | Tests con cobertura |

## Testing — Strict TDD

- **Runner**: Vitest + Testing Library + jsdom.
- **Ciclo obligatorio**: RED → GREEN → REFACTOR por cada tarea. `sdd-apply` exige evidencia TDD; `sdd-verify` rechaza si falta.
- **Cobertura**: `pnpm test:coverage` debe ejecutarse antes de cerrar cada tarea.

## Tamaño de archivos

- Cada archivo < 150 líneas. Divide si supera.
- Un concepto por archivo (un componente, un hook, un usecase).
