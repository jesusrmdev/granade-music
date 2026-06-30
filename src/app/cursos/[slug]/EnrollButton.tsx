'use client'

import { useActionState } from 'react'
import { enroll, unenroll } from '@/lib/enroll/actions'

export default function EnrollButton({
  courseId,
  enrolled,
  isLoggedIn,
}: {
  courseId: number
  enrolled: boolean
  isLoggedIn: boolean
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null } | null, formData: FormData) => {
      const action = formData.get('action') as string
      if (action === 'enroll') return enroll(courseId)
      return unenroll(courseId)
    },
    null,
  )

  if (!isLoggedIn) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        <a href="/login" className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Inicia sesión
        </a>{' '}
        para matricularte en este curso.
      </p>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="action" value={enrolled ? 'unenroll' : 'enroll'} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg px-6 py-3 font-semibold text-white transition disabled:opacity-50 ${
          enrolled
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {pending ? 'Cargando...' : enrolled ? 'Desmatricularme' : 'Matricularme'}
      </button>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  )
}
