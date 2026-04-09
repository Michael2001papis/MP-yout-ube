import type { Video } from '../types/Video'

/** Stable prefix so Firestore-free playback can resolve demo rows in services. */
export const DEMO_VIDEO_ID_PREFIX = 'demo-'

const DEMO_OWNER = 'demo'

/**
 * Public-domain / Google-hosted sample media only — for draft UX when Firestore is empty
 * or Firebase is not configured. categoryId values MUST match default categories in
 * categoriesService (cat_music, cat_education, cat_gaming, cat_sports).
 */
export const DEMO_VIDEOS: Video[] = [
  {
    id: `${DEMO_VIDEO_ID_PREFIX}big-buck-bunny`,
    ownerId: DEMO_OWNER,
    title: 'Big Buck Bunny (sample)',
    description:
      'Blender Foundation open movie. Shown when your project has no uploads yet or no videos in this category.',
    categoryId: 'cat_education',
    categoryName: 'Education',
    tags: ['sample', 'animation', 'education', 'demo'],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    durationSec: 596,
    views: 128_400,
    uploadedAt: Date.now() - 86400000 * 5,
    visibility: 'public',
  },
  {
    id: `${DEMO_VIDEO_ID_PREFIX}sintel`,
    ownerId: DEMO_OWNER,
    title: 'Sintel (sample)',
    description: 'Blender Foundation short — sample for Gaming category browsing.',
    categoryId: 'cat_gaming',
    categoryName: 'Gaming',
    tags: ['sample', 'fantasy', 'demo'],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    durationSec: 888,
    views: 92_100,
    uploadedAt: Date.now() - 86400000 * 4,
    visibility: 'public',
  },
  {
    id: `${DEMO_VIDEO_ID_PREFIX}elephants-dream`,
    ownerId: DEMO_OWNER,
    title: 'Elephants Dream (sample)',
    description: 'Open movie sample — mapped to Sports for browsing demos.',
    categoryId: 'cat_sports',
    categoryName: 'Sports',
    tags: ['sample', 'sci-fi', 'demo'],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    durationSec: 653,
    views: 54_200,
    uploadedAt: Date.now() - 86400000 * 3,
    visibility: 'public',
  },
  {
    id: `${DEMO_VIDEO_ID_PREFIX}for-bigger-blazes`,
    ownerId: DEMO_OWNER,
    title: 'Short clip (sample)',
    description: 'Short test clip — Music category demo.',
    categoryId: 'cat_music',
    categoryName: 'Music',
    tags: ['sample', 'short', 'music', 'demo'],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    durationSec: 15,
    views: 12_800,
    uploadedAt: Date.now() - 86400000 * 2,
    visibility: 'public',
  },
]

export function isDemoVideoId(id: string): boolean {
  return id.startsWith(DEMO_VIDEO_ID_PREFIX)
}

export function getDemoVideoById(id: string): Video | null {
  return DEMO_VIDEOS.find((v) => v.id === id) ?? null
}

export function listDemoVideosForFeed(categoryId: string | undefined, limit: number): Video[] {
  let list = [...DEMO_VIDEOS]
  if (categoryId) {
    list = list.filter((v) => v.categoryId === categoryId)
  }
  return list.sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, limit)
}

export function searchDemoVideos(query: string, categoryId: string | undefined, limit: number): Video[] {
  const q = query.trim().toLowerCase()
  const base = listDemoVideosForFeed(categoryId, 999)
  if (!q) return base.slice(0, limit)
  const tokens = q.split(/\s+/).filter(Boolean)
  return base
    .filter((v) => {
      const hay = `${v.title} ${v.description} ${v.tags.join(' ')}`.toLowerCase()
      return tokens.every((t) => hay.includes(t))
    })
    .slice(0, limit)
}

export function listRelatedDemos(categoryId: string | undefined, excludeVideoId: string, limit: number): Video[] {
  return listDemoVideosForFeed(categoryId, 999)
    .filter((v) => v.id !== excludeVideoId)
    .slice(0, limit)
}
