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

export async function enroll(courseId: number): Promise<{ error: string | null }> {
  try {
    const token = await getAccessToken()
    if (!token) return { error: 'No autenticado' }

    const userId = getUserIdFromToken(token)
    if (!userId) return { error: 'Token inválido' }

    await supabaseFetch('/rest/v1/enrollments', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, user_id: userId }),
    })
    revalidatePath('/cursos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al matricularte' }
  }
}

export async function unenroll(courseId: number): Promise<{ error: string | null }> {
  try {
    const token = await getAccessToken()
    if (!token) return { error: 'No autenticado' }

    const userId = getUserIdFromToken(token)
    if (!userId) return { error: 'Token inválido' }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/enrollments?course_id=eq.${courseId}&user_id=eq.${userId}`,
      {
        method: 'DELETE',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || 'Error al desmatricularte')
    }

    revalidatePath('/cursos')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al desmatricularte' }
  }
}

export async function isEnrolled(courseId: number): Promise<boolean> {
  try {
    const token = await getAccessToken()
    if (!token) return false

    const userId = getUserIdFromToken(token)
    if (!userId) return false

    const res = await supabaseFetch(
      `/rest/v1/enrollments?course_id=eq.${courseId}&user_id=eq.${userId}&select=id&limit=1`,
    )
    const rows = await res.json()
    return rows.length > 0
  } catch {
    return false
  }
}
