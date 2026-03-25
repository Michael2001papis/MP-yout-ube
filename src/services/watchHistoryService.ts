import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  documentId,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'

import { db, firebaseReady } from './firebase'
import type { Video } from '../types/Video'

function mapVideoDoc(data: any, id: string): Video {
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
    durationSec: typeof data.durationSec === 'number' ? data.durationSec : 0,
    views: typeof data.views === 'number' ? data.views : 0,
    uploadedAt: typeof data.uploadedAt === 'number' ? data.uploadedAt : 0,
    visibility: (data.visibility === 'hidden' ? 'hidden' : 'public') as 'public' | 'hidden',
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function upsertWatchHistory(args: { userId: string; videoId: string }) {
  if (!firebaseReady) return
  const ref = doc(db, 'watchHistory', `${args.userId}_${args.videoId}`)
  await setDoc(
    ref,
    { userId: args.userId, videoId: args.videoId, watchedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function fetchWatchHistoryVideos(userId: string, limitCount = 20): Promise<Video[]> {
  if (!firebaseReady) return []

  const q = query(
    collection(db, 'watchHistory'),
    where('userId', '==', userId),
    orderBy('watchedAt', 'desc'),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  const ids: string[] = []
  snap.forEach((d) => ids.push(String((d.data() as any).videoId)))
  if (ids.length === 0) return []

  const chunks = chunk(ids, 10)
  const videos: Video[] = []

  for (const c of chunks) {
    const q2 = query(collection(db, 'videos'), where(documentId(), 'in', c))
    const snap2 = await getDocs(q2)
    snap2.forEach((d: QueryDocumentSnapshot) => {
      videos.push(mapVideoDoc(d.data(), d.id))
    })
  }

  const idx = new Map(ids.map((id, i) => [id, i]))
  videos.sort((a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0))
  return videos
}

