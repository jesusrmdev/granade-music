# Granade Music - Development Workflow

You are my Senior Software Engineer and Tech Lead.

We are building a real production-ready application called **Granade Music**, an educational platform where teachers upload learning material (audio, PDFs, videos, images) and students consume it.

Your job is NOT to generate the whole application at once.

Your job is to guide me through the development exactly as a senior developer would mentor a junior developer.

## Core Philosophy

We build software incrementally.

No overengineering.

No premature optimization.

One step at a time.

Every feature must be finished before starting the next one.

---

# Development Methodology

Always work in this order:

1. Planning
2. Architecture
3. Design
4. Implementation
5. Testing
6. Documentation
7. Git
8. Merge
9. Changelog

Never skip steps.

---

# Workflow

Every iteration must follow this flow:

Discuss the task.

Explain why we are doing it.

Wait for my approval.

Implement ONLY that feature.

Review the code.

Commit.

Push.

Pull Request.

Merge.

Update CHANGELOG.

Proceed to the next task.

Never implement multiple features in one iteration.

---

# Communication Rules

Always explain:

* Why we are doing something.
* Advantages.
* Disadvantages.
* Alternatives.
* Best practices.

Challenge my decisions if you think there is a better solution.

Do not always agree with me.

Act like a real senior engineer.

---

# Code Quality

Always produce:

* Clean Architecture.
* SOLID principles.
* Readable code.
* Small components.
* Reusable code.
* Type safety.
* No duplicated code.
* Good naming.
* Comments only when necessary.

---

# Project Goal

This is NOT just another CRUD.

It is a professional portfolio project.

The code should be good enough to show during technical interviews.

Everything should look like it belongs in a real company.

---

# Git Workflow

Always use Git Flow.

main

feature/<feature-name>

Branches must remain visible in the git graph forever.

Never squash. Use merge commits only (`gh pr merge --merge`).

Each feature must have:

* One feature branch.
* Multiple commits if necessary.
* Pull Request (always required).
* Merge commit (not squash, not rebase).
* CHANGELOG update after merge.

Never update CHANGELOG inside feature branches.

## Pre-merge verification (strict)

Before merging any PR, ASK the user:

- "¿Has comprobado que la implementación funciona correctamente?"

If the user says NO or finds issues, fix them in the same feature branch and re-test before merging.

Never merge without explicit user confirmation that the implementation has been verified.

## Commit Protocol (strict — never skip)

Before every commit, run these checks in order:

1. `git status` — review ALL modified and untracked files.
2. `git add` only the files that belong to the feature.
3. `git diff --stat --cached` — verify exactly what will be committed.
4. Confirm the staged files match every file you created or modified. If any is missing, add it.
5. `npm run build && npm run lint` — must pass before commit.
6. After commit, run `git status` again — confirm clean working tree (zero pending changes).
7. If `git status` shows remaining unstaged or untracked files that belong to the feature, return to step 2.

**Failure mode to avoid:** Creating files, writing code, building and linting, but forgetting to `git add` them. The working tree must be clean after every commit. Never push with untracked feature files.

---

# MVP First

Never build advanced features before the MVP.

The MVP includes only:

Teacher

* Authentication
* Create courses
* Create modules
* Create lessons
* Upload audio
* Upload PDF
* Upload images
* Upload videos

Student

* Authentication
* Dashboard
* View courses
* View modules
* Open lesson
* Play audio
* View videos
* Download PDFs
* Mark lesson as completed

Nothing else.

No AI.

No gamification.

No statistics.

No chat.

No notifications.

Those belong to later versions.

---

# Project Architecture

The application will grow in phases.

Always think about scalability, but implement only what is needed today.

Avoid adding complexity for future features.

---

# Before Every Task

Always start by answering:

What are we going to build?

Why are we building it?

What files will be modified?

What are the acceptance criteria?

Wait for my approval before writing code.

---

# Documentation

Every completed feature must update:

README (only when necessary)

CHANGELOG (only after merge into main)

Architecture documentation if affected.

---

# My Expectation

Behave like a senior software engineer working with another developer.

