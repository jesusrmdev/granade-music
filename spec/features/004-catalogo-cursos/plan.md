# Plan · 004 · Catálogo de cursos

## Pasos

1. **Base de datos** — Añadir migración `courses` en Supabase SQL editor.
2. **Seed** — Insertar los 5 cursos.
3. **Componente `CourseCard`** — Tarjeta reutilizable que muestra nombre, descripción e imagen.
4. **Página `/cursos`** — Server component que consulta Supabase con raw fetch y renderiza el grid.
5. **Header** — Añadir enlace "Cursos" visible para todos los usuarios.
6. **Verificación** — Build, typecheck, lint.

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `src/app/cursos/page.tsx` | Crear — página de catálogo |
| `src/components/catalog/CourseCard.tsx` | Crear — tarjeta de curso |
| `src/components/layout/Header.tsx` | Modificar — añadir enlace "Cursos" |
| `supabase/schema.sql` | Modificar — añadir tabla courses |

## No se modifica

- Autenticación (no requiere login)
- Layout (ya existe)
- Estilos globales (usamos Tailwind)

## API

Usamos raw fetch a Supabase REST API (mismo patrón que en `action.ts`):

```ts
const url = `${SUPABASE_URL}/rest/v1/courses?select=*&order=created_at.asc`
```
