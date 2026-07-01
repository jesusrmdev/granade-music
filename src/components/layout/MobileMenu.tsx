'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/lib/auth/actions'
import DarkModeToggle from './DarkModeToggle'

export default function MobileMenu({
  isLoggedIn,
  role,
}: {
  isLoggedIn: boolean
  role: string | undefined
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        aria-label="Menú"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 border-b border-zinc-200 bg-white px-4 pb-4 pt-2 shadow-lg dark:border-zinc-800 dark:bg-black">
          <nav className="flex flex-col gap-3 text-sm">
            {isLoggedIn && (
              <Link
                href={role === 'admin' ? '/admin' : '/dashboard'}
                className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                onClick={() => setOpen(false)}
              >
                {role === 'admin' ? 'Admin' : 'Mi clase'}
              </Link>
            )}
            {isLoggedIn && role === 'admin' && (
              <Link
                href="/admin/alumnos"
                className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                onClick={() => setOpen(false)}
              >
                Alumnos
              </Link>
            )}
            <Link
              href="/cursos"
              className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              onClick={() => setOpen(false)}
            >
              Cursos
            </Link>
            {isLoggedIn && role === 'student' && (
              <Link
                href="/perfil"
                className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                onClick={() => setOpen(false)}
              >
                Mi perfil
              </Link>
            )}
            <div className="flex items-center gap-3 pt-1 border-t border-zinc-200 dark:border-zinc-800">
              <DarkModeToggle />
              {isLoggedIn && (
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
                  >
                    Cerrar sesión
                  </button>
                </form>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
