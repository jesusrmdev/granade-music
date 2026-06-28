# Changelog

## [0.4.0] — 2026-06-28

### Fixed

- Dark mode toggle not switching light/dark (Tailwind v4 defaults to media query, not class; inline script was removed; effect never applied class on mount)

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
