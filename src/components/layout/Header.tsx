import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { user, logout, role } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  async function onLogout() {
    setBusy(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  function goTo(path: string, state?: unknown) {
    setMenuOpen(false)
    navigate(path, state ? { state } : undefined)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white shadow-sm dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-semibold tracking-tight">
            MP-yout-ube
          </Link>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          <Link to="/" className="text-sm font-medium">
            Home
          </Link>
          <button
            type="button"
            onClick={() => goTo('/', { focusSearch: true })}
            className="text-sm font-medium"
          >
            Search
          </button>
          <Link to="/upload" className="text-sm font-medium">
            Upload
          </Link>
          <Link to="/about" className="text-sm font-medium">
            About
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <Link to="/auth?mode=login" className="text-sm font-medium text-purple-700">
              Login / Register
            </Link>
          ) : (
            <>
              <Link to="/profile" className="text-sm font-medium">
                Profile
              </Link>
              <Link to="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/settings" className="text-sm font-medium">
                Settings
              </Link>
              {role === 'admin' ? (
                <Link to="/admin" className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                disabled={busy}
                className="rounded-md border border-black/10 px-3 py-1 text-sm font-medium hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/5"
                aria-label="Sign out"
              >
                {busy ? 'Logging out...' : 'Logout'}
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-gray-950 dark:hover:bg-gray-900"
          >
            <span className="sr-only">Menu</span>
            <div className="relative h-5 w-5">
              <span
                className={[
                  'absolute left-0 right-0 top-1 h-0.5 w-5 origin-center rounded bg-gray-900 transition-all dark:bg-gray-100',
                  menuOpen ? 'rotate-45 top-2' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'absolute left-0 right-0 top-2 h-0.5 w-5 origin-center rounded bg-gray-900 transition-all dark:bg-gray-100',
                  menuOpen ? 'opacity-0' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'absolute left-0 right-0 top-3 h-0.5 w-5 origin-center rounded bg-gray-900 transition-all dark:bg-gray-100',
                  menuOpen ? '-rotate-45 top-2' : '',
                ].join(' ')}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen ? (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            role="presentation"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            className="fixed right-3 top-14 z-40 w-[calc(100%-1.5rem)] max-w-xs overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-950"
          >
            <div className="flex flex-col p-2">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => goTo('/', { focusSearch: true })}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
              >
                Search
              </button>
              <Link
                to="/upload"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
              >
                Upload
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
              >
                About
              </Link>

              <div className="my-2 border-t border-black/10 dark:border-white/10" />

              {!user ? (
                <Link
                  to="/auth?mode=login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/30"
                >
                  Login / Register
                </Link>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Settings
                  </Link>
                  {role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/30"
                    >
                      Admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false)
                      await onLogout()
                    }}
                    disabled={busy}
                    className="mt-1 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/5"
                    aria-label="Sign out"
                  >
                    {busy ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </header>
  )
}

