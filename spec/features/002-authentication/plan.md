# 002 · Authentication — Plan

## Enfoque

Auth con Supabase usando raw fetch (sin el SDK `@supabase/supabase-js` para evitar "Invalid Compact JWS" en server actions). Las server actions gestionan login/signup/logout. La cookie de sesión se almacena en `sb-{ref}-auth-token` (mismo formato que Supabase SSR). Google OAuth usa flujo de redirect con callback.

## Implementación

1. **`src/lib/supabase/action.ts`** — Helpers sin SDK:
   - `signInWithPassword(email, password)` → POST `/auth/v1/token?grant_type=password`
   - `signUp(email, password, options)` → POST `/auth/v1/signup`
   - `getUser(accessToken)` → GET `/auth/v1/user`
   - `getUserIdFromCookie()` → leer sesión desde cookie y extraer `user.id`
   - `getRole(accessToken)` → GET `/rest/v1/users?id=eq.{userId}&select=role`
   - `getGoogleOAuthUrl(origin)` → construir URL de authorize con provider=google
   - Constantes: `SUPABASE_URL`, `ANON_KEY` de `process.env`

2. **`src/lib/auth/actions.ts`** — Server actions:
   - `login(prevState, formData)` → signIn, set cookie, redirect según rol
   - `signup(prevState, formData)` → signUp, set cookie si hay sesión, redirect `/dashboard`
   - `logout()` → clear cookie, redirect `/`
   - Helper `setSessionCookie(session)` → chunkear y guardar en cookie
   - Helper `clearSessionCookie()` → eliminar cookie + chunks

3. **`src/app/login/page.tsx`** — Página con pestañas (Client Component):
   - Tab "Iniciar sesión": form con email + password + useActionState(login)
   - Tab "Crear cuenta": form con nombre + apellidos + email + password + useActionState(signup)
   - Botón "Continuar con Google": link a la URL de OAuth
   - Diseño minimalista, responsive, modo oscuro

4. **`src/app/auth/callback/page.tsx`** — Callback OAuth (Client Component):
   - Leer `window.location.hash` al montar
   - Parsear `access_token`, `refresh_token`
   - Llamar a server action que setea la cookie
   - Redirigir según rol

5. **No se necesita middleware** aún — el login es público; dashboard y admin se protegerán en sus features.

## Decisiones

- **Raw fetch vs SDK**: SDK causa "Invalid Compact JWS" en Next.js 16 server actions. Raw fetch evita el problema por completo.
- **Cookie en lugar de localStorage**: Para que el servidor (server components, middleware) pueda leer la sesión sin necesidad de pasarla desde el cliente.
- **Google OAuth con redirect, no popup**: Funciona en móvil, no requiere manejo de ventanas emergentes.
- **Sin confirmación de email**: Para testing. Se configura en Supabase dashboard (Settings → Auth → Disable email confirmation).
- **Rol por defecto 'student'** en registro. El admin se asigna manualmente desde Supabase dashboard.

## Riesgos

- **Google OAuth necesita configuración**: Requiere Client ID + Secret de Google Cloud Console. Necesito que el usuario los configure en Supabase dashboard.
- **Sin Supabase project activo**: Necesitamos crear el proyecto y las tablas antes de que funcione. Podemos crear el proyecto ahora o cuando toque probar.
- **Rol via REST requiere RLS**: La tabla `public.users` debe tener una política que permita leer el rol con el access_token del usuario.
