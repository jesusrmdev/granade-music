# Plan · 010 · Progreso de lecciones

## Pasos

1. **Base de datos** — Añadir tabla `lesson_progress` + RLS policies en `supabase/schema.sql`.
2. **Server actions** — Crear `src/lib/progress/actions.ts` con `toggleCompletion` y `getCourseProgress`.
3. **Página de clase** — Modificar `/clases/[id]` para mostrar botón de completar con estado actual.
4. **Temario del curso** — Modificar `/cursos/[slug]` para mostrar checks + progreso.
5. **Dashboard** — Modificar `/dashboard` para mostrar progreso por curso.
6. **Aplicar schema** — Ejecutar en Supabase.
7. **Verificación** — Build + lint.

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `supabase/schema.sql` | Añadir tabla `lesson_progress` + RLS |
| `src/lib/progress/actions.ts` | Crear — server actions |
| `src/app/clases/[id]/page.tsx` | Modificar — añadir botón completar |
| `src/app/cursos/[slug]/page.tsx` | Modificar — mostrar progreso + checks |
| `src/app/dashboard/page.tsx` | Modificar — mostrar progreso por curso |

## No se modifica

- Autenticación
- Header / Layout
- Admin pages

## API

Mismo patrón que `enroll/actions.ts` — raw fetch a Supabase REST API con Bearer token del JWT.
