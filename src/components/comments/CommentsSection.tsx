export default function CommentsSection({ videoId }: { videoId: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Comments</h2>
      <div className="mt-3 rounded-lg border border-black/10 bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/30 dark:text-gray-200">
        Comments posting/loading is deferred to Phase 2. This section will be fully enabled later.
      </div>
      {/* Placeholder to keep layout stable for Phase 2 */}
      <div className="mt-4 hidden" aria-hidden="true">
        videoId: {videoId}
      </div>
    </section>
  )
}

