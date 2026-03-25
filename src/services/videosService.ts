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
  where,
  increment,
  type DocumentReference,
} from 'firebase/firestore'
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage'

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
  if (!firebaseReady) return []
  const whereClauses: any[] = [where('visibility', '==', 'public')]
  if (options?.categoryId) {
    whereClauses.push(where('categoryId', '==', options.categoryId))
  }
  return getVideosBase(whereClauses, options?.limitCount ?? 24)
}

export async function searchVideosLocally(options: {
  query: string
  categoryId?: string
  limitCount?: number
}): Promise<Video[]> {
  if (!firebaseReady) return []
  const q = options.query.trim().toLowerCase()
  if (!q) return fetchPublicVideos({ categoryId: options.categoryId, limitCount: options.limitCount ?? 24 })

  // Simple Phase 1 search: fetch a chunk of recent public videos, filter on client.
  const candidates = await fetchPublicVideos({ categoryId: options.categoryId, limitCount: (options.limitCount ?? 24) * 3 })

  const tokens = q.split(/\s+/g).filter(Boolean)
  return candidates.filter((v) => {
    const hay = `${v.title} ${v.description} ${v.tags.join(' ')}`.toLowerCase()
    return tokens.every((t) => hay.includes(t))
  })
}

export async function fetchVideoById(videoId: string): Promise<Video | null> {
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
  if (!firebaseReady) return
  const ref = doc(db, 'videos', videoId)
  await updateDoc(ref, { views: increment(1) })
}

export async function fetchRelatedVideos(options: {
  categoryId?: string
  excludeVideoId: string
  limitCount?: number
}): Promise<Video[]> {
  if (!firebaseReady) return []
  const max = options.limitCount ?? 8
  const clauses: any[] = [where('visibility', '==', 'public')]
  if (options.categoryId) clauses.push(where('categoryId', '==', options.categoryId))

  // Phase 1: take a candidate set and filter out the current video.
  const candidates = await getVideosBase(clauses, max * 2)
  return candidates.filter((v) => v.id !== options.excludeVideoId).slice(0, max)
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

