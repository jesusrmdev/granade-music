import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { getAuthCookieName } from '@/lib/supabase/action'
import { logout } from '@/lib/auth/actions'
import DarkModeToggle from './DarkModeToggle'
import MobileMenu from './MobileMenu'

export default async function Header() {
  const c = await cookies()
  const name = getAuthCookieName()
  const sessionCookie = c.get(name)
  const roleCookie = c.get(`${name}-role`)
  const isLoggedIn = !!sessionCookie?.value
  const role = roleCookie?.value as string | undefined

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Granade Music"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Granade Music
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          {isLoggedIn && (
            <>
              <Link
                href={role === 'admin' ? '/admin' : '/dashboard'}
                className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {role === 'admin' ? 'Admin' : 'Mi clase'}
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin/alumnos"
                  className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Alumnos
                </Link>
              )}
            </>
          )}
          <Link
            href="/cursos"
            className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Cursos
          </Link>
          {isLoggedIn && role === 'student' && (
            <Link
              href="/perfil"
              className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Mi perfil
            </Link>
          )}
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
        </nav>

        <MobileMenu isLoggedIn={isLoggedIn} role={role} />
      </div>
    </header>
  )
}
