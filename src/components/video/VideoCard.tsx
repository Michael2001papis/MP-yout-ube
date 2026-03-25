import { Link } from 'react-router-dom'

import type { Video } from '../../types/Video'
import { formatDuration } from '../../utils/formatDuration'

type FavoriteControl = {
  active: boolean
  disabled?: boolean
  onToggle: () => Promise<void> | void
}

export default function VideoCard({ video, favorite }: { video: Video; favorite?: FavoriteControl }) {
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
        {favorite ? (
          <button
            type="button"
            aria-label={favorite.active ? 'Remove from favorites' : 'Save to favorites'}
            disabled={favorite.disabled}
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              await favorite.onToggle()
            }}
            className={[
              'absolute left-2 top-2 z-10 rounded-full border px-2 py-1 text-xs font-semibold transition',
              favorite.active
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-white/40 bg-black/50 text-white hover:bg-black/60',
            ].join(' ')}
          >
            {favorite.active ? 'Saved' : 'Save'}
          </button>
        ) : null}
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

