import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '../../context/AuthContext'
import { fetchCategories } from '../../services/categoriesService'
import { uploadVideo } from '../../services/videosService'
import { extractTags } from '../../utils/extractTags'
import type { Category } from '../../types/Category'

async function getVideoDurationSec(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const videoEl = document.createElement('video')
    videoEl.preload = 'metadata'
    videoEl.src = url

    const cleanup = () => {
      URL.revokeObjectURL(url)
    }

    videoEl.onloadedmetadata = () => {
      const duration = videoEl.duration
      cleanup()
      if (!Number.isFinite(duration) || duration <= 0) return reject(new Error('Could not read video duration'))
      resolve(duration)
    }

    videoEl.onerror = () => {
      cleanup()
      reject(new Error('Failed to read video metadata'))
    }
  })
}

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').default(''),
  categoryId: z.string().min(1, 'Category is required'),
  thumbnailFile: z
    .instanceof(File)
    .refine((f) => f.type.startsWith('image/'), 'Thumbnail must be an image')
    .refine((f) => f.size <= 8 * 1024 * 1024, 'Thumbnail must be <= 8MB'),
  videoFile: z
    .instanceof(File)
    .refine((f) => f.type.startsWith('video/'), 'Video file is required')
    .refine((f) => f.size <= 500 * 1024 * 1024, 'Video must be <= 500MB (demo limit)'),
})

type UploadFormInput = z.input<typeof uploadSchema>

export default function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cats = await fetchCategories()
      if (!cancelled) setCategories(cats)
      if (!cancelled) setLoadingCats(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const form = useForm<UploadFormInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
    },
  })

  const visibility = useMemo(() => 'public' as const, [])

  async function onSubmit(data: UploadFormInput) {
    if (!user) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const durationSec = await getVideoDurationSec(data.videoFile)
      const description = (data.description ?? '').trim()
      const tags = extractTags(data.title, description)

      const videoId = await uploadVideo({
        ownerId: user.uid,
        title: data.title.trim(),
        description,
        categoryId: data.categoryId,
        tags,
        thumbnailFile: data.thumbnailFile,
        videoFile: data.videoFile,
        durationSec,
        visibility,
      })

      navigate(`/watch/${videoId}`)
    } catch (e: any) {
      setSubmitError(e?.message ? String(e.message) : 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Upload</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Add your video details and thumbnail. (Visibility controls come in Phase 2.)
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
            {...form.register('title')}
          />
          {form.formState.errors.title ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
            {...form.register('description')}
          />
          {form.formState.errors.description ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
            {...form.register('categoryId')}
            disabled={loadingCats}
          >
            <option value="">{loadingCats ? 'Loading categories...' : 'Select a category'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.categoryId.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="thumbnailFile">
            Thumbnail image
          </label>
          <input
            id="thumbnailFile"
            type="file"
            accept="image/*"
            className="mt-1 w-full text-sm"
            {...form.register('thumbnailFile', {
              setValueAs: (v) => (v as FileList)?.[0],
            })}
          />
          {form.formState.errors.thumbnailFile ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.thumbnailFile.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="videoFile">
            Video file
          </label>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            className="mt-1 w-full text-sm"
            {...form.register('videoFile', {
              setValueAs: (v) => (v as FileList)?.[0],
            })}
          />
          {form.formState.errors.videoFile ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.videoFile.message}</p>
          ) : null}
        </div>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {submitting ? 'Uploading...' : 'Upload video'}
        </button>
      </form>
    </div>
  )
}

