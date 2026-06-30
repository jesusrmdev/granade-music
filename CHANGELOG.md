# Changelog

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
