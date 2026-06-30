'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, updateProfile } from '@/lib/profile/actions'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ name: string; last_name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile().then(res => {
      if (res.error || !res.email) {
        router.push('/login')
        return
      }
      setProfile({ name: res.name, last_name: res.last_name, email: res.email })
      setLoading(false)
    })
  }, [router])

  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null } | null, formData: FormData) => {
      const result = await updateProfile(formData)
      if (!result.error) {
        const updated = await getProfile()
        if (!updated.error) {
          setProfile({ name: updated.name, last_name: updated.last_name, email: updated.email })
        }
      }
      return result
    },
    null,
  )

  if (loading) return null

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Mi perfil
      </h1>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              {(profile?.name ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {profile?.name} {profile?.last_name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile?.email}</p>
            </div>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={profile?.name ?? ''}
              required
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 transition focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:text-zinc-50 dark:focus:border-emerald-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="last_name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Apellidos
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              defaultValue={profile?.last_name ?? ''}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 transition focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:text-zinc-50 dark:focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {state?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
