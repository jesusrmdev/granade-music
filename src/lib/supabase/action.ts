function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
}

function getAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
}

function getProjectRef(): string {
  return getSupabaseUrl().match(/https?:\/\/([^.]+)/)?.[1] ?? ''
}

export function getAuthCookieName(): string {
  return `sb-${getProjectRef()}-auth-token`
}

export async function signInWithPassword(email: string, password: string) {
  const url = getSupabaseUrl()
  const key = getAnonKey()
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error_description ?? body.error ?? 'Error de autenticación')
  return body
}

export async function signUp(email: string, password: string, data: Record<string, unknown>) {
  const url = getSupabaseUrl()
  const key = getAnonKey()
  const res = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, data }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error_description ?? body.error ?? 'Error al registrarse')
  return body
}

export async function getUser(accessToken: string) {
  const url = getSupabaseUrl()
  const key = getAnonKey()
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getUserRole(accessToken: string): Promise<string | null> {
  const user = await getUser(accessToken)
  if (!user?.id) return null
  const url = getSupabaseUrl()
  const key = getAnonKey()
  const res = await fetch(
    `${url}/rest/v1/users?id=eq.${user.id}&select=role`,
    { headers: { apikey: key, Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) return null
  const rows = await res.json()
  return rows?.[0]?.role ?? null
}

export function getGoogleOAuthUrl(origin: string) {
  const url = getSupabaseUrl()
  const params = new URLSearchParams({
    provider: 'google',
    redirect_to: `${origin}/auth/callback`,
  })
  return `${url}/auth/v1/authorize?${params}`
}
