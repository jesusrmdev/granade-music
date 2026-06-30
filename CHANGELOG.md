# Changelog

## [0.12.0] — 2026-06-30

### Added

- Página `/perfil` con foto inicial, nombre, apellidos y email
- Formulario para editar nombre y apellidos
- Enlace "Mi perfil" en el header del alumno (a la derecha de Cursos)
- Policy RLS `users_update_own` para que alumnos puedan actualizar su perfil
- Server actions: `getProfile`, `updateProfile`

### Fixed

- RLS recursion en policies admin usando `public.is_admin()` SECURITY DEFINER
- Error 23505 (duplicate key) al marcar lección como completada — server action ahora verifica estado en DB
- NaN en porcentaje de progreso — validación `Array.isArray()` en respuestas JSON
- Columnas vacías en admin alumnos — queries separadas para evitar nested embedding de PostgREST
- Progreso no se guardaba en perfil — faltaba policy UPDATE en `public.users`

## [0.11.0] — 2026-06-30

### Added

- Progreso de lecciones: los alumnos pueden marcar/desmarcar lecciones como completadas
- Botón "Marcar como completada" / "Desmarcar" en la página de clase `/clases/[id]`
- Checks verdes en el temario del curso para lecciones completadas
- Contador "X de Y lecciones completadas" en el detalle del curso
- Barra de progreso con porcentaje en cada tarjeta del dashboard
- Tabla `lesson_progress` con RLS (alumno lee/escribe propio, admin lee todo)
- Server actions: `toggleCompletion`, `getLessonProgress`, `getCompletedLessonIds`, `getCourseProgress`

## [0.10.0] — 2026-06-30

### Added

- Sección "Alumnos" en el header para administradores (enlace a `/admin/alumnos`)
- Página `/admin/alumnos` con tabla de estudiantes: nombre, email, cursos matriculados y fecha de registro
- Política RLS `users_read_admin` para que admins puedan leer todos los usuarios

## [0.9.0] — 2026-06-30

### Added

- Subida de archivos a Supabase Storage (audio, PDF, video) desde el panel admin
- `FileUploader` componente cliente con upload directo y preview inline
- Página `/clases/[id]` con reproductor de audio, video y descarga de PDF
- El detalle del curso `/cursos/[slug]` muestra módulos y lecciones para alumnos matriculados
- Columnas `audio_url`, `pdf_url`, `video_url` en tabla `lessons`
- Buckets de Storage: `audio`, `pdfs`, `videos` con RLS
- Server actions: `saveLessonFile`, `deleteLessonFile`, `deleteFromStorage`

### Changed

- Esquema SQL ahora es 100% idempotente (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT DO NOTHING`)

## [0.8.0] — 2026-06-30

### Added

- Panel de administración en `/admin` con CRUD completo de cursos, módulos y lecciones
- Tabla `modules` con RLS (lectura pública, escritura solo admin)
- Tabla `lessons` con RLS (lectura pública, escritura solo admin)
- Políticas admin para INSERT/UPDATE/DELETE en `courses`
- Server actions: `createCourse`, `updateCourse`, `deleteCourse`, `createModule`, `updateModule`, `deleteModule`, `createLesson`, `updateLesson`, `deleteLesson`
- Páginas: lista de cursos, formularios crear/editar, detalle con listas anidadas
- `DeleteButton` componente cliente reutilizable

## [0.7.0] — 2026-06-30

### Added

- Dashboard de estudiante en `/dashboard` con lista de cursos matriculados
- Join de `enrollments` con `courses` para mostrar nombre, slug y descripción
- Estado vacío con enlace a "Ver cursos" si no hay matrículas
- Redirección tras login/signup ahora apunta a `/dashboard`

## [0.6.0] — 2026-06-30

### Added

- Sistema de matrícula: los estudiantes pueden apuntarse y desapuntarse de cursos
- Tabla `enrollments` en Supabase con RLS (lectura/inserción/eliminación solo del propio usuario)
- Server actions: `enroll()`, `unenroll()`, `isEnrolled()` con extracción de `user_id` del JWT
- Página detalle `/cursos/[slug]` con gradient grande, descripción y botón de matrícula
- `CourseCard` ahora es clickeable y navega a `/cursos/[slug]`
- Botón redirige a login si el usuario no está autenticado

## [0.5.1] — 2026-06-30

### Fixed

- Redirección tras login: apuntaba a `/dashboard` y `/admin` (rutas inexistentes), ahora redirige a `/cursos`

## [0.5.0] — 2026-06-30

### Added

- Página pública `/cursos` con grid responsive de tarjetas de curso
- `CourseCard` con placeholder gradient + iniciales, nombre y descripción
- Enlace "Cursos" en el header (visible para todos los usuarios)
- Tabla `courses` en Supabase con RLS público + seed de 5 cursos

## [0.4.0] — 2026-06-28

### Fixed

- Dark mode toggle not switching themes — three root causes:
  - Tailwind v4 defaults to `prefers-color-scheme` media query, not the `.dark` class (CSS fix: `@custom-variant dark`)
  - Second `useEffect` relied on React's async effect queue to apply the `.dark` class, causing first click to go in wrong direction if React state was desynchronized from DOM (JS fix: toggle manipulates `classList` synchronously in click handler)
  - Initial fix accidentally removed inline `<head>` script needed to set class before hydration (restored)

### Added

- Sticky header with logo, navigation, and role-based links
- Dark mode toggle (sol/luna icons) with localStorage persistence
- Script in `<head>` to prevent flash of wrong theme
- Role cookie (`sb-{ref}-auth-token-role`) for server-side role detection
- Logout button in header for authenticated users

### Changed

- Google OAuth button disabled (pending provider configuration)
- Landing page simplified (logout moved to header)

## [0.3.0] — 2026-06-28

### Added

- Login page with email/password form (tab "Iniciar sesión")
- Registration form with name + lastName + email + password (tab "Crear cuenta")
- Google OAuth button with redirect callback flow
- Session cookie management (sb-{ref}-auth-token with chunking)
- Role detection (student/admin) via public.users table
- Logout action from landing page
- `src/lib/supabase/action.ts` — raw fetch helpers (no @supabase/supabase-js)
- `src/lib/auth/actions.ts` — server actions for login/signup/logout
- `supabase/schema.sql` — users table + auto-create trigger from auth.users

## [0.2.0] — 2026-06-28

### Added

- Landing page with Granade Music branding (logo, name, tagline "Accede a tu clase", CTA button)
- Logo with transparent background
- SDD specification artifacts for features
- `spec/constitution/roadmap.md` with feature tracking

### Changed

- Project metadata and layout for Spanish locale
- Simplified globals.css (Tailwind only)

## [0.1.0] — 2026-06-28

### Added

- Next.js 16 scaffold with TypeScript strict + Tailwind v4
- AGENTS.md with full development workflow
- SDD template in `spec/`
- Git workflow: merge commits, PRs required
