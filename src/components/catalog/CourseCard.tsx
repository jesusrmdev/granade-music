import Link from 'next/link'

type Course = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

const gradients = [
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-indigo-700',
  'from-violet-500 to-purple-700',
  'from-orange-500 to-red-600',
  'from-rose-500 to-pink-700',
]

export default function CourseCard({ course, index }: { course: Course; index: number }) {
  const initials = course.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 transition hover:shadow-lg dark:border-zinc-800 dark:hover:border-zinc-700"
    >
      <div
        className={`flex h-32 items-center justify-center bg-gradient-to-br sm:h-40 ${gradients[index % gradients.length]}`}
      >
        <span className="text-4xl font-bold text-white/90">{initials}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{course.name}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{course.description}</p>
      </div>
    </Link>
  )
}
