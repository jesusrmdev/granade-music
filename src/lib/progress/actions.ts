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

export async function toggleCompletion(
  lessonId: number,
  completed: boolean,
): Promise<{ error: string | null }> {
  try {
    const token = await getAccessToken()
    if (!token) return { error: 'No autenticado' }

    const userId = getUserIdFromToken(token)
    if (!userId) return { error: 'Token inválido' }

    if (completed) {
      await supabaseFetch('/rest/v1/lesson_progress?onConflict=user_id,lesson_id', {
        method: 'POST',
        body: JSON.stringify({ lesson_id: lessonId, user_id: userId }),
        headers: { Prefer: 'resolution=ignore-duplicates' },
      })
    } else {
      await supabaseFetch(
        `/rest/v1/lesson_progress?lesson_id=eq.${lessonId}&user_id=eq.${userId}`,
        { method: 'DELETE' },
      )
    }

    revalidatePath('/clases')
    revalidatePath('/cursos')
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar progreso' }
  }
}

export async function getLessonProgress(
  lessonId: number,
): Promise<boolean> {
  try {
    const token = await getAccessToken()
    if (!token) return false

    const userId = getUserIdFromToken(token)
    if (!userId) return false

    const res = await supabaseFetch(
      `/rest/v1/lesson_progress?lesson_id=eq.${lessonId}&user_id=eq.${userId}&select=id&limit=1`,
    )
    const rows = await res.json()
    return rows.length > 0
  } catch {
    return false
  }
}

export async function getCompletedLessonIds(
  courseId: number,
): Promise<number[]> {
  try {
    const token = await getAccessToken()
    if (!token) return []

    const userId = getUserIdFromToken(token)
    if (!userId) return []

    const res = await supabaseFetch(
      `/rest/v1/modules?course_id=eq.${courseId}&select=id`,
    )
    const modules: { id: number }[] = await res.json()
    if (modules.length === 0) return []

    const moduleIds = modules.map(m => m.id).join(',')

    const lessonRes = await supabaseFetch(
      `/rest/v1/lessons?module_id=in.(${moduleIds})&select=id`,
    )
    const lessons: { id: number }[] = await lessonRes.json()
    if (lessons.length === 0) return []

    const lessonIds = lessons.map(l => l.id).join(',')

    const progressRes = await supabaseFetch(
      `/rest/v1/lesson_progress?user_id=eq.${userId}&lesson_id=in.(${lessonIds})&select=lesson_id`,
    )
    const progress: { lesson_id: number }[] = await progressRes.json()
    return progress.map(p => p.lesson_id)
  } catch {
    return []
  }
}

export async function getCourseProgress(
  courseId: number,
): Promise<{ completed: number; total: number }> {
  try {
    const token = await getAccessToken()
    if (!token) return { completed: 0, total: 0 }

    const userId = getUserIdFromToken(token)
    if (!userId) return { completed: 0, total: 0 }

    const res = await supabaseFetch(
      `/rest/v1/modules?course_id=eq.${courseId}&select=id`,
    )
    const modules: { id: number }[] = await res.json()
    if (modules.length === 0) return { completed: 0, total: 0 }

    const moduleIds = modules.map(m => m.id).join(',')

    const lessonRes = await supabaseFetch(
      `/rest/v1/lessons?module_id=in.(${moduleIds})&select=id`,
    )
    const lessons: { id: number }[] = await lessonRes.json()
    const total = lessons.length
    if (total === 0) return { completed: 0, total: 0 }

    const lessonIds = lessons.map(l => l.id).join(',')

    const progressRes = await supabaseFetch(
      `/rest/v1/lesson_progress?user_id=eq.${userId}&lesson_id=in.(${lessonIds})&select=id`,
    )
    const completedRows: { id: number }[] = await progressRes.json()

    return { completed: completedRows.length, total }
  } catch {
    return { completed: 0, total: 0 }
  }
}
