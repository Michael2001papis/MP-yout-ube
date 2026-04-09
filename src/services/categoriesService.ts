import { collection, getDocs, orderBy, query } from 'firebase/firestore'

import { db, firebaseReady } from './firebase'
import type { Category } from '../types/Category'

const defaultCategories: Category[] = [
  { id: 'cat_music', name: 'Music', slug: 'music' },
  { id: 'cat_education', name: 'Education', slug: 'education' },
  { id: 'cat_gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'cat_sports', name: 'Sports', slug: 'sports' },
]

function mergeWithDefaultIds(items: Category[]): Category[] {
  const bySlug = new Map<string, Category>()

  for (const c of items) {
    const slug = c.slug.toLowerCase()
    const def = defaultCategories.find((d) => d.slug === slug)
    const next = def ? { id: def.id, name: c.name, slug: def.slug } : c
    if (!bySlug.has(slug)) {
      bySlug.set(slug, next)
    }
  }

  const merged: Category[] = [...bySlug.values()]
  for (const def of defaultCategories) {
    if (!bySlug.has(def.slug)) {
      merged.push(def)
    }
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchCategories(): Promise<Category[]> {
  if (!firebaseReady) return defaultCategories
  try {
    const q = query(collection(db, 'categories'), orderBy('name'))
    const snap = await getDocs(q)

    const items: Category[] = []
    snap.forEach((d) => {
      const data = d.data() as { name?: string; slug?: string }
      if (!data.name) return
      const slug = String(data.slug ?? d.id).toLowerCase()
      items.push({
        id: d.id,
        name: data.name,
        slug,
      })
    })

    if (items.length === 0) return defaultCategories
    return mergeWithDefaultIds(items)
  } catch {
    // If Firestore isn't configured yet, still allow UI to render.
    return defaultCategories
  }
}

