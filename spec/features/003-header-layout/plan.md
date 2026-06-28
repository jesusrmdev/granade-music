# 003 · Header + Layout — Plan

## Enfoque

Header como Server Component que lee las cookies de sesión y rol para decidir qué mostrar. DarkModeToggle como Client Component mínimo. Script inline en <head> para evitar flash de tema.

## Implementación

1. **`src/components/layout/Header.tsx`** — Server Component:
   - Lee `sb-{ref}-auth-token` y `sb-{ref}-auth-token-role` cookies
   - Renderiza logo, nombre, enlaces condicionales, toggle, logout
2. **`src/components/layout/DarkModeToggle.tsx`** — Client Component:
   - Sincroniza clase `dark` en `<html>` con localStorage
   - Lee estado inicial desde el DOM (no desde cookie)
3. **`src/app/layout.tsx`** — Root layout:
   - Añade Header antes de `<main>`
   - Añade script inline en `<head>` que lee localStorage y aplica clase `dark`
   - `suppressHydrationWarning` en `<html>` para evitar warnings de hidratación
4. **`src/app/login/page.tsx`** — Desactivar botón Google OAuth
5. **`src/lib/auth/actions.ts`** — Añadir cookie de rol (`sb-{ref}-auth-token-role`)
6. **`src/app/auth/callback/api/route.ts`** — Añadir cookie de rol en callback OAuth

## Decisiones

- **Server Component para Header**: evita estado compartido entre cliente y servidor, funciona sin JS
- **Script inline para modo oscuro**: se ejecuta antes de la primera renderización, elimina el flash
- **Cookie de rol separada**: no modifica la sesión de Supabase, evita llamadas REST en cada render del header

## Riesgos

- **ESLint `set-state-in-effect`**: el toggle necesita leer el DOM en useEffect. Se desactiva la regla localmente con comentario.
