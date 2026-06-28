# 002 · Authentication

**Estado:** en curso

## Qué hace

Página única en `/login` con dos pestañas: "Iniciar sesión" y "Crear cuenta". El usuario se autentica con email+contraseña o con Google OAuth. El sistema detecta el rol (alumno/admin desde `public.users`) y redirige al destino correspondiente. El logout está disponible desde la landing page mientras no exista header.

## Por qué

Sin autenticación no hay usuarios, matrículas ni progreso. Es la puerta de entrada a toda la plataforma.

## Criterios de aceptación

- [ ] Formulario de "Iniciar sesión" con email + contraseña
- [ ] Formulario de "Crear cuenta" con nombre + apellidos + email + contraseña
- [ ] Botón "Continuar con Google" en ambas pestañas
- [ ] Login exitoso redirige según rol: alumno → `/dashboard`, admin → `/admin`
- [ ] Registro exitoso redirige a `/dashboard` (rol alumno por defecto)
- [ ] Error de credenciales muestra mensaje claro en español
- [ ] Error de email duplicado en registro muestra mensaje claro
- [ ] Logout desde la landing page (enlace/CTA)
- [ ] Sin dependencia de `@supabase/supabase-js` (raw fetch)
- [ ] `npm run build` pasa sin errores

## Fuera de alcance

- Middleware de protección de rutas (se hará en features de dashboard/admin)
- Header con menú de navegación (feature 003)
- Recuperación de contraseña ("olvidé mi contraseña")
- Confirmación de email
- Panel de admin (feature 007)
- Dashboard de alumno (feature 006)
