'use client'

import { useActionState } from 'react'

export default function DeleteButton({
  id,
  action,
  label = 'Eliminar',
}: {
  id: number
  action: (id: number) => Promise<{ error: string | null }>
  label?: string
}) {
  const [state, formAction, pending] = useActionState(
    async () => action(id),
    null,
  )

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {pending ? '...' : label}
      </button>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  )
}
