import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type Alumno = {
  id: string
  email: string
  name: string
  last_name: string
  created_at: string
  progress: number
  enrollments: { id: number; course_name: string }[]
}

async function supabaseGet(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

async function getAlumnos(token: string): Promise<Alumno[]> {
  try {
    const users: { id: string; email: string; name: string; last_name: string; created_at: string }[] | null =
      await supabaseGet('/rest/v1/users?role=eq.student&select=id,email,name,last_name,created_at&order=created_at.desc', token)
    if (!users || users.length === 0) return []

    const userIds = users.map(u => u.id).join(',')

    const enrollments: { id: number; user_id: string; course_id: number; courses: { name: string } }[] | null =
      await supabaseGet(`/rest/v1/enrollments?user_id=in.(${userIds})&select=id,user_id,course_id,courses(name)`, token)

    const enrollmentsByUser: Record<string, { id: number; course_name: string }[]> = {}
    const courseIds = new Set<number>()
    if (enrollments) {
      for (const e of enrollments) {
        if (!enrollmentsByUser[e.user_id]) enrollmentsByUser[e.user_id] = []
        enrollmentsByUser[e.user_id].push({ id: e.id, course_name: e.courses.name })
        courseIds.add(e.course_id)
      }
    }

    // Get total lessons per course
    const lessonsPerCourse: Record<number, number> = {}
    if (courseIds.size > 0) {
      const modules: { id: number; course_id: number }[] | null =
        await supabaseGet(`/rest/v1/modules?course_id=in.(${[...courseIds].join(',')})&select=id,course_id`, token)
      if (modules && modules.length > 0) {
        const moduleIds = modules.map(m => m.id).join(',')
        const lessons: { id: number; module_id: number }[] | null =
          await supabaseGet(`/rest/v1/lessons?module_id=in.(${moduleIds})&select=id,module_id`, token)
        if (lessons) {
          const moduleToCourse = Object.fromEntries(modules.map(m => [m.id, m.course_id]))
          for (const l of lessons) {
            const cId = moduleToCourse[l.module_id]
            if (cId) lessonsPerCourse[cId] = (lessonsPerCourse[cId] ?? 0) + 1
          }
        }
      }
    }

    // Get all lesson progress for these students
    const progressByUser: Record<string, number> = {}
    if (enrollments && courseIds.size > 0) {
      const progressRows: { user_id: string; lesson_id: number }[] | null =
        await supabaseGet(`/rest/v1/lesson_progress?user_id=in.(${userIds})&select=user_id,lesson_id`, token)
      if (progressRows) {
        const completedByUser: Record<string, Set<number>> = {}
        for (const p of progressRows) {
          if (!completedByUser[p.user_id]) completedByUser[p.user_id] = new Set()
          completedByUser[p.user_id].add(p.lesson_id)
        }

        for (const user of users) {
          const userEnrollments = enrollments.filter(e => e.user_id === user.id)
          if (userEnrollments.length > 0) {
            const userCourseIds = userEnrollments.map(e => e.course_id)
            const userTotalLessons = userCourseIds.reduce((sum, cId) => sum + (lessonsPerCourse[cId] ?? 0), 0)
            const userCompleted = completedByUser[user.id]?.size ?? 0
            progressByUser[user.id] = userTotalLessons > 0
              ? Math.round((Math.min(userCompleted, userTotalLessons) / userTotalLessons) * 100)
              : 0
          } else {
            progressByUser[user.id] = 0
          }
        }
      }
    }

    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      last_name: u.last_name,
      created_at: u.created_at,
      progress: progressByUser[u.id] ?? 0,
      enrollments: enrollmentsByUser[u.id] ?? [],
    }))
  } catch {
    return []
  }
}

export default async function AlumnosPage() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')

  const sessionCookie = c.get(getAuthCookieName())
  const token = JSON.parse(sessionCookie?.value ?? '{}').access_token as string
  const alumnos = await getAlumnos(token)

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Alumnos
      </h1>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Nombre</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Email</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Matriculado en</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Progreso</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {alumnos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No hay alumnos registrados.
                </td>
              </tr>
            ) : (
              alumnos.map(a => (
                <tr key={a.id} className="bg-white dark:bg-black">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                    {a.name} {a.last_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{a.email}</td>
                  <td className="px-4 py-3">
                    {a.enrollments.length === 0 ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {a.enrollments.map(e => (
                          <span
                            key={e.id}
                            className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          >
                            {e.course_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${a.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{a.progress}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(a.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
