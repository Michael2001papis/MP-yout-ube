import { Link } from 'react-router-dom'

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Admin moderation, user approvals, and reports are implemented in Phase 3.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Users</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Videos</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Reports</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
        <div className="font-semibold">Next (Phase 3)</div>
        <div className="mt-1 text-gray-600 dark:text-gray-300">
          Implement user management, video moderation, category management, and reports system.
        </div>
        <div className="mt-3">
          <Link to="/about" className="text-purple-700 hover:underline dark:text-purple-300">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  )
}

