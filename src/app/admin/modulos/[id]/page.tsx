import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { deleteLesson } from '@/lib/admin/actions'
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
    const [modRes, lessonsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/modules?id=eq.${id}&select=*,courses(name)&limit=1`, {
        headers: { apikey: ANON_KEY },
        cache: 'no-store',
      }),
      fetch(`${SUPABASE_URL}/rest/v1/lessons?module_id=eq.${id}&select=*&order=sort_order.asc`, {
        headers: { apikey: ANON_KEY },
        cache: 'no-store',
      }),
    ])
    if (!modRes.ok) return { mod: null, lessons: [] }
    const [mod] = await modRes.json()
    const lessons = await lessonsRes.json()
    return { mod, lessons }
  } catch {
    return { mod: null, lessons: [] }
  }
}

export default async function ModuleDetailPage(props: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await props.params
  const { mod, lessons } = await getData(id)
  if (!mod) notFound()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Link
        href={`/admin/cursos/${mod.course_id}`}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; Volver al curso{mod.courses ? `: ${mod.courses.name}` : ''}
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {mod.name}
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {mod.description || 'Sin descripción'}
          </p>
        </div>
        <Link
          href={`/admin/modulos/${mod.id}/editar`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Editar
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Lecciones ({lessons.length})
        </h2>
        <Link
          href={`/admin/lecciones/nuevo?moduleId=${mod.id}`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Nueva lección
        </Link>
      </div>

      {lessons.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          No hay lecciones todavía. Crea la primera.
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
              {lessons.map((lesson: { id: number; name: string; sort_order: number }) => (
                <tr key={lesson.id} className="bg-white dark:bg-black">
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{lesson.sort_order}</td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">{lesson.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/lecciones/${lesson.id}/editar`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={lesson.id} action={deleteLesson} label="Eliminar" />
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
