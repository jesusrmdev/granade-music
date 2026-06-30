import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type EnrollmentWithCourse = {
  id: number
  course_id: number
  created_at: string
  courses: {
    id: number
    name: string
    slug: string
    description: string | null
  }
}

const gradients = [
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-indigo-700',
  'from-violet-500 to-purple-700',
  'from-orange-500 to-red-600',
  'from-rose-500 to-pink-700',
]

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.sub ?? null
  } catch {
    return null
  }
}

async function getEnrollments(accessToken: string): Promise<EnrollmentWithCourse[]> {
  const userId = getUserIdFromToken(accessToken)
  if (!userId) return []

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/enrollments?user_id=eq.${userId}&select=*,courses(*)&order=created_at.desc`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getCourseProgress(
  courseId: number,
  accessToken: string,
): Promise<{ completed: number; total: number }> {
  const userId = getUserIdFromToken(accessToken)
  if (!userId) return { completed: 0, total: 0 }

  try {
    const modRes = await fetch(
      `${SUPABASE_URL}/rest/v1/modules?course_id=eq.${courseId}&select=id`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    const modules = await modRes.json()
    if (!Array.isArray(modules) || modules.length === 0) return { completed: 0, total: 0 }

    const moduleIds = modules.map((m: { id: number }) => m.id).join(',')
    const lessonRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?module_id=in.(${moduleIds})&select=id`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    const lessons = await lessonRes.json()
    if (!Array.isArray(lessons)) return { completed: 0, total: 0 }
    const total = lessons.length
    if (total === 0) return { completed: 0, total: 0 }

    const lessonIds = lessons.map((l: { id: number }) => l.id).join(',')
    const progressRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lesson_progress?user_id=eq.${userId}&lesson_id=in.(${lessonIds})&select=id`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    const progress = await progressRes.json()
    const completed = Array.isArray(progress) ? progress.length : 0
    return { completed, total }
  } catch {
    return { completed: 0, total: 0 }
  }
}

export default async function DashboardPage() {
  const c = await cookies()
  const name = getAuthCookieName()
  const sessionCookie = c.get(name)
  const roleCookie = c.get(`${name}-role`)

  if (!sessionCookie?.value) redirect('/login')

  const role = roleCookie?.value
  if (role === 'admin') redirect('/admin')

  const accessToken = JSON.parse(sessionCookie.value).access_token as string
  const enrollments = await getEnrollments(accessToken)

  const progressMap: Record<number, { completed: number; total: number }> = {}
  for (const enr of enrollments) {
    progressMap[enr.course_id] = await getCourseProgress(enr.course_id, accessToken)
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Mis cursos
      </h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">
        {enrollments.length > 0
          ? `Tienes ${enrollments.length} curso${enrollments.length !== 1 ? 's' : ''} en activo`
          : 'Aún no estás matriculado en ningún curso.'}
      </p>

      {enrollments.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <p className="text-zinc-500 dark:text-zinc-400">
            Explora nuestra oferta formativa y matricúlate.
          </p>
          <Link
            href="/cursos"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Ver cursos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enr, i) => {
            const course = enr.courses
            const initials = course.name
              .split(' ')
              .map(w => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
            const progress = progressMap[enr.course_id] ?? { completed: 0, total: 0 }
            const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0

            return (
              <Link
                key={enr.id}
                href={`/cursos/${course.slug}`}
                className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 transition hover:shadow-lg dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                <div
                  className={`flex h-32 items-center justify-center bg-gradient-to-br sm:h-40 ${gradients[i % gradients.length]}`}
                >
                  <span className="text-4xl font-bold text-white/90">{initials}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {course.name}
                  </h3>
                  {progress.total > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{progress.completed} de {progress.total} lecciones</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {course.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
