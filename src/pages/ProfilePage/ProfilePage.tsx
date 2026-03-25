import { useEffect, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { fetchUserVideos } from '../../services/videosService'
import type { Video } from '../../types/Video'
import VideoCard from '../../components/video/VideoCard'

export default function ProfilePage() {
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

  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-900">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-xl font-semibold">{user.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{user.email ?? '—'}</div>
            <div className="mt-1 text-xs text-gray-500">Role: {user.role}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900/30">
            Uploaded: {videos.length}
          </div>
          <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900/30">
            Favorites/History: Phase 2
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your uploaded videos</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Read-only in Phase 1. Edit/delete controls are added in Phase 2/3.
        </p>

        {loading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-black/10 bg-gray-50 p-3 dark:border-white/10 dark:bg-gray-900/30" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-6 rounded-lg border border-black/10 bg-white p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200">
            You haven’t uploaded any videos yet.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200">
          <h3 className="text-base font-semibold">Favorites</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Favorites UI and actions will be enabled in Phase 2.</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200">
          <h3 className="text-base font-semibold">Watch history</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Watch history tracking and display will be enabled in Phase 2.</p>
        </div>
      </section>
    </div>
  )
}

