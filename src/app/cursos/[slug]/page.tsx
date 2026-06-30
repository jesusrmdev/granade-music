import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import EnrollButton from './EnrollButton'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type Course = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

type Lesson = {
  id: number
  name: string
  sort_order: number
}

type Module = {
  id: number
  name: string
  description: string | null
  sort_order: number
  lessons: Lesson[]
}

const gradients: Record<string, string> = {
  'guitarra-iniciacion': 'from-emerald-500 to-teal-700',
  'guitarra-avanzado': 'from-blue-500 to-indigo-700',
  'bandurria-iniciacion': 'from-violet-500 to-purple-700',
  'bandurria-avanzado': 'from-orange-500 to-red-600',
  'conjunto': 'from-rose-500 to-pink-700',
}

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?slug=eq.${slug}&select=*&limit=1`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0] ?? null
  } catch {
    return null
  }
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.sub ?? null
  } catch {
    return null
  }
}

async function getEnrollmentStatus(courseId: number, accessToken: string): Promise<boolean> {
  const userId = getUserIdFromToken(accessToken)
  if (!userId) return false

  try {
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

async function getModulesWithLessons(courseId: number): Promise<Module[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/modules?course_id=eq.${courseId}&select=*,lessons(*)&order=sort_order.asc`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getCompletedLessonIds(courseId: number, accessToken: string): Promise<number[]> {
  const userId = getUserIdFromToken(accessToken)
  if (!userId) return []

  try {
    const modRes = await fetch(
      `${SUPABASE_URL}/rest/v1/modules?course_id=eq.${courseId}&select=id`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    const modules: { id: number }[] = await modRes.json()
    if (modules.length === 0) return []

    const moduleIds = modules.map(m => m.id).join(',')
    const lessonRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?module_id=in.(${moduleIds})&select=id`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    const lessons: { id: number }[] = await lessonRes.json()
    if (lessons.length === 0) return []

    const lessonIds = lessons.map(l => l.id).join(',')
    const progressRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lesson_progress?user_id=eq.${userId}&lesson_id=in.(${lessonIds})&select=lesson_id`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    const progress: { lesson_id: number }[] = await progressRes.json()
    return progress.map(p => p.lesson_id)
  } catch {
    return []
  }
}

export default async function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const course = await getCourse(slug)
  if (!course) notFound()

  const c = await cookies()
  const sessionCookie = c.get(getAuthCookieName())
  const accessToken: string | null = sessionCookie?.value
    ? (JSON.parse(sessionCookie.value).access_token ?? null)
    : null

  const enrolled = accessToken ? await getEnrollmentStatus(course.id, accessToken) : false
  const gradient = gradients[course.slug] ?? 'from-zinc-500 to-zinc-700'
  const modules = enrolled ? await getModulesWithLessons(course.id) : []
  const completedIds = enrolled && modules.length > 0
    ? await getCompletedLessonIds(course.id, accessToken!)
    : []
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Link
        href="/cursos"
        className="mb-6 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; Volver a cursos
      </Link>

      <div
        className={`flex h-48 items-center justify-center rounded-lg bg-gradient-to-br sm:h-64 ${gradient}`}
      >
        <h1 className="text-5xl font-bold text-white/90">{course.name}</h1>
      </div>

      <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-300">{course.description}</p>

      <div className="mt-8">
        <EnrollButton
          courseId={course.id}
          enrolled={enrolled}
          isLoggedIn={!!accessToken}
        />
      </div>

      {enrolled && modules.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Contenido del curso
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {completedIds.length} de {totalLessons} lecciones completadas
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {modules.map(mod => (
              <div
                key={mod.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {mod.name}
                  </h3>
                  {mod.description && (
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {mod.description}
                    </p>
                  )}
                </div>
                {mod.lessons.length > 0 && (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {mod.lessons
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(lesson => {
                        const isCompleted = completedIds.includes(lesson.id)
                        return (
                          <Link
                            key={lesson.id}
                            href={`/clases/${lesson.id}`}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                          >
                            {isCompleted ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                {lesson.sort_order}
                              </span>
                            )}
                            <span className={isCompleted ? 'text-zinc-400 line-through dark:text-zinc-500' : ''}>
                              {lesson.name}
                            </span>
                          </Link>
                        )
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
