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
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">Recommended</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Local videos with categories, tags, and search. Optimized for mobile and tablets.
        </p>
      </section>

      <section>
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
            className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/20 focus:ring-2 focus:ring-purple-200 dark:bg-gray-900/40 dark:border-white/10"
          />
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90 dark:bg-white dark:text-black"
          >
            Search
          </button>
        </form>
      </section>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-gray-900/20">
            <div className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Categories
            </div>
            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => onApplyFilters(undefined)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  !visibleCategoryId
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onApplyFilters(c.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    visibleCategoryId === c.id
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {/* Mobile chips */}
          <div className="mt-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => onApplyFilters(undefined)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
                  !visibleCategoryId
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-black/10 bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onApplyFilters(c.id)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
                    visibleCategoryId === c.id
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-black/10 bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <section className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Recommended / Local</h2>
              <div className="text-sm text-gray-500">{loading ? 'Loading...' : `${videos.length} videos`}</div>
            </div>

            {loading ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-white/70 p-2 dark:bg-gray-900/30" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="mt-8 rounded-xl border border-black/10 bg-white p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-gray-900/20 dark:text-gray-200">
                No videos match your filters.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {videos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

