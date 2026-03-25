import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { fetchRelatedVideos, fetchVideoById, incrementViews } from '../../services/videosService'
import { useAuth } from '../../context/AuthContext'
import type { Video } from '../../types/Video'
import VideoCard from '../../components/video/VideoCard'
import CommentsSection from '../../components/comments/CommentsSection'
import { formatDuration } from '../../utils/formatDuration'

export default function WatchPage() {
  const { videoId } = useParams()
  const { user, role } = useAuth()

  const [loading, setLoading] = useState(true)
  const [video, setVideo] = useState<Video | null>(null)
  const [related, setRelated] = useState<Video[]>([])
  const [error, setError] = useState<string | null>(null)

  const hasIncrementedRef = useRef(false)

  useEffect(() => {
    if (!videoId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      const v = await fetchVideoById(videoId)
      if (cancelled) return
      if (!v) {
        setVideo(null)
        setError('Video not found.')
        setLoading(false)
        return
      }

      const canViewHidden = role === 'admin' || (user && user.uid === v.ownerId)
      if (v.visibility === 'hidden' && !canViewHidden) {
        setVideo(null)
        setError('This video is not available.')
        setLoading(false)
        return
      }

      setVideo(v)

      if (!hasIncrementedRef.current) {
        hasIncrementedRef.current = true
        await incrementViews(videoId)
      }

      const rel = await fetchRelatedVideos({ categoryId: v.categoryId, excludeVideoId: v.id })
      if (cancelled) return
      setRelated(rel)

      setLoading(false)
    })().catch(() => {
      setError('Failed to load video.')
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [role, user, videoId])

  const uploadedDate = useMemo(() => (video ? new Date(video.uploadedAt).toLocaleDateString() : ''), [video])

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">Loading video...</div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-black/10 bg-white p-5 text-sm text-gray-700 dark:bg-gray-900/30 dark:text-gray-200">
          <div className="font-semibold">{error}</div>
          <Link to="/" className="mt-3 inline-block text-purple-700 hover:underline dark:text-purple-300">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  if (!video) return null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <div className="overflow-hidden rounded-xl bg-black">
          {/* HTML5 video player */}
          <video src={video.videoUrl} controls className="h-auto w-full bg-black" />
        </div>

        <div className="mt-4 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-gray-900/20">
          <h1 className="text-xl font-semibold leading-6">{video.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
            {video.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{video.views.toLocaleString()} views</span>
            <span className="text-gray-400">•</span>
            <span>{uploadedDate}</span>
            <span className="text-gray-400">•</span>
            <span>{formatDuration(video.durationSec)} duration</span>
          </div>
        </div>

        <CommentsSection videoId={video.id} />
      </section>

      <aside>
        <h2 className="text-lg font-semibold">Related</h2>
        <div className="mt-3 space-y-4">
          {related.length === 0 ? (
            <div className="rounded-lg border border-black/10 bg-white p-3 text-sm text-gray-600 dark:bg-gray-900/30 dark:text-gray-200">
              No related videos found.
            </div>
          ) : (
            related.map((v) => <VideoCard key={v.id} video={v} />)
          )}
        </div>
      </aside>
    </div>
  )
}

