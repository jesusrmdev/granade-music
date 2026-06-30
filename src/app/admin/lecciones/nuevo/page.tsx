import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { createLesson } from '@/lib/admin/actions'
import LessonForm from '../LessonForm'

async function checkAdmin() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')
}

export default async function NewLessonPage(props: {
  searchParams: Promise<{ moduleId: string }>
}) {
  await checkAdmin()
  const { moduleId } = await props.searchParams

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Nueva lección
      </h1>
      <LessonForm action={createLesson} moduleId={Number(moduleId)} />
    </section>
  )
}
