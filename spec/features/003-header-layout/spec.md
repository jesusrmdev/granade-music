# 003 · Header + Layout

**Estado:** en curso

## Qué hace

Barra de navegación superior fija (sticky) que aparece en todas las páginas. Muestra el logo, nombre de la app, enlaces de navegación según el rol del usuario, toggle de modo oscuro y botón de cerrar sesión. El modo oscuro persiste en localStorage y evita el flash de tema incorrecto.

## Por qué

Sin un header la navegación entre páginas es incómoda. El modo oscuro es una feature esperada por cualquier usuario.

## Criterios de aceptación

- [ ] Header sticky con logo + nombre "Granade Music"
- [ ] Enlace "Dashboard" o "Admin" visible solo cuando el usuario ha iniciado sesión
- [ ] Toggle de modo oscuro (sol/luna) con persistencia en localStorage
- [ ] Sin flash de tema claro al cargar con modo oscuro (script inline en <head>)
- [ ] Botón "Cerrar sesión" visible solo cuando hay sesión activa
- [ ] Botón Google OAuth desactivado temporalmente (provider no configurado)
- [ ] `npm run build` pasa sin errores

## Fuera de alcance

- Página de dashboard (feature 006)
- Página de admin (feature 007)
- Footer
