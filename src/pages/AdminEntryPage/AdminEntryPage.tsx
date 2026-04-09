import { Link } from 'react-router-dom'

import FirebaseConfigStatus from '../../components/auth/FirebaseConfigStatus'
import { useAuth } from '../../context/AuthContext'
import { missingFirebaseEnv } from '../../services/firebase'

/**
 * Dedicated administrator entry — public route, no credentials in UI.
 */
export default function AdminEntryPage() {
  const { user, role, firebaseReady } = useAuth()

  return (
    <div className="mx-auto max-w-lg space-y-10 px-1">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">Administrator access</h1>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          This entry is for authorized platform staff only. Sign in with an approved operator account—there is no separate
          admin password in the product.
        </p>
      </header>

      {!firebaseReady ? <FirebaseConfigStatus missingKeys={missingFirebaseEnv} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {user && role === 'admin' ? (
          <Link
            to="/admin"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 sm:flex-none"
          >
            Open admin console
          </Link>
        ) : (
          <Link
            to="/auth?mode=login"
            state={{ from: '/admin' }}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 sm:flex-none"
          >
            Continue to sign in
          </Link>
        )}
        <Link
          to="/"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5 sm:flex-none"
        >
          Back to home
        </Link>
      </div>

      {user && role !== 'admin' ? (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          You’re signed in, but this account doesn’t have administrator privileges. Use an approved staff account or contact
          the organization owner.
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-500">
        In-app checks guide experience only. Production systems should enforce operator permissions in Firebase Security
        Rules or a trusted backend.
      </p>
    </div>
  )
}
