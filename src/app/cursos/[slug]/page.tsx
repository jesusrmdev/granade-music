import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAuthCookieName } from '@/lib/supabase/action'
import EnrollButton from './EnrollButton'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type Course = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

const gradients: Record<string, string> = {
  'guitarra-iniciacion': 'from-emerald-500 to-teal-700',
  'guitarra-avanzado': 'from-blue-500 to-indigo-700',
  'bandurria-iniciacion': 'from-violet-500 to-purple-700',
  'bandurria-avanzado': 'from-orange-500 to-red-600',
  'conjunto': 'from-rose-500 to-pink-700',
}

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?slug=eq.${slug}&select=*&limit=1`,
      { headers: { apikey: ANON_KEY }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0] ?? null
  } catch {
    return null
  }
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.sub ?? null
  } catch {
    return null
  }
}

async function getEnrollmentStatus(courseId: number, accessToken: string): Promise<boolean> {
  const userId = getUserIdFromToken(accessToken)
  if (!userId) return false

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/enrollments?course_id=eq.${courseId}&user_id=eq.${userId}&select=id&limit=1`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) return false
    const rows = await res.json()
    return rows.length > 0
  } catch {
    return false
  }
}

export default async function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const course = await getCourse(slug)
  if (!course) notFound()

  const c = await cookies()
  const sessionCookie = c.get(getAuthCookieName())
  const accessToken: string | null = sessionCookie?.value
    ? (JSON.parse(sessionCookie.value).access_token ?? null)
    : null

  const enrolled = accessToken ? await getEnrollmentStatus(course.id, accessToken) : false
  const gradient = gradients[course.slug] ?? 'from-zinc-500 to-zinc-700'

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Link
        href="/cursos"
        className="mb-6 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; Volver a cursos
      </Link>

      <div
        className={`flex h-48 items-center justify-center rounded-lg bg-gradient-to-br sm:h-64 ${gradient}`}
      >
        <h1 className="text-5xl font-bold text-white/90">{course.name}</h1>
      </div>

      <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-300">{course.description}</p>

      <div className="mt-8">
        <EnrollButton
          courseId={course.id}
          enrolled={enrolled}
          isLoggedIn={!!accessToken}
        />
      </div>
    </section>
  )
}
