# 011 · Perfil de usuario

## Objetivo

Permitir que los alumnos vean y editen su nombre y apellido desde una página de perfil.

## Requisitos funcionales

- Ruta `/perfil` accesible solo para usuarios autenticados.
- Muestra el nombre, apellido y email actuales.
- Formulario para editar nombre y apellido (el email se muestra solo lectura).
- Los cambios se persisten en `public.users`.

## Criterios de aceptación

- [ ] Navegar a `/perfil` muestra los datos del usuario.
- [ ] El formulario permite editar nombre y apellido.
- [ ] Al guardar, los cambios persisten en la base de datos.
- [ ] Redirige a `/login` si no hay sesión.
- [ ] Enlace "Mi perfil" en el header del alumno.

## Modelo de datos

No se añaden nuevas tablas. Se usa `public.users` existente.
