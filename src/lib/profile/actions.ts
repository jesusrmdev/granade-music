'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getAuthCookieName } from '@/lib/supabase/action'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

async function getAccessToken(): Promise<string | null> {
  const c = await cookies()
  const name = getAuthCookieName()
  const raw = c.get(name)?.value
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    return session.access_token ?? null
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

async function supabaseFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  if (!token) throw new Error('No autenticado')

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || 'Error de conexión')
  }

  return res
}

export async function getProfile(): Promise<{
  name: string
  last_name: string
  email: string
  error: string | null
}> {
  try {
    const token = await getAccessToken()
    if (!token) return { name: '', last_name: '', email: '', error: 'No autenticado' }

    const userId = getUserIdFromToken(token)
    if (!userId) return { name: '', last_name: '', email: '', error: 'Token inválido' }

    const res = await supabaseFetch(
      `/rest/v1/users?id=eq.${userId}&select=name,last_name,email&limit=1`,
    )
    const rows = await res.json()
    const user = rows?.[0]
    if (!user) return { name: '', last_name: '', email: '', error: 'Usuario no encontrado' }

    return { name: user.name, last_name: user.last_name, email: user.email, error: null }
  } catch (e) {
    return { name: '', last_name: '', email: '', error: e instanceof Error ? e.message : 'Error al obtener perfil' }
  }
}

export async function updateProfile(formData: FormData): Promise<{ error: string | null }> {
  try {
    const token = await getAccessToken()
    if (!token) return { error: 'No autenticado' }

    const userId = getUserIdFromToken(token)
    if (!userId) return { error: 'Token inválido' }

    const name = formData.get('name') as string
    const last_name = formData.get('last_name') as string

    if (!name?.trim()) return { error: 'El nombre es obligatorio' }

    await supabaseFetch(`/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: name.trim(), last_name: last_name?.trim() ?? '' }),
    })

    revalidatePath('/perfil')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar perfil' }
  }
}
