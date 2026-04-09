import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { missingFirebaseEnv } from '../../services/firebase'

/**
 * Public entry point explaining staff/admin sign-in.
 * Does not expose credentials — admin uses normal Firebase Auth with an email listed in VITE_ADMIN_EMAILS.
 */
export default function AdminEntryPage() {
  const { user, role, firebaseReady } = useAuth()

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff / administrator access</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          This path is for authorized platform staff only. Sign in with the administrator account configured for this
          deployment (see environment configuration). There is no separate password field here — authentication uses the
          same secure Firebase sign-in as the rest of the app.
        </p>
      </div>

      {!firebaseReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-medium">חיבור Firebase לא מוגדר</p>
          <p className="mt-2 leading-relaxed">
            כדי שמנהל המערכת (וחיבור משתמשים) יעבדו, צריך את כל משתני{' '}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_FIREBASE_*</code> — העתק מ־
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.example</code> לקובץ{' '}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env</code> או{' '}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.local</code>, מלא ערכים אמיתיים מ־Firebase
            Console (הגדרות הפרויקט → האפליקציה שלך), ואז הפעל מחדש את{' '}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">npm run dev</code>.
          </p>
          <p className="mt-2 text-xs leading-relaxed opacity-90">
            ב־Vercel: Project Settings → Environment Variables — אותם שמות, ואז Deploy מחדש (הבנייה קוראת את המשתנים).
          </p>
          {missingFirebaseEnv.length > 0 ? (
            <p className="mt-3 text-xs font-mono leading-relaxed">
              משתנים חסרים או ריקים: {missingFirebaseEnv.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {user && role === 'admin' ? (
          <Link
            to="/admin"
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Open admin dashboard
          </Link>
        ) : (
          <Link
            to="/auth?mode=login"
            state={{ from: '/admin' }}
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Continue to sign in
          </Link>
        )}
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
        >
          Back to home
        </Link>
      </div>

      {user && role !== 'admin' ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You are signed in, but this account does not have administrator privileges. Use an authorized staff account, or
          contact the platform owner.
        </p>
      ) : null}

      <p className="text-xs text-gray-500 dark:text-gray-500">
        Route protection is enforced in the app for UX; production deployments must also enforce privileges in Firebase
        Security Rules.
      </p>
    </div>
  )
}
