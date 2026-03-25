import { Outlet } from 'react-router-dom'

import Header from './Header'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const { loading, error } = useAuth()

  return (
    <div className="min-h-dvh bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header />
      {error ? (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {error}
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">Loading session...</div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}

