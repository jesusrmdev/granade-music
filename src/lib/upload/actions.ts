'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getAuthCookieName } from '@/lib/supabase/action'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

async function getAdminAuth() {
  const c = await cookies()
  const name = getAuthCookieName()
  const sessionCookie = c.get(name)
  const roleCookie = c.get(`${name}-role`)
  if (!sessionCookie?.value || roleCookie?.value !== 'admin') throw new Error('No autorizado')
  const session = JSON.parse(sessionCookie.value)
  return session.access_token as string
}

const FILE_COLUMNS = { audio: 'audio_url', pdf: 'pdf_url', video: 'video_url' } as const
type FileType = keyof typeof FILE_COLUMNS

export async function saveLessonFile(
  lessonId: number,
  fileType: FileType,
  url: string,
): Promise<{ error: string | null }> {
  try {
    const token = await getAdminAuth()
    const column = FILE_COLUMNS[fileType]
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?id=eq.${lessonId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ [column]: url }),
      },
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || 'Error al guardar archivo')
    }
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al guardar archivo' }
  }
}

export async function deleteLessonFile(
  lessonId: number,
  fileType: FileType,
): Promise<{ error: string | null }> {
  try {
    const token = await getAdminAuth()
    const column = FILE_COLUMNS[fileType]
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?id=eq.${lessonId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ [column]: null }),
      },
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || 'Error al eliminar archivo')
    }
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar archivo' }
  }
}

export async function deleteFromStorage(
  bucket: string,
  path: string,
): Promise<{ error: string | null }> {
  try {
    const token = await getAdminAuth()
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'DELETE',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!res.ok) throw new Error('Error al eliminar archivo de storage')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar archivo de storage' }
  }
}
