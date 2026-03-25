export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Theme, profile settings, and password change are implemented in Phase 2.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
          <div className="font-semibold">Dark / Light mode</div>
          <div className="mt-1 text-gray-600 dark:text-gray-300">Coming in Phase 2.</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
          <div className="font-semibold">Profile settings</div>
          <div className="mt-1 text-gray-600 dark:text-gray-300">Coming in Phase 2.</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
          <div className="font-semibold">Change password</div>
          <div className="mt-1 text-gray-600 dark:text-gray-300">Coming in Phase 2.</div>
        </div>
      </div>
    </div>
  )
}

