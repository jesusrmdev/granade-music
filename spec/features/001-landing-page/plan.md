# 001 · Landing Page — Plan

## Enfoque

Página estática renderizada en servidor (Server Component). Sin interactividad del lado del cliente. La página usa Tailwind para el diseño responsive y el modo oscuro se activa por clase en `<html>`.

## Implementación

1. **`public/logo.png`** — Logo con fondo transparente (ya preparado)
2. **`src/app/page.tsx`** — Reescribir el contenido actual con:
   - Contenedor centrado vertical y horizontalmente (flex, min-h-screen)
   - Logo (Image de Next.js optimizada)
   - Título "Granade Music" con texto grande y semibold
   - Eslogan "Accede a tu clase" en texto secundario
   - Botón "Comenzar" como Link a `/login` con estilo de botón primario
3. **`src/app/globals.css`** — Mantener los estilos base de Tailwind, añadir fondo claro/oscuro para el body

## Decisiones

- **Next.js Image** para el logo — optimización automática de imágenes, lazy loading
- **`<html>` con clase dark** — para modo oscuro, pendiente de añadir el toggle en feature de layout
- **Sin `'use client'`** — la landing es puro HTML estático, no necesita JavaScript

## Riesgos

- **Logo con fondo blanco** — Ya se ha eliminado el fondo (RGBA con transparencia)
- **Modo oscuro no visible** — La clase `dark` debe estar presente en `<html>`; por defecto será light
