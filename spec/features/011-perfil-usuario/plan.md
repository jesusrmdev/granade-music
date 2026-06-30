# Plan · 011 · Perfil de usuario

## Pasos

1. **Server actions** — Crear `src/lib/profile/actions.ts` con `getProfile` y `updateProfile`.
2. **Página de perfil** — Crear `src/app/perfil/page.tsx` con datos y formulario.
3. **Header** — Añadir enlace "Mi perfil" para alumnos autenticados.
4. **Verificación** — Build + lint.

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `src/lib/profile/actions.ts` | Crear — server actions |
| `src/app/perfil/page.tsx` | Crear — página de perfil |
| `src/components/layout/Header.tsx` | Modificar — añadir enlace "Mi perfil" |

## No se modifica

- Base de datos (usa `public.users` existente)
- Autenticación
- Rutas admin

## API

Mismo patrón que `enroll/actions.ts` — raw fetch a Supabase REST API con Bearer token del JWT.
