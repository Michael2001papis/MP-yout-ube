import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  where,
  documentId,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'

import { db, firebaseReady } from './firebase'
import type { Video, VideoVisibility } from '../types/Video'

async function chunk<T>(arr: T[], size: number): Promise<T[][]> {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function toVideoVisibility(v: any): VideoVisibility {
  return (v === 'hidden' ? 'hidden' : 'public') as VideoVisibility
}

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
    visibility: toVideoVisibility(data.visibility),
  }
}

export async function isFavorite(args: { userId: string; videoId: string }): Promise<boolean> {
  if (!firebaseReady) return false
  const ref = doc(db, 'favorites', `${args.userId}_${args.videoId}`)
  const snap = await getDoc(ref)
  return snap.exists()
}

export async function addFavorite(args: { userId: string; videoId: string }) {
  if (!firebaseReady) return
  const ref = doc(db, 'favorites', `${args.userId}_${args.videoId}`)
  await setDoc(
    ref,
    { userId: args.userId, videoId: args.videoId, createdAt: serverTimestamp() },
    { merge: true },
  )
}

export async function removeFavorite(args: { userId: string; videoId: string }) {
  if (!firebaseReady) return
  const ref = doc(db, 'favorites', `${args.userId}_${args.videoId}`)
  await deleteDoc(ref)
}

export async function toggleFavorite(args: { userId: string; videoId: string }) {
  if (!firebaseReady) return
  const currently = await isFavorite({ userId: args.userId, videoId: args.videoId })
  if (currently) return removeFavorite(args)
  return addFavorite(args)
}

export async function fetchFavoriteVideoIds(userId: string, limitCount = 50): Promise<string[]> {
  if (!firebaseReady) return []
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  const ids: string[] = []
  snap.forEach((d) => ids.push(String((d.data() as any).videoId)))
  return ids
}

export async function fetchFavoriteVideos(userId: string, limitCount = 20): Promise<Video[]> {
  if (!firebaseReady) return []
  const ids = await fetchFavoriteVideoIds(userId, limitCount)
  if (ids.length === 0) return []

  // Fetch videos in chunks (Firestore `in` supports up to 10 items).
  const chunks = await chunk(ids, 10)
  const videos: Video[] = []

  for (const c of chunks) {
    const q = query(collection(db, 'videos'), where(documentId(), 'in', c))
    const snap = await getDocs(q)
    snap.forEach((d: QueryDocumentSnapshot) => {
      videos.push(mapVideoDoc(d.data(), d.id))
    })
  }

  // Keep original ordering by ids.
  const idx = new Map(ids.map((id, i) => [id, i]))
  videos.sort((a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0))
  return videos
}

