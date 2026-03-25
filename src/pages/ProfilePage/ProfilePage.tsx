import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { deleteVideo, fetchUserVideos, updateVideoMetadata } from '../../services/videosService'
import { fetchCategories } from '../../services/categoriesService'
import { fetchFavoriteVideos, toggleFavorite } from '../../services/favoritesService'
import { fetchWatchHistoryVideos } from '../../services/watchHistoryService'
import { extractTags } from '../../utils/extractTags'
import type { Category } from '../../types/Category'
import type { Video } from '../../types/Video'
import VideoCard from '../../components/video/VideoCard'

export default function ProfilePage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])

  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [favorites, setFavorites] = useState<Video[]>([])

  const [loadingHistory, setLoadingHistory] = useState(true)
  const [history, setHistory] = useState<Video[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editVisibility, setEditVisibility] = useState<'public' | 'hidden'>('public')

  const [favoriteBusy, setFavoriteBusy] = useState(false)

  const favoriteCount = useMemo(() => favorites.length, [favorites])
  const historyCount = useMemo(() => history.length, [history])

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

  useEffect(() => {
    if (!user) return
    let cancelled = false

    ;(async () => {
      setLoadingFavorites(true)
      const favs = await fetchFavoriteVideos(user.uid, 30)
      if (cancelled) return
      setFavorites(favs)
      setLoadingFavorites(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    ;(async () => {
      setLoadingHistory(true)
      const list = await fetchWatchHistoryVideos(user.uid, 30)
      if (cancelled) return
      setHistory(list)
      setLoadingHistory(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingCats(true)
      const cats = await fetchCategories()
      if (cancelled) return
      setCategories(cats)
      setLoadingCats(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function refreshUserVideos() {
    if (!user) return
    setLoading(true)
    try {
      const list = await fetchUserVideos(user.uid)
      setVideos(list)
    } finally {
      setLoading(false)
    }
  }

  async function refreshFavorites() {
    if (!user) return
    setLoadingFavorites(true)
    try {
      const favs = await fetchFavoriteVideos(user.uid, 30)
      setFavorites(favs)
    } finally {
      setLoadingFavorites(false)
    }
  }

  async function refreshHistory() {
    if (!user) return
    setLoadingHistory(true)
    try {
      const list = await fetchWatchHistoryVideos(user.uid, 30)
      setHistory(list)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function onToggleFavorite(videoId: string) {
    if (!user) return
    setFavoriteBusy(true)
    try {
      await toggleFavorite({ userId: user.uid, videoId })
      await refreshFavorites()
    } finally {
      setFavoriteBusy(false)
    }
  }

  async function onDeleteVideo(videoId: string) {
    if (!user) return
    const ok = window.confirm('Delete this video?')
    if (!ok) return
    await deleteVideo({ videoId, ownerId: user.uid })
    await refreshUserVideos()
    await refreshFavorites()
    await refreshHistory()
  }

  function openEdit(v: Video) {
    setEditingId(v.id)
    setEditTitle(v.title)
    setEditDescription(v.description)
    setEditCategoryId(v.categoryId)
    setEditVisibility(v.visibility)
  }

  function closeEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditCategoryId('')
    setEditVisibility('public')
  }

  async function onSaveEdit(videoId: string) {
    if (!user) return
    await updateVideoMetadata({
      videoId,
      ownerId: user.uid,
      title: editTitle.trim(),
      description: editDescription.trim(),
      categoryId: editCategoryId,
      tags: extractTags(editTitle, editDescription),
      visibility: editVisibility,
    })
    closeEdit()
    await refreshUserVideos()
    await refreshFavorites()
    await refreshHistory()
  }

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
            Favorites: {favoriteCount}
          </div>
          <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900/30">
            History: {historyCount}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your uploaded videos</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Edit metadata, toggle visibility, or delete your videos.
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
          <div className="mt-4 space-y-5">
            {videos.map((v) => (
              <div key={v.id} className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-gray-900/30">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr] sm:items-start">
                  <VideoCard
                    video={v}
                    favorite={
                      editingId === v.id
                        ? undefined
                        : {
                            active: favorites.some((f) => f.id === v.id),
                            disabled: favoriteBusy,
                            onToggle: () => onToggleFavorite(v.id),
                          }
                    }
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {editingId === v.id ? (
                        <span className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-950/40 dark:text-purple-100">
                          Editing
                        </span>
                      ) : (
                        <span className="rounded-lg bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-900/30 dark:text-gray-100">
                          {v.visibility === 'public' ? 'Public' : 'Hidden'}
                        </span>
                      )}
                    </div>

                    {editingId === v.id ? (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-sm font-medium" htmlFor={`edit-title-${v.id}`}>
                            Title
                          </label>
                          <input
                            id={`edit-title-${v.id}`}
                            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium" htmlFor={`edit-desc-${v.id}`}>
                            Description
                          </label>
                          <textarea
                            id={`edit-desc-${v.id}`}
                            rows={3}
                            className="mt-1 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium" htmlFor={`edit-cat-${v.id}`}>
                              Category
                            </label>
                            <select
                              id={`edit-cat-${v.id}`}
                              className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                              value={editCategoryId}
                              onChange={(e) => setEditCategoryId(e.target.value)}
                              disabled={loadingCats}
                            >
                              {loadingCats ? (
                                <option value="">{'Loading...'}</option>
                              ) : (
                                categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium" htmlFor={`edit-vis-${v.id}`}>
                              Visibility
                            </label>
                            <select
                              id={`edit-vis-${v.id}`}
                              className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                              value={editVisibility}
                              onChange={(e) => setEditVisibility(e.target.value as 'public' | 'hidden')}
                            >
                              <option value="public">Public</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSaveEdit(v.id)}
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={closeEdit}
                            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-100 dark:hover:bg-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteVideo(v.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-100 dark:hover:bg-gray-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteVideo(v.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200">
          <h3 className="text-base font-semibold">Favorites</h3>
          {loadingFavorites ? (
            <div className="mt-3 text-sm text-gray-500">Loading...</div>
          ) : favorites.length === 0 ? (
            <p className="mt-1 text-gray-600 dark:text-gray-300">No favorites yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3">
              {favorites.slice(0, 6).map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  favorite={{
                    active: true,
                    disabled: favoriteBusy,
                    onToggle: () => onToggleFavorite(v.id),
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200">
          <h3 className="text-base font-semibold">Watch history</h3>
          {loadingHistory ? (
            <div className="mt-3 text-sm text-gray-500">Loading...</div>
          ) : history.length === 0 ? (
            <p className="mt-1 text-gray-600 dark:text-gray-300">No history yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3">
              {history.slice(0, 6).map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

