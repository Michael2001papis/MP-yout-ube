import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  increment,
  type DocumentReference,
} from 'firebase/firestore'
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage'

import {
  getDemoVideoById,
  isDemoVideoId,
  listDemoVideosForFeed,
  listRelatedDemos,
  searchDemoVideos,
} from '../data/demoVideos'
import { db, storage, firebaseReady } from './firebase'
import type { Video, VideoVisibility } from '../types/Video'

function toNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : fallback
}

function mapVideoDoc(id: string, data: any): Video {
  return {
    id,
    ownerId: String(data.ownerId),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    categoryId: String(data.categoryId),
    categoryName: typeof data.categoryName === 'string' ? data.categoryName : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    videoUrl: String(data.videoUrl ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    durationSec: toNumber(data.durationSec, 0),
    views: toNumber(data.views, 0),
    uploadedAt: toNumber(data.uploadedAt, 0),
    visibility: (data.visibility as VideoVisibility) ?? 'public',
  }
}

async function getVideosBase(whereClauses: any[], max = 24): Promise<Video[]> {
  if (!firebaseReady) return []
  const q = query(collection(db, 'videos'), ...whereClauses, orderBy('uploadedAt', 'desc'), limit(max))
  const snap = await getDocs(q)
  const out: Video[] = []
  snap.forEach((d) => {
    out.push(mapVideoDoc(d.id, d.data()))
  })
  return out
}

export async function fetchPublicVideos(options?: {
  categoryId?: string
  limitCount?: number
}): Promise<Video[]> {
  const limit = options?.limitCount ?? 24
  const categoryId = options?.categoryId

  if (!firebaseReady) {
    return listDemoVideosForFeed(categoryId, limit)
  }

  const whereClauses: any[] = [where('visibility', '==', 'public')]
  if (categoryId) {
    whereClauses.push(where('categoryId', '==', categoryId))
  }

  let live: Video[] = []
  try {
    live = await getVideosBase(whereClauses, limit)
  } catch {
    live = []
  }

  if (live.length > 0) return live
  return listDemoVideosForFeed(categoryId, limit)
}

export async function searchVideosLocally(options: {
  query: string
  categoryId?: string
  limitCount?: number
}): Promise<Video[]> {
  const limit = options.limitCount ?? 24
  const q = options.query.trim().toLowerCase()
  const categoryId = options.categoryId

  if (!firebaseReady) {
    return searchDemoVideos(options.query, categoryId, limit)
  }

  if (!q) return fetchPublicVideos({ categoryId, limitCount: limit })

  // Simple Phase 1 search: fetch a chunk of recent public videos, filter on client.
  const candidates = await fetchPublicVideos({ categoryId, limitCount: limit * 3 })

  const tokens = q.split(/\s+/g).filter(Boolean)
  return candidates.filter((v) => {
    const hay = `${v.title} ${v.description} ${v.tags.join(' ')}`.toLowerCase()
    return tokens.every((t) => hay.includes(t))
  })
}

// SECURITY: Reads the video document as-is. Hidden videos must be blocked at the Firestore Rules layer;
// this function does not filter by visibility — WatchPage applies UI checks after fetch.

export async function fetchVideoById(videoId: string): Promise<Video | null> {
  if (isDemoVideoId(videoId)) {
    return getDemoVideoById(videoId)
  }
  if (!firebaseReady) return null
  const ref = doc(db, 'videos', videoId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapVideoDoc(snap.id, snap.data())
}

export async function fetchUserVideos(ownerId: string): Promise<Video[]> {
  if (!firebaseReady) return []
  // Users can manage their own videos in Phase 2/3. Phase 1 still displays list read-only.
  const q = query(collection(db, 'videos'), where('ownerId', '==', ownerId), orderBy('uploadedAt', 'desc'))
  const snap = await getDocs(q)
  const out: Video[] = []
  snap.forEach((d) => out.push(mapVideoDoc(d.id, d.data())))
  return out
}

export async function incrementViews(videoId: string): Promise<void> {
  if (isDemoVideoId(videoId) || !firebaseReady) return
  const ref = doc(db, 'videos', videoId)
  await updateDoc(ref, { views: increment(1) })
}

export async function updateVideoMetadata(args: {
  videoId: string
  ownerId: string
  title: string
  description: string
  categoryId: string
  tags: string[]
  visibility: VideoVisibility
}): Promise<void> {
  if (!firebaseReady) return
  const ref = doc(db, 'videos', args.videoId)
  await updateDoc(ref, {
    title: args.title,
    description: args.description,
    categoryId: args.categoryId,
    tags: args.tags,
    visibility: args.visibility,
  })
}

export async function setVideoVisibility(args: {
  videoId: string
  ownerId: string
  visibility: VideoVisibility
}): Promise<void> {
  if (!firebaseReady) return
  const ref = doc(db, 'videos', args.videoId)
  await updateDoc(ref, { visibility: args.visibility })
}

export async function deleteVideo(args: { videoId: string; ownerId: string }): Promise<void> {
  if (!firebaseReady) return
  const ref = doc(db, 'videos', args.videoId)
  await deleteDoc(ref)
}

export async function fetchRelatedVideos(options: {
  categoryId?: string
  excludeVideoId: string
  limitCount?: number
}): Promise<Video[]> {
  const max = options.limitCount ?? 8
  const exclude = options.excludeVideoId
  const categoryId = options.categoryId

  if (!firebaseReady) {
    return listRelatedDemos(categoryId, exclude, max)
  }

  const clauses: any[] = [where('visibility', '==', 'public')]
  if (categoryId) clauses.push(where('categoryId', '==', categoryId))

  let candidates: Video[] = []
  try {
    candidates = await getVideosBase(clauses, max * 2)
  } catch {
    candidates = []
  }

  const filtered = candidates.filter((v) => v.id !== exclude)
  if (filtered.length > 0) return filtered.slice(0, max)
  return listRelatedDemos(categoryId, exclude, max)
}

async function uploadToStorage(args: {
  file: File
  path: string
  contentType?: string
}): Promise<{ downloadUrl: string }> {
  const r = storageRef(storage, args.path)
  const task = uploadBytesResumable(r, args.file, {
    contentType: args.contentType,
  })

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      () => {},
      (err) => reject(err),
      () => resolve(),
    )
  })

  const downloadUrl = await getDownloadURL(r)
  return { downloadUrl }
}

