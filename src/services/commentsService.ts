import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db, firebaseReady } from './firebase'

import type { Comment } from '../types/Comment'

function toNumberTimestamp(ts: any): number {
  if (!ts) return 0
  if (typeof ts === 'number') return ts
  if (typeof ts?.toMillis === 'function') return ts.toMillis()
  return 0
}

type CommentWithAuthor = Comment & { authorName: string; authorPhotoURL: string | null }

export async function fetchComments(videoId: string, limitCount = 50): Promise<CommentWithAuthor[]> {
  if (!firebaseReady) return []

  const q = query(
    collection(db, 'comments'),
    where('videoId', '==', videoId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  )

  const snap = await getDocs(q)
  const comments: Comment[] = []
  const authorIds = new Set<string>()

  snap.forEach((d) => {
    const data = d.data() as any
    const c: Comment = {
      id: d.id,
      videoId: String(data.videoId),
      userId: String(data.userId),
      text: String(data.text ?? ''),
      createdAt: toNumberTimestamp(data.createdAt),
    }
    comments.push(c)
    authorIds.add(c.userId)
  })

  // In demo mode, fetch author info sequentially (keeps code simple).
  const authorMap = new Map<string, { authorName: string; authorPhotoURL: string | null }>()
  for (const uid of authorIds) {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    const userData = userSnap.exists() ? (userSnap.data() as any) : null
    authorMap.set(uid, {
      authorName: userData?.name ? String(userData.name) : uid,
      authorPhotoURL: userData?.photoURL ? String(userData.photoURL) : null,
    })
  }

  return comments.map((c) => ({
    ...c,
    authorName: authorMap.get(c.userId)?.authorName ?? c.userId,
    authorPhotoURL: authorMap.get(c.userId)?.authorPhotoURL ?? null,
  }))
}

export async function addComment(args: { videoId: string; userId: string; text: string }) {
  if (!firebaseReady) throw new Error('Firebase is not configured')

  // Use auto-id.
  await setDoc(doc(collection(db, 'comments')), {
    videoId: args.videoId,
    userId: args.userId,
    text: args.text,
    createdAt: serverTimestamp(),
  })
}

export async function deleteComment(args: { commentId: string; userId: string }) {
  if (!firebaseReady) return
  const ref = doc(db, 'comments', args.commentId)
  await deleteDoc(ref)
}

