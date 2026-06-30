'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'

export default function LessonForm({
  action,
  moduleId,
  defaultValues,
}: {
  action: (prev: unknown, formData: FormData) => Promise<{ error: string | null }>
  moduleId: number
  defaultValues?: { id: number; name: string; description: string; sort_order: number }
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(async (_prev: unknown, formData: FormData) => {
    const result = await action(_prev, formData)
    if (!result.error) router.push(`/admin/modulos/${moduleId}`)
    return result
  }, null)

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <input type="hidden" name="module_id" value={moduleId} />
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
      <div>
        <label htmlFor="sort_order" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Orden
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={defaultValues?.sort_order ?? 0}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
