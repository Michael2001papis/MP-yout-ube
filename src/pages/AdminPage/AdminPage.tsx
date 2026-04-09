import { Link } from 'react-router-dom'

import { getPrimaryAdminDisplayName, isPrimaryAdminAccount } from '../../config/adminEnv'
import { useAuth } from '../../context/AuthContext'

export default function AdminPage() {
  const { user, role } = useAuth()
  const primaryLabel = getPrimaryAdminDisplayName()
  const isPrimary = isPrimaryAdminAccount(user?.email ?? null)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Administration</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Platform-level view. Client-side checks below help navigation only — deploy Firebase Security Rules for real
          enforcement.
        </p>
      </header>

      <section className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Current session</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium">{role}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="text-gray-500">Primary admin display name</dt>
            <dd className="font-medium">{primaryLabel}</dd>
          </div>
          {user?.email ? (
            <div className="flex flex-wrap gap-2">
              <dt className="text-gray-500">Signed-in account</dt>
              <dd className="font-mono text-xs text-gray-800 dark:text-gray-200">{user.email}</dd>
            </div>
          ) : null}
          {isPrimary ? (
            <p className="text-xs text-purple-700 dark:text-purple-300">
              This session matches the designated primary administrator slot (first email in{' '}
              <code className="rounded bg-black/5 px-1 dark:bg-white/10">VITE_ADMIN_EMAILS</code>).
            </p>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You have admin role. The configured primary administrator label is <strong>{primaryLabel}</strong> for
              platform branding; additional admins may share elevated access when listed in environment configuration.
            </p>
          )}
        </dl>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Permission levels (product model)
        </h2>
        <ul className="mt-3 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Guest</strong> — Browse public pages and watch
            public/demo content. Cannot upload, comment with identity, or access staff tools.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Authenticated user</strong> — Own profile, uploads,
            dashboard, comments/favorites/history where Firestore allows. No platform-wide admin tools.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Administrator</strong> — Access to this{' '}
            <code className="rounded bg-black/5 px-1 text-xs dark:bg-white/10">/admin</code> area. Moderation and user
            management features below are <strong>not yet implemented</strong> — placeholders only.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          What you can do in this build
        </h2>
        <ul className="mt-2 list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
          <li>Review this overview and permission boundaries.</li>
          <li>Use the same account to moderate content in the app only when future tools are wired (not available yet).</li>
          <li>Hidden videos: visibility is still enforced in the UI and must be mirrored in Security Rules.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-dashed border-black/20 bg-gray-50/80 p-4 dark:border-white/20 dark:bg-gray-950/40">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Placeholder / not implemented (honest)
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The following are <strong>not</strong> functional in this codebase yet — no fake buttons that claim otherwise:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
          <li>Live user directory management</li>
          <li>Reports queue and moderation actions</li>
          <li>Global video takedown from this screen</li>
          <li>Category management CRUD for the whole platform</li>
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Users (live data)</div>
          <div className="mt-1 text-2xl font-semibold text-gray-400">—</div>
          <p className="mt-2 text-xs text-gray-500">Read-only placeholder. Requires backend query + Rules.</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Videos (live data)</div>
          <div className="mt-1 text-2xl font-semibold text-gray-400">—</div>
          <p className="mt-2 text-xs text-gray-500">Read-only placeholder. Requires backend query + Rules.</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Reports</div>
          <div className="mt-1 text-2xl font-semibold text-gray-400">—</div>
          <p className="mt-2 text-xs text-gray-500">Not implemented.</p>
        </div>
      </div>

      <section className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
        <h2 className="font-semibold">Security note</h2>
        <p className="mt-2 leading-relaxed">
          Admin email lists and route guards run in the browser. A malicious client could bypass the UI. Production
          systems must enforce admin-only reads/writes in{' '}
          <strong>Firebase Security Rules</strong> (or server endpoints), not only here.
        </p>
      </section>

      <div className="text-sm">
        <Link to="/admin-access" className="text-purple-700 hover:underline dark:text-purple-300">
          Staff sign-in entry
        </Link>
        {' · '}
        <Link to="/" className="text-purple-700 hover:underline dark:text-purple-300">
          Home
        </Link>
      </div>
    </div>
  )
}
