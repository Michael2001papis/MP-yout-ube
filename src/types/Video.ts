export type VideoVisibility = 'public' | 'hidden'

export type Video = {
  id: string
  ownerId: string
  title: string
  description: string
  categoryId: string
  categoryName?: string
  tags: string[]
  videoUrl: string
  thumbnailUrl: string
  durationSec: number
  views: number
  uploadedAt: number
  visibility: VideoVisibility
}

