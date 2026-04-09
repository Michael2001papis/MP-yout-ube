/**
 * Calm, product-grade notice when Firebase Web SDK env vars are incomplete.
 * Used on /auth and /admin-access so setup guidance stays consistent.
 */
export default function FirebaseConfigStatus({ missingKeys }: { missingKeys: string[] }) {
  if (missingKeys.length === 0) return null

  const allMissing = missingKeys.length === 6

  return (
    <section
      aria-labelledby="system-config-heading"
      className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-5 py-4 dark:border-white/10 dark:bg-slate-950/50"
    >
      <div className="flex gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-300"
          aria-hidden
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 0 1-.467-1.394V5.25A2.25 2.25 0 0 1 8.25 3h1.5c.646 0 1.245.26 1.68.69l3.43 3.43M6.75 12h.008v.008H6.75V12Z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="system-config-heading" className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Sign-in is waiting on environment setup
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The app is running, but Firebase credentials are not loaded yet—so member sign-in stays off. This is normal
            until configuration is finished; it is not a problem with your account.
          </p>

          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>
              In the <strong className="font-medium text-slate-900 dark:text-slate-100">project root</strong> (same folder
              as <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">package.json</code>), create{' '}
              <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">.env</code> or{' '}
              <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">.env.local</code>.
            </li>
            <li>
              Copy the variable <em>names</em> from <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">.env.example</code> and paste your real values from{' '}
              <strong className="font-medium text-slate-900 dark:text-slate-100">Firebase Console</strong> → Project
              settings → Your apps → Web app config.
            </li>
            <li>
              Names must stay exactly as shown (they must start with{' '}
              <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">VITE_</code>).
            </li>
            <li>
              <strong className="font-medium text-slate-900 dark:text-slate-100">Restart</strong> the dev server: stop it
              (Ctrl+C), then run <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">npm run dev</code>{' '}
              again. Vite only reads <code className="rounded bg-white/80 px-1 py-0.5 text-xs dark:bg-white/10">.env</code> when
              the server starts.
            </li>
            <li>
              On <strong className="font-medium text-slate-900 dark:text-slate-100">Vercel</strong>: add the same six
              variables under Project Settings → Environment Variables, then trigger a <strong className="font-medium text-slate-900 dark:text-slate-100">new deployment</strong>.
            </li>
          </ol>

          {import.meta.env.DEV ? (
            <p className="mt-3 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-slate-400">
              Still seeing this after editing <code className="text-[11px]">.env</code>? Almost always you need a full dev-server
              restart—not only a browser refresh.
            </p>
          ) : null}

          <details className="mt-4 rounded-lg border border-slate-200/80 bg-white/50 dark:border-white/10 dark:bg-black/15">
            <summary className="cursor-pointer select-none px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              {allMissing
                ? 'Show the six required variable names'
                : `Show missing variables (${missingKeys.length} of 6)`}
            </summary>
            <div className="border-t border-slate-200/80 px-3 pb-3 pt-2 dark:border-white/10">
              <ul className="flex flex-wrap gap-2" aria-label="Environment variable names to set">
                {missingKeys.map((name) => (
                  <li key={name}>
                    <code className="inline-block rounded-md border border-slate-200/90 bg-white px-2 py-1 text-xs text-slate-800 dark:border-white/10 dark:bg-black/30 dark:text-slate-200">
                      {name}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