export async function uploadVideo(args: {
  ownerId: string
  title: string
  description: string
  categoryId: string
  tags: string[]
  thumbnailFile: File
  videoFile: File
  durationSec: number
  visibility: VideoVisibility
}): Promise<string> {
  if (!firebaseReady) {
    throw new Error('Firebase is not configured yet. Add VITE_FIREBASE_* env vars to your .env file.')
  }
  const videoRef: DocumentReference = doc(collection(db, 'videos'))
  const videoId = videoRef.id

  const uploadedAt = Date.now()

  const [thumbnail, videoUrl] = await Promise.all([
    uploadToStorage({
      file: args.thumbnailFile,
      path: `thumbnails/${args.ownerId}/${videoId}/${args.thumbnailFile.name}`,
      contentType: args.thumbnailFile.type,
    }).then((r) => r.downloadUrl),
    uploadToStorage({
      file: args.videoFile,
      path: `videos/${args.ownerId}/${videoId}/${args.videoFile.name}`,
      contentType: args.videoFile.type,
    }).then((r) => r.downloadUrl),
  ])

  await setDoc(videoRef, {
    ownerId: args.ownerId,
    title: args.title,
    description: args.description,
    categoryId: args.categoryId,
    tags: args.tags,
    thumbnailUrl: thumbnail,
    videoUrl,
    durationSec: args.durationSec,
    views: 0,
    uploadedAt,
    visibility: args.visibility,
    createdAt: serverTimestamp(),
  })

  return videoId
}

