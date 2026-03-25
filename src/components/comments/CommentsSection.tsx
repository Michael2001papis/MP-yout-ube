import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '../../context/AuthContext'
import { addComment, deleteComment, fetchComments } from '../../services/commentsService'
import type { Comment } from '../../types/Comment'

const commentSchema = z.object({
  text: z.string().trim().min(1, 'Comment is required').max(500, 'Comment is too long'),
})

type CommentInput = z.infer<typeof commentSchema>

export default function CommentsSection({ videoId }: { videoId: string }) {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Array<Comment & { authorName: string; authorPhotoURL: string | null }>>([])
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  })

  const commentCount = useMemo(() => comments.length, [comments])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchComments(videoId, 50)
      setComments(list)
    } catch {
      setError('Failed to load comments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  async function onSubmit(data: CommentInput) {
    if (!user) return
    setError(null)
    try {
      await addComment({ videoId, userId: user.uid, text: data.text.trim() })
      form.reset({ text: '' })
      await refresh()
    } catch {
      setError('Failed to post comment.')
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <div className="text-sm text-gray-500">{loading ? 'Loading...' : `${commentCount}`}</div>
      </div>

      {user ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-900/30">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="comment-text">
                Comment
              </label>
              <textarea
                id="comment-text"
                rows={3}
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-white/10 dark:bg-gray-900/30"
                placeholder="Add a comment..."
                {...form.register('text')}
              />
              {form.formState.errors.text ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.text.message}</p>
              ) : null}
              {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                  disabled={form.formState.isSubmitting}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-4 rounded-xl border border-black/10 bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/30 dark:text-gray-200">
          Sign in to comment.
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-gray-900/20" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-gray-900/20 dark:text-gray-200">
            No comments yet. Be the first!
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => {
              const time = c.createdAt ? new Date(c.createdAt).toLocaleString() : ''
              const canDelete = user?.uid === c.userId
              return (
                <div key={c.id} className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-gray-900/20">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-900/30">
                      {c.authorPhotoURL ? (
                        <img src={c.authorPhotoURL} alt={c.authorName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                          {c.authorName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{c.authorName}</div>
                        {time ? <div className="text-xs text-gray-500">{time}</div> : null}
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                        {c.text}
                      </div>
                      {canDelete ? (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user) return
                              try {
                                await deleteComment({ commentId: c.id, userId: user.uid })
                                await refresh()
                              } catch {
                                setError('Failed to delete comment.')
                              }
                            }}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