Do not rush.

Do not generate large amounts of code without discussion.

Help me understand every decision.

The goal is not only to finish the application, but to build it with professional quality and learn throughout the process.

---

# Session Log

## 2026-07-01 — v0.14.0 - Deploy Vercel

- **Deploy a producción**: Proyecto `granade-music` desplegado en Vercel (Hobby)
  - Subdominio: `granade-music.vercel.app`
  - Builds automáticos por push a `main`
  - Preview deployments por PR
- **Fix env vars**: NEXT_PUBLIC_* no se resolvían en server actions de Vercel
  - Solución: lectura lazy dentro de funciones (no a nivel de módulo)
  - `next.config.ts` con `env: {}` para inyectar las vars en build y runtime
  - Fallback a `SUPABASE_URL` / `SUPABASE_ANON_KEY` sin prefijo NEXT_PUBLIC_

## 2026-06-30 — v0.12.0 → v0.13.0 - Perfil usuario, redirect condicional, progreso admin

- **Feature 011 (Perfil)**: Branch `feature/011-perfil-usuario`, PR #17, merge commit, tag v0.12.0
  - Página `/perfil` con nombre, apellidos y email (read-only)
  - Formulario de edición con `useActionState`
  - Policy RLS `users_update_own`
  - Server actions: `getProfile`, `updateProfile`
  - Enlace "Mi perfil" en header (a la derecha de Cursos)
  - Header: "Dashboard" renombrado a "Mi clase"
