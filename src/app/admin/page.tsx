import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { deleteCourse } from '@/lib/admin/actions'
import DeleteButton from './DeleteButton'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type Course = {
  id: number
  name: string
  slug: string
  description: string | null
}

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?select=*&order=created_at.asc`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function checkAdmin() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')
}

export default async function AdminPage() {
  await checkAdmin()
  const courses = await getCourses()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Administración
        </h1>
        <Link
          href="/admin/cursos/nuevo"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Nuevo curso
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Nombre</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {courses.map(course => (
              <tr key={course.id} className="bg-white dark:bg-black">
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  <Link
                    href={`/admin/cursos/${course.id}`}
                    className="hover:underline"
                  >
                    {course.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{course.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/cursos/${course.id}/editar`}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Editar
                    </Link>
                    <DeleteButton id={course.id} action={deleteCourse} label="Eliminar" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
