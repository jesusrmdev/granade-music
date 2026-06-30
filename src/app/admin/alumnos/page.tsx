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
  enrollments: {
    id: number
    course_id: number
    courses: { name: string }
  }[]
}

async function getAlumnos(token: string): Promise<Alumno[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/users?role=eq.student&select=*,enrollments(*,courses(name))&order=created_at.desc`,
      {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    )
    if (!res.ok) return []
    return res.json()
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
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {alumnos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
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
                            {e.courses.name}
                          </span>
                        ))}
                      </div>
                    )}
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
