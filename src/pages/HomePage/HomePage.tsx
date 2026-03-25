import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

import { fetchCategories } from '../../services/categoriesService'
import { fetchPublicVideos, searchVideosLocally } from '../../services/videosService'
import type { Category } from '../../types/Category'
import type { Video } from '../../types/Video'
import VideoCard from '../../components/video/VideoCard'

export default function HomePage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQ = searchParams.get('q') ?? ''
  const initialCategory = searchParams.get('category') ?? ''

  const [categories, setCategories] = useState<Category[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState(initialQ)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const query = initialQ.trim()
  const categoryId = initialCategory.trim() || undefined
  const shouldFocusSearch = !!(location.state && (location.state as any).focusSearch)

  useEffect(() => {
    ;(async () => {
      const cats = await fetchCategories()
      setCategories(cats)
    })()
  }, [])

  useEffect(() => {
    if (!shouldFocusSearch) return
    inputRef.current?.focus()
  }, [shouldFocusSearch])

  useEffect(() => {
    setSearchValue(initialQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ])

  const visibleCategoryId = useMemo(() => categoryId, [categoryId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    ;(async () => {
      const result = query
        ? await searchVideosLocally({ query, categoryId: visibleCategoryId })
        : await fetchPublicVideos({ categoryId: visibleCategoryId })

      if (cancelled) return
      setVideos(result)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [query, visibleCategoryId])

  function onApplyFilters(nextCategoryId?: string) {
    const params = new URLSearchParams(searchParams)
    if (typeof nextCategoryId === 'string' && nextCategoryId.length > 0) params.set('category', nextCategoryId)
    else params.delete('category')
    if (query.length > 0) params.set('q', query)
    else params.delete('q')
    setSearchParams(params)
  }

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    const q = searchValue.trim()
    if (q) params.set('q', q)
    else params.delete('q')
    if (categoryId) params.set('category', categoryId)
    setSearchParams(params)
  }

  return (
    <div>
      <section className="rounded-2xl border border-black/10 bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-6 dark:from-purple-950/30 dark:to-indigo-950/30">
        <h1 className="text-3xl font-semibold tracking-tight">Watch, upload, and share.</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
          A YouTube-inspired platform for local videos with categories, search, roles, and secure authentication.
        </p>
      </section>

      <section className="mt-6">
        <form onSubmit={onSubmitSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="search">
            Search videos
          </label>
          <input
            id="search"
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search videos, tags, titles..."
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApplyFilters(undefined)}
            className={`rounded-full border px-3 py-1 text-xs ${
              !visibleCategoryId
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900/40 dark:text-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onApplyFilters(c.id)}
              className={`rounded-full border px-3 py-1 text-xs ${
                visibleCategoryId === c.id
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900/40 dark:text-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recommended / Local</h2>
          <div className="text-sm text-gray-500">{loading ? 'Loading...' : `${videos.length} videos`}</div>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-black/10 bg-gray-50 p-3 dark:bg-gray-900/30" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-8 rounded-lg border border-black/10 bg-white p-4 text-sm text-gray-600 dark:bg-gray-900/30 dark:text-gray-200">
            No videos match your filters.
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

