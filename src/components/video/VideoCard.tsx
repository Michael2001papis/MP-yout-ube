import { Link } from 'react-router-dom'

import type { Video } from '../../types/Video'
import { formatDuration } from '../../utils/formatDuration'

export default function VideoCard({ video }: { video: Video }) {
  const uploadedDate = new Date(video.uploadedAt).toLocaleDateString()

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block overflow-hidden rounded-lg bg-transparent hover:bg-black/0"
    >
      <div className="relative aspect-video w-full bg-black/5">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
          {formatDuration(video.durationSec)}
        </div>
      </div>

      <div className="px-2.5 pb-2 pt-3">
        <div className="line-clamp-2 text-sm font-medium leading-5 text-gray-900 dark:text-gray-100">
          {video.title}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>{video.views.toLocaleString()} views</span>
          <span className="text-gray-400">•</span>
          <span>{uploadedDate}</span>
        </div>
      </div>
    </Link>
  )
}

