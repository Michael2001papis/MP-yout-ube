import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { fetchUserVideos } from '../../services/videosService'
import type { Video } from '../../types/Video'
import VideoCard from '../../components/video/VideoCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const list = await fetchUserVideos(user.uid)
      if (cancelled) return
      setVideos(list)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  const totalViews = useMemo(() => videos.reduce((acc, v) => acc + v.views, 0), [videos])

  if (!user) return null

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30">
          <div className="text-sm text-gray-500">Uploaded videos</div>
          <div className="mt-1 text-2xl font-semibold">{videos.length}</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/30 sm:col-span-2">
          <div className="text-sm text-gray-500">Total views</div>
          <div className="mt-1 text-2xl font-semibold">{totalViews.toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">Video edit/delete comes in Phase 2/3.</div>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Your videos</h2>
          <div className="text-xs text-gray-500">Read-only in Phase 1.</div>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-black/10 bg-gray-50 p-3 dark:border-white/10 dark:bg-gray-900/30" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-6 rounded-lg border border-black/10 bg-white p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200">
            No videos yet. Upload one to get started.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

