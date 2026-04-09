import { Outlet } from 'react-router-dom'

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
        © 2026 Michael Papismedov – MP
        <span className="mx-1.5 text-gray-400 dark:text-gray-600">·</span>
        All rights reserved.
      </footer>
    </div>
  )
}

