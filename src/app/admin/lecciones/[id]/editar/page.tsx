import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import { updateLesson } from '@/lib/admin/actions'
import LessonForm from '../../LessonForm'
import FileUploader from '@/components/admin/FileUploader'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

async function checkAdmin() {
  const c = await cookies()
  const roleCookie = c.get(`${getAuthCookieName()}-role`)
  if (roleCookie?.value !== 'admin') redirect('/cursos')
}

async function getLesson(id: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?select=*,modules(course_id)&id=eq.${id}&limit=1`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0] ?? null
  } catch {
    return null
  }
}

export default async function EditLessonPage(props: { params: Promise<{ id: string }> }) {
  await checkAdmin()
  const { id } = await props.params
  const lesson = await getLesson(id)
  if (!lesson) notFound()

  const courseUrl = `/admin/cursos/${lesson.modules?.course_id ?? ''}`

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Link
        href={courseUrl}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; Volver
      </Link>

      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Editar lección
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Datos</h2>
          <LessonForm action={updateLesson} moduleId={lesson.module_id} defaultValues={lesson} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Archivos</h2>
          <div className="flex flex-col gap-4">
            <FileUploader lessonId={lesson.id} fileType="audio" currentUrl={lesson.audio_url} />
            <FileUploader lessonId={lesson.id} fileType="pdf" currentUrl={lesson.pdf_url} />
            <FileUploader lessonId={lesson.id} fileType="video" currentUrl={lesson.video_url} />
          </div>
        </div>
      </div>
    </section>
  )
}
