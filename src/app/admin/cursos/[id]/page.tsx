import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { deleteModule } from '@/lib/admin/actions'
import DeleteButton from '../../DeleteButton'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

async function checkAdmin() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')
}

async function getData(id: string) {
  try {
    const [courseRes, modulesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${id}&select=*&limit=1`, {
        headers: { apikey: ANON_KEY },
        cache: 'no-store',
      }),
      fetch(`${SUPABASE_URL}/rest/v1/modules?course_id=eq.${id}&select=*&order=sort_order.asc`, {
        headers: { apikey: ANON_KEY },
        cache: 'no-store',
      }),
    ])
    if (!courseRes.ok) return { course: null, modules: [] }
    const [course] = await courseRes.json()
    const modules = await modulesRes.json()
    return { course, modules }
  } catch {
    return { course: null, modules: [] }
  }
}

export default async function CourseDetailPage(props: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await props.params
  const { course, modules } = await getData(id)
  if (!course) notFound()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; Volver
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {course.name}
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {course.description || 'Sin descripción'}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Slug: {course.slug}</p>
        </div>
        <Link
          href={`/admin/cursos/${course.id}/editar`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Editar
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Módulos ({modules.length})
        </h2>
        <Link
          href={`/admin/modulos/nuevo?courseId=${course.id}`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Nuevo módulo
        </Link>
      </div>

      {modules.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          No hay módulos todavía. Crea el primero.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Orden</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Nombre</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {modules.map((mod: { id: number; name: string; sort_order: number }) => (
                <tr key={mod.id} className="bg-white dark:bg-black">
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{mod.sort_order}</td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                    <Link href={`/admin/modulos/${mod.id}`} className="hover:underline">
                      {mod.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/modulos/${mod.id}/editar`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={mod.id} action={deleteModule} label="Eliminar" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
