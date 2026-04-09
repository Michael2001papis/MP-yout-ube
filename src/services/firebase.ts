/*
 * © 2026 Michael Papismedov – MP
 * All rights reserved.
 *
 * This code is proprietary and protected.
 * Unauthorized use, distribution, or modification is strictly prohibited.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

function getEnv(name: (typeof required)[number]) {
  const val = import.meta.env[name]
  return typeof val === 'string' ? val : ''
}

const firebaseEnv = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
}

const missing: string[] = []
if (!firebaseEnv.apiKey) missing.push('VITE_FIREBASE_API_KEY')
if (!firebaseEnv.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN')
if (!firebaseEnv.projectId) missing.push('VITE_FIREBASE_PROJECT_ID')
if (!firebaseEnv.storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET')
if (!firebaseEnv.messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID')
if (!firebaseEnv.appId) missing.push('VITE_FIREBASE_APP_ID')

// If config isn't provided yet, fail fast with a clear message.
export const firebaseReady = missing.length === 0

export const missingFirebaseEnv = missing

if (!firebaseReady) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Firebase] Missing env vars. Create a .env with VITE_FIREBASE_* values before using auth/features.',
    missing,
  )
}

let app: FirebaseApp | null = null
if (firebaseReady) {
  app = initializeApp(firebaseEnv)
}

export const auth = app ? getAuth(app) : (null as any)
export const db = app ? getFirestore(app) : (null as any)
export const storage = app ? getStorage(app) : (null as any)

export default app

