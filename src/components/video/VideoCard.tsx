import { Link } from 'react-router-dom'

import type { Video } from '../../types/Video'
import { formatDuration } from '../../utils/formatDuration'

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm hover:shadow-md dark:border-white/10 dark:bg-gray-900"
    >
      <div className="relative aspect-video w-full bg-black/5">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {formatDuration(video.durationSec)}
        </div>
      </div>

      <div className="p-3">
        <div className="line-clamp-2 text-sm font-medium">{video.title}</div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
          <span>{video.views.toLocaleString()} views</span>
          <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}

