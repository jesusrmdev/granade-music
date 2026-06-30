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

  if (!sessionCookie?.value || roleCookie?.value !== 'admin') {
    throw new Error('No autorizado')
  }

  const session = JSON.parse(sessionCookie.value)
  return session.access_token as string
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = await getAdminAuth()
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || 'Error de operación')
  }
  return res
}

// ── Courses ──

export async function createCourse(_prev: unknown, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    await adminFetch('/rest/v1/courses', {
      method: 'POST',
      body: JSON.stringify({ name, slug, description }),
    })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear curso' }
  }
}

export async function updateCourse(_prev: unknown, formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    await adminFetch(`/rest/v1/courses?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, slug, description }),
    })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar curso' }
  }
}

export async function deleteCourse(id: number): Promise<{ error: string | null }> {
  try {
    await adminFetch(`/rest/v1/courses?id=eq.${id}`, { method: 'DELETE' })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar curso' }
  }
}

// ── Modules ──

export async function createModule(_prev: unknown, formData: FormData) {
  try {
    const course_id = Number(formData.get('course_id'))
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const sort_order = Number(formData.get('sort_order') ?? 0)
    await adminFetch('/rest/v1/modules', {
      method: 'POST',
      body: JSON.stringify({ course_id, name, description, sort_order }),
    })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear módulo' }
  }
}

export async function updateModule(_prev: unknown, formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const sort_order = Number(formData.get('sort_order') ?? 0)
    await adminFetch(`/rest/v1/modules?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description, sort_order }),
    })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar módulo' }
  }
}

export async function deleteModule(id: number): Promise<{ error: string | null }> {
  try {
    await adminFetch(`/rest/v1/modules?id=eq.${id}`, { method: 'DELETE' })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar módulo' }
  }
}

// ── Lessons ──

export async function createLesson(_prev: unknown, formData: FormData) {
  try {
    const module_id = Number(formData.get('module_id'))
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const sort_order = Number(formData.get('sort_order') ?? 0)
    await adminFetch('/rest/v1/lessons', {
      method: 'POST',
      body: JSON.stringify({ module_id, name, description, sort_order }),
    })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear lección' }
  }
}

export async function updateLesson(_prev: unknown, formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const sort_order = Number(formData.get('sort_order') ?? 0)
    await adminFetch(`/rest/v1/lessons?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description, sort_order }),
    })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar lección' }
  }
}

export async function deleteLesson(id: number): Promise<{ error: string | null }> {
  try {
    await adminFetch(`/rest/v1/lessons?id=eq.${id}`, { method: 'DELETE' })
    revalidatePath('/admin')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar lección' }
  }
}
