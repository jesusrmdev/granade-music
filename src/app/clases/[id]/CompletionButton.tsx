'use client'

import { useActionState } from 'react'
import { toggleCompletion } from '@/lib/progress/actions'

export default function CompletionButton({
  lessonId,
  completed,
}: {
  lessonId: number
  completed: boolean
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null } | null, formData: FormData) => {
      const markDone = formData.get('action') === 'complete'
      return toggleCompletion(lessonId, markDone)
    },
    null,
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="action" value={completed ? 'uncomplete' : 'complete'} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
          completed
            ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {pending ? (
          'Cargando...'
        ) : completed ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Desmarcar completada
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Marcar como completada
          </>
        )}
      </button>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  )
}
