import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { fetchCategories } from '../../services/categoriesService'
import { deleteVideo, fetchUserVideos, updateVideoMetadata } from '../../services/videosService'
import { extractTags } from '../../utils/extractTags'
import type { Category } from '../../types/Category'
import type { Video } from '../../types/Video'
import VideoCard from '../../components/video/VideoCard'

export default function DashboardPage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editVisibility, setEditVisibility] = useState<'public' | 'hidden'>('public')

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

  const totalViews = useMemo(() => videos.reduce((acc, v) => acc + v.views, 0), [videos])

  if (!user) return null

  const userId = user.uid

  async function refreshVideos() {
    setLoading(true)
    try {
      const list = await fetchUserVideos(userId)
      setVideos(list)
    } finally {
      setLoading(false)
    }
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
    await updateVideoMetadata({
      videoId,
      ownerId: userId,
      title: editTitle.trim(),
      description: editDescription.trim(),
      categoryId: editCategoryId,
      tags: extractTags(editTitle, editDescription),
      visibility: editVisibility,
    })
    closeEdit()
    await refreshVideos()
  }

  async function onDeleteVideo(videoId: string) {
    const ok = window.confirm('Delete this video?')
    if (!ok) return
    await deleteVideo({ videoId, ownerId: userId })
    closeEdit()
    await refreshVideos()
  }

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
          <div className="mt-1 text-xs text-gray-500">Manage metadata, visibility, and deletion.</div>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Your videos</h2>
          <div className="text-xs text-gray-500">Edit / Visibility / Delete</div>
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
          <div className="mt-4 space-y-5">
            {videos.map((v) => (
              <div key={v.id} className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-gray-900/30">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr] sm:items-start">
                  <VideoCard video={v} />
                  <div>
                    {editingId === v.id ? (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Editing</div>

                        <div>
                          <label className="text-sm font-medium" htmlFor={`dash-title-${v.id}`}>
                            Title
                          </label>
                          <input
                            id={`dash-title-${v.id}`}
                            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium" htmlFor={`dash-desc-${v.id}`}>
                            Description
                          </label>
                          <textarea
                            id={`dash-desc-${v.id}`}
                            rows={3}
                            className="mt-1 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium" htmlFor={`dash-cat-${v.id}`}>
                              Category
                            </label>
                            <select
                              id={`dash-cat-${v.id}`}
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
                            <label className="text-sm font-medium" htmlFor={`dash-vis-${v.id}`}>
                              Visibility
                            </label>
                            <select
                              id={`dash-vis-${v.id}`}
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
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">{v.visibility === 'public' ? 'Public' : 'Hidden'}</div>
                        <div className="flex flex-wrap items-center gap-2">
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

