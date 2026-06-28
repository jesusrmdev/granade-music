# 001 · Landing Page

**Estado:** <propuesta | en curso | implementado ✅>

## Qué hace

Página principal pública (`/`) que presenta Granade Music como plataforma educativa musical. Muestra el logo, el nombre de la aplicación, un eslogan y un botón de llamada a la acción. No requiere autenticación.

## Por qué

Es la primera impresión del proyecto. Todo visitante llega aquí antes de registrarse o acceder a la plataforma. Define la identidad visual y el tono de la aplicación.

## Criterios de aceptación

- [ ] Muestra el logo de Granade Music
- [ ] Muestra el nombre "Granade Music" como título principal
- [ ] Muestra el eslogan "Accede a tu clase"
- [ ] Muestra un botón "Comenzar" que redirige a `/login`
- [ ] Diseño responsive (funciona en móvil y escritorio)
- [ ] Modo oscuro funcional (hereda la clase `dark` del `<html>`)
- [ ] `npm run build` pasa sin errores

## Fuera de alcance

- Formularios de login o registro (se harán en feature independiente)
- Navegación con header (se añadirá cuando haya más páginas)
- Footer con enlaces (se añadirá en feature de layout)
