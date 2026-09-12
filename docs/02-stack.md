# Stack Tecnológico

| Categoría | Tecnología | Versión/Notas |
|-----------|------------|----------------|
| Lenguaje | **TypeScript** | 5.x, strict mode |
| Framework UI | **React** | 18.x + Vite 5.x |
| Build tool | **Vite** | 5.x |
| Testing | **Vitest** | 4.x + Testing Library + jsdom |
| Estilos | **Tailwind CSS** (previsto) | v3/v4 |
| Linter | **ESLint** (flat config) | 9.x |
| Formatter | **Prettier** | 3.x |
| Type checking | **tsc --noEmit** | vía `pnpm typecheck` |
| Package Manager | **pnpm** | 9.x (no usar npm/yarn) |
| API / Backend | **API REST** (Node.js) | Por definir: Express/Fastify o mock inicial |
| Base de datos | **Por definir** | In-memory para fase inicial; luego SQLite/Supabase si aplica |
| Deploy | **Por definir** | Vercel / Netlify (estático) + API separada si aplica |

## Dependencias instaladas

> Proyecto recién iniciado: aún no hay `package.json` con dependencias instaladas. Al inicializar el proyecto se instalará:

- `react`, `react-dom`, `react-router-dom` (si aplica routing)
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- `typescript`, `vite`, `@vitejs/plugin-react`
- `eslint`, `prettier`, `tailwindcss` (cuando se configure UI)

## Reglas del entorno

- Variables de entorno: usar prefijo `VITE_*` para las que debe ver el cliente (Vite). El resto es server-only. Detalle en `docs/05-infrastructure.md`.
- Nunca cambiar el gestor de paquetes del proyecto (pnpm).
- Strict TDD activo: todo cambio pasa por Vitest con ciclo RED → GREEN → REFACTOR.
- Type-checking estricto habilitado; `tsc --noEmit` debe pasar sin errores antes de cada entrega.
