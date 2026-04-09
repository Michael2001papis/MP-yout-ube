import { Link, Outlet } from 'react-router-dom'

import Header from './Header'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const { loading, error, firebaseReady } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text)]">
      <Header />
      {error && firebaseReady ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {error}
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">Loading session...</div>
        ) : (
          <Outlet />
        )}
      </div>
      <footer className="mt-auto border-t border-black/10 bg-[var(--bg)] py-4 text-center text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1" aria-label="Quick links">
          <Link to="/about" className="text-gray-600 hover:text-purple-700 hover:underline dark:text-gray-400 dark:hover:text-purple-300">
            About
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden>
            ·
          </span>
          <Link
            to="/legal/terms"
            className="text-gray-600 hover:text-purple-700 hover:underline dark:text-gray-400 dark:hover:text-purple-300"
          >
            Terms
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden>
            ·
          </span>
          <Link
            to="/legal/privacy"
            className="text-gray-600 hover:text-purple-700 hover:underline dark:text-gray-400 dark:hover:text-purple-300"
          >
            Privacy
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden>
            ·
          </span>
          <Link
            to="/legal/copyright"
            className="text-gray-600 hover:text-purple-700 hover:underline dark:text-gray-400 dark:hover:text-purple-300"
          >
            Copyright
          </Link>
        </nav>
        <div>
          © 2026 Michael Papismedov – MP
          <span className="mx-1.5 text-gray-400 dark:text-gray-600">·</span>
          All rights reserved.
        </div>
      </footer>
    </div>
  )
}

