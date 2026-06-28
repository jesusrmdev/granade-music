'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/* eslint-disable react-hooks/set-state-in-effect */

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Completando autenticación...')

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const errorParam = params.get('error')

    if (errorParam) {
      setMessage(`Error de autenticación: ${errorParam}`)
      return
    }

    if (!accessToken || !refreshToken) {
      setMessage('Error: no se recibieron las credenciales.')
      return
    }

    fetch('/auth/callback/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    })
      .then(res => res.json())
      .then(data => router.push(data.redirect ?? '/dashboard'))
      .catch(() => setMessage('Error al procesar la autenticación.'))
  }, [router])

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  )
}
