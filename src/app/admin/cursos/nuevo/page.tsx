import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { createCourse } from '@/lib/admin/actions'
import CourseForm from '../CourseForm'

async function checkAdmin() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')
}

export default async function NewCoursePage() {
  await checkAdmin()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Nuevo curso
      </h1>
      <CourseForm action={createCourse} />
    </section>
  )
}
