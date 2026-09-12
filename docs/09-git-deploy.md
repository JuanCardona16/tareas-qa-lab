# Git & Deploy

## Git

- Branch principal: `main`
- Feature branches: `feature/nombre` o `fix/nombre`
- Commits convencionales: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Nunca commitear sin aprobación explícita del usuario.
- Antes de commitear: revisar `git status`, `git diff` y `git log --oneline -10`; stagear solo lo intencional; nunca subir secretos (`.env`/`.env.local` en `.gitignore`).

## Deploy

- **Plataforma por definir**: Vercel o Netlify para el frontend estático; si la API REST se separa, deploy independiente (Railway/Fly/Render o Vercel Functions).
- Variables de entorno en la plataforma con los mismos nombres que en local (`VITE_API_URL`, etc.).
- Build de producción: `pnpm build` (Vite) y `pnpm preview` para verificación local.

## .gitignore mínimo

```
node_modules/
dist/
.env
.env.local
coverage/
```

> Fase 1 es laboratorio local; el deploy se define en Fase 2 cuando se elija plataforma.
