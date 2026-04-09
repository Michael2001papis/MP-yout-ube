import { Link } from 'react-router-dom'

import AuthSetupSupportPanel from '../../components/auth/AuthSetupSupportPanel'
import { useAuth } from '../../context/AuthContext'
import MemberAuthCard from './MemberAuthCard'

/**
 * Member authentication only. Firebase setup lives in AuthSetupSupportPanel.
 * Administrators use /admin-access (footer link)—not mixed into this card.
 */
export default function AuthPage() {
  const { firebaseReady } = useAuth()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-2">
      {firebaseReady ? (
        <div className="mx-auto max-w-md">
          <MemberAuthCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,20rem)] lg:items-start lg:justify-center">
          <MemberAuthCard />
          <AuthSetupSupportPanel />
        </div>
      )}

      <footer className="mx-auto mt-12 max-w-md border-t border-black/5 pt-6 text-center dark:border-white/10">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Platform operator?{' '}
          <Link
            to="/admin-access"
            state={{ from: '/auth' }}
            className="font-medium text-purple-700 hover:underline dark:text-purple-300"
          >
            Administrator entry
          </Link>
          <span className="mx-1 text-gray-400">·</span>
          separate from member sign-in
        </p>
      </footer>
    </div>
  )
}
