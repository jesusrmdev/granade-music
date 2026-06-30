import CourseCard from '@/components/catalog/CourseCard'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

type Course = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?select=*&order=created_at.asc`,
      {
        headers: { apikey: ANON_KEY },
        cache: 'no-store',
      },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function CursosPage() {
  const courses = await getCourses()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Cursos
      </h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">
        Explora nuestra oferta formativa
      </p>

      {courses.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          No hay cursos disponibles por ahora.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
