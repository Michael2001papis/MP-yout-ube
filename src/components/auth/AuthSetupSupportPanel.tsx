import { missingFirebaseEnv } from '../../services/firebase'

/**
 * Secondary support column on /auth when Firebase env is incomplete.
 * Keeps operational detail out of the member sign-in card.
 */
export default function AuthSetupSupportPanel() {
  const keys = missingFirebaseEnv
  if (keys.length === 0) return null

  return (
    <div
      id="auth-setup-support"
      className="rounded-xl border border-dashed border-gray-300/90 bg-gray-50/80 px-4 py-4 dark:border-white/15 dark:bg-gray-950/40"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Environment setup
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        Member sign-in uses Firebase. Until the six <code className="rounded bg-white/90 px-1 py-0.5 text-[11px] dark:bg-black/40">VITE_FIREBASE_*</code> values
        are set in <code className="rounded bg-white/90 px-1 py-0.5 text-[11px] dark:bg-black/40">.env</code> or{' '}
        <code className="rounded bg-white/90 px-1 py-0.5 text-[11px] dark:bg-black/40">.env.local</code> (see{' '}
        <code className="rounded bg-white/90 px-1 py-0.5 text-[11px] dark:bg-black/40">.env.example</code>), controls on the left stay inactive—by design.
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Restart <code className="rounded bg-white/90 px-1 py-0.5 text-[11px] dark:bg-black/40">npm run dev</code> after saving. On Vercel, set the same names and redeploy.
      </p>
      {import.meta.env.DEV ? (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">If you already edited env files, stop the dev server and start it again—hot reload does not refresh env.</p>
      ) : null}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">Required variable names</summary>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Missing environment variables">
          {keys.map((k) => (
            <li key={k}>
              <code className="rounded border border-gray-200/90 bg-white px-1.5 py-0.5 text-[11px] dark:border-white/10 dark:bg-black/30">{k}</code>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
