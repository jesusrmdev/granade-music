import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { updateCourse } from '@/lib/admin/actions'
import CourseForm from '../../CourseForm'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

async function checkAdmin() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')
}

async function getCourse(id: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?id=eq.${id}&select=*&limit=1`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0] ?? null
  } catch {
    return null
  }
}

export default async function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await props.params
  const course = await getCourse(id)
  if (!course) notFound()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Editar curso
      </h1>
      <CourseForm action={updateCourse} defaultValues={course} />
    </section>
  )
}