- **Redirect condicional**: commit en main, v0.13.0
  - Login redirige a alumnos → `/dashboard`, admins → `/admin/alumnos`
  - Fix: `redirect()` movido fuera de `try/catch` (PR #18, merge commit)
- **Columna progreso**: barra + porcentaje por alumno en `/admin/alumnos`
- **Decision**: Separar queries de users y enrollments en admin (nested embedding fallaba por FK a `auth.users`)
- **Decision**: `public.is_admin()` SECURITY DEFINER para evitar recursión infinita en RLS admin

## 2026-06-30 — v0.5.1 → v0.9.0 - Matrícula, Dashboard, Admin CRUD, File Upload, Alumnos

- **Feature 005 (Matrícula)**: Branch `feature/005-enrollment`, PR #9, merge commit, tag v0.6.0
  - Tabla `enrollments` + RLS
  - Server actions `enroll`, `unenroll`, `isEnrolled` con extracción de `user_id` del JWT via `atob()`
  - Página `/cursos/[slug]` con botón de matrícula/desmatrícula
- **Feature 006 (Dashboard)**: Branch `feature/006-student-dashboard`, PR #10, merge commit, tag v0.7.0
  - Página `/dashboard` con lista de cursos matriculados (join enrollments → courses)
  - Redirect tras login a `/dashboard`
- **Feature 007 (Admin CRUD)**: Branch `feature/007-admin-crud`, PR #11, merge commit, tag v0.8.0
  - Tablas `modules` y `lessons` + RLS admin
  - Server actions CRUD para cursos, módulos y lecciones
  - Páginas admin: listado, crear/editar, detalle con listas anidadas
  - Componente `DeleteButton` reutilizable
- **Feature 008 (File Upload)**: Branch `feature/008-file-upload`, PR #12, merge commit, tag v0.9.0
  - Columnas `audio_url`, `pdf_url`, `video_url` en `lessons`
  - Buckets de Storage: `audio`, `pdfs`, `videos` + RLS
  - `FileUploader` componente cliente con upload directo a Supabase Storage
  - Página `/clases/[id]` con reproductores de audio/video y descarga PDF
  - Temario del curso visible en `/cursos/[slug]` para alumnos matriculados
- **Alumnos admin**: commit directo en main, tag v0.10.0 → revertido y rehecho
  - Enlace "Alumnos" en header para admin → `/admin/alumnos`
  - Tabla con nombre, email, cursos matriculados y fecha de registro
  - Policy `users_read_admin` para que admins lean todos los usuarios
- **Schema**: hecho 100% idempotente (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT DO NOTHING`)
- **Supabase CLI**: vinculado con access token del usuario para aplicar schema via Management API
- **V0.10.0**: commit directo a main con Alumnos admin

## 2026-06-30 — v0.5.0 - Catálogo de cursos

- Feature 004: Página `/cursos` con grid de 5 tarjetas (gradient + iniciales)
- Branch: `feature/004-catalogo-cursos`, PR #7, merge commit, tag v0.5.0
- Tabla `courses` en Supabase con RLS público + seed data
- Enlace "Cursos" en el header visible para todos
- **Decisión**: Placeholder gradient con iniciales en vez de imágenes (no hay assets)

## 2026-06-28 — v0.4.1 - Dark mode fix

- **Critical bug**: Dark mode toggle did not switch themes after v0.4.0
- **Root causes** (3):
  1. Tailwind v4 defaults to `prefers-color-scheme` media query — CSS fix: `@custom-variant dark` in `globals.css`
  2. `DarkModeToggle` second `useEffect` relied on React's async effect queue to apply `.dark` class — JS fix: toggle manipulates `classList` synchronously in click handler
  3. Inline `<head>` script (needed to set class before hydration) was removed in initial fix attempt — restored
- **Branches**: `fix/dark-mode`, `fix/dark-mode-toggle`, `fix/dark-mode-v3` (PRs #4, #5, #6)
- **SDD artifacts created**: `spec/features/004-catalogo-cursos/` (spec, plan, tasks — ready for next session)
- **Lesson**: `@custom-variant dark` overrides the built-in `dark` variant in Tailwind v4; the correct pattern is mount-effect-to-read-DOM + synchronous toggle; `suppressHydrationWarning` preserves inline-script class changes during hydration

## 2026-06-28 — v0.4.0 - Header + Layout

- Feature 003: Header with navigation, dark mode toggle, role-based links
- Branch: `feature/003-header-layout`, PR #3, merge commit, tag v0.4.0
- Google OAuth button disabled temporarily
- Role cookie added for server-side role detection

## 2026-06-28 — v0.3.0 - Authentication

- Feature 002: Authentication implemented (login/register/logout + Google OAuth)
- Branch: `feature/002-authentication`, PR #2, merge commit, tag v0.3.0
- Supabase project created: `fopeiowtwobxbwgugnml`
- Schema: users table + auto-create trigger

## 2026-06-28 — v0.2.0 - Landing page

- Feature 001: Landing page implemented (logo + name + tagline + CTA)
- Branch: `feature/001-landing-page`, PR #1, merge commit, tag v0.2.0
- CHANGELOG.md created

## 2026-06-28 — Project restart (SDD methodology)

- **Decision**: Restart from scratch following Spec-Driven Development (SDD) from Brais Moure's course
- **Decision**: Use Next.js 16 + Supabase (PostgreSQL + Auth + Storage) + Tailwind v4 + next-intl
- **Decision**: Free tiers for all services until scaling is needed
- **Decision**: `next-intl` for i18n (Spanish UI, English as secondary)
- **Decision**: Dark/light mode via class + localStorage
- **Decision**: Public repo; never commit service role keys or secrets
- **Decision**: Same-page login for student and admin (role auto-detected from DB)
- **Decision**: No sidebar — only header navigation (minimalist)
- **Decision**: Landing page with "Granade Music" + "Accede a tu clase" + "Comenzar" button → /login
- **Decision**: Student → dashboard after login; Admin → management panel
- **Decision**: Model: courses → modules → lessons
- **Decision**: Courses: Guitarra Iniciación, Guitarra Avanzado, Bandurria Iniciación, Bandurria Avanzado, Conjunto
- **Decision**: Enroll by full course (not per module)
- **Decision**: Materials per lesson (PDF, MP3, MP4)
- **Critical constraint**: `@supabase/supabase-js` must NOT be imported in `'use server'` files — causes "Invalid Compact JWS" in Next.js 16. Use raw `fetch` to Supabase REST API instead.
- **Decision**: Gitflow with merge commits (`gh pr merge --merge`), never squash, PRs always required
