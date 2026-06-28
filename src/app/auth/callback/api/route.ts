import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserRole, getAuthCookieName } from '@/lib/supabase/action'

const MAX_CHUNK = 3180

async function cookieOpts(maxAge: number) {
  return { path: '/', sameSite: 'lax' as const, httpOnly: false, maxAge }
}

export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = await request.json()

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
  }

  const session = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  }

  const c = await cookies()
  const name = getAuthCookieName()
  const value = JSON.stringify(session)
  if (value.length <= MAX_CHUNK) {
    c.set(name, value, await cookieOpts(400 * 24 * 60 * 60))
  } else {
    for (let i = 0; i < value.length; i += MAX_CHUNK) {
      c.set(`${name}.${i / MAX_CHUNK}`, value.slice(i, i + MAX_CHUNK), await cookieOpts(400 * 24 * 60 * 60))
    }
  }

  const role = await getUserRole(accessToken)
  const redirect = role === 'admin' ? '/admin' : '/dashboard'

  return NextResponse.json({ redirect })
}
