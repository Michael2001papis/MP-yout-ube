import { collection, getDocs, orderBy, query } from 'firebase/firestore'

import { db, firebaseReady } from './firebase'
import type { Category } from '../types/Category'

const defaultCategories: Category[] = [
  { id: 'cat_music', name: 'Music', slug: 'music' },
  { id: 'cat_education', name: 'Education', slug: 'education' },
  { id: 'cat_gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'cat_sports', name: 'Sports', slug: 'sports' },
]

export async function fetchCategories(): Promise<Category[]> {
  if (!firebaseReady) return defaultCategories
  try {
    const q = query(collection(db, 'categories'), orderBy('name'))
    const snap = await getDocs(q)

    const items: Category[] = []
    snap.forEach((d) => {
      const data = d.data() as { name?: string; slug?: string }
      if (!data.name) return
      items.push({
        id: d.id,
        name: data.name,
        slug: data.slug ?? d.id,
      })
    })

    return items.length > 0 ? items : defaultCategories
  } catch {
    // If Firestore isn't configured yet, still allow UI to render.
    return defaultCategories
  }
}

