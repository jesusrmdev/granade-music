import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type Lesson = {
  id: number
  module_id: number
  name: string
  description: string | null
  sort_order: number
  audio_url: string | null
  pdf_url: string | null
  video_url: string | null
  modules: {
    id: number
    name: string
    course_id: number
    courses: {
      id: number
      name: string
      slug: string
    }
  }
}

async function getLesson(id: string): Promise<Lesson | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?select=*,modules:module_id(id,name,course_id,courses:course_id(id,name,slug))&id=eq.${id}&limit=1`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0] ?? null
  } catch {
    return null
  }
}

async function getEnrollmentStatus(
  courseId: number,
  accessToken: string,
): Promise<boolean> {
  try {
    const userId = JSON.parse(atob(accessToken.split('.')[1])).sub
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/enrollments?course_id=eq.${courseId}&user_id=eq.${userId}&select=id&limit=1`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) return false
    const rows = await res.json()
    return rows.length > 0
  } catch {
    return false
  }
}

export default async function LessonPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const lesson = await getLesson(id)
  if (!lesson) notFound()

  const c = await cookies()
  const sessionCookie = c.get(getAuthCookieName())
  const accessToken: string | null = sessionCookie?.value
    ? (JSON.parse(sessionCookie.value).access_token ?? null)
    : null

  const enrolled = accessToken
    ? await getEnrollmentStatus(lesson.modules.course_id, accessToken)
    : false

  if (!enrolled) {
    redirect(`/cursos/${lesson.modules.courses.slug}`)
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Link
        href={`/cursos/${lesson.modules.courses.slug}`}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; {lesson.modules.courses.name}
      </Link>

      <span className="mb-1 text-sm text-zinc-400 dark:text-zinc-500">
        {lesson.modules.name}
      </span>
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {lesson.name}
      </h1>
      {lesson.description && (
        <p className="mb-8 text-zinc-600 dark:text-zinc-300">{lesson.description}</p>
      )}

      <div className="flex flex-col gap-6">
        {lesson.audio_url && (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Audio</h2>
            <audio controls className="w-full">
              <source src={lesson.audio_url} />
            </audio>
          </div>
        )}

        {lesson.video_url && (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Video</h2>
            <video controls className="w-full rounded">
              <source src={lesson.video_url} />
            </video>
          </div>
        )}

        {lesson.pdf_url && (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Material complementario
            </h2>
            <div className="flex gap-3">
              <a
                href={lesson.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Abrir PDF
              </a>
              <a
                href={lesson.pdf_url}
                download
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Descargar
              </a>
            </div>
          </div>
        )}

        {!lesson.audio_url && !lesson.video_url && !lesson.pdf_url && (
          <p className="text-zinc-500 dark:text-zinc-400">
            Esta lección no tiene contenido multimedia disponible.
          </p>
        )}
      </div>
    </section>
  )
}
