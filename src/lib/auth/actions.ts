'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { signInWithPassword, signUp, getUserRole, getAuthCookieName } from '@/lib/supabase/action'

const MAX_CHUNK = 3180

async function cookieOpts(maxAge: number) {
  return { path: '/', sameSite: 'lax' as const, httpOnly: false, maxAge }
}

function authCookie() {
  return getAuthCookieName()
}

async function setSessionCookie(session: Record<string, unknown>) {
  const c = await cookies()
  const value = JSON.stringify(session)
  const name = authCookie()
  if (value.length <= MAX_CHUNK) {
    c.set(name, value, await cookieOpts(400 * 24 * 60 * 60))
  } else {
    for (let i = 0; i < value.length; i += MAX_CHUNK) {
      c.set(`${name}.${i / MAX_CHUNK}`, value.slice(i, i + MAX_CHUNK), await cookieOpts(400 * 24 * 60 * 60))
    }
  }
}

async function clearSessionCookie() {
  const c = await cookies()
  const opts = await cookieOpts(0)
  const name = authCookie()
  c.set(name, '', opts)
  for (let i = 0; ; i++) {
    if (!c.get(`${name}.${i}`)) break
    c.set(`${name}.${i}`, '', opts)
  }
}

export interface AuthState { error: string | null }

export async function login(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) return { error: 'Todos los campos son obligatorios.' }

  try {
    const session = await signInWithPassword(email, password)
    session.expires_at ??= Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600)
    await setSessionCookie(session)

    const role = await getUserRole(session.access_token)
    revalidatePath('/')
    redirect(role === 'admin' ? '/admin' : '/dashboard')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error de autenticación.'
    return {
      error: message === 'Invalid login credentials'
        ? 'Credenciales incorrectas. Revisa tu email y contraseña.'
        : message,
    }
  }
}

export async function signup(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!name || !lastName || !email || !password) return { error: 'Todos los campos son obligatorios.' }

  try {
    const session = await signUp(email, password, { name, lastName })
    if (session.access_token) {
      session.expires_at ??= Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600)
      await setSessionCookie(session)
    }
    revalidatePath('/')
    redirect('/dashboard')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al registrarse.'
    return {
      error: message === 'User already registered'
        ? 'Este email ya está registrado. Inicia sesión.'
        : message,
    }
  }
}

export async function logout(): Promise<void> {
  await clearSessionCookie()
  revalidatePath('/')
  redirect('/')
}
