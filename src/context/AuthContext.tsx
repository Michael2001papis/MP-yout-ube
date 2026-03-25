import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

import { auth, db, firebaseReady } from '../services/firebase'
import type { AppRole } from '../types/role'
import type { UserProfile } from '../types/UserProfile'

type AuthContextValue = {
  loading: boolean
  firebaseReady: boolean
  user: UserProfile | null
  role: AppRole
  blocked: boolean
  error: string | null
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function errorToMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Something went wrong. Please try again.'
}

function getAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function mapFirebaseUserToProfile(fbUser: FirebaseUser, role: AppRole, blocked: boolean): UserProfile {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
    photoURL: fbUser.photoURL ?? null,
    role,
    blocked,
    createdAt: null,
  }
}

async function ensureUserDoc(fbUser: FirebaseUser): Promise<UserProfile> {
  const ref = doc(db, 'users', fbUser.uid)
  const snap = await getDoc(ref)

  const adminEmails = getAdminEmails()
  const isAdmin = !!fbUser.email && adminEmails.includes(fbUser.email.toLowerCase())

  if (snap.exists()) {
    const data = snap.data() as {
      email?: string
      name?: string
      photoURL?: string | null
      role?: AppRole
      blocked?: boolean
      createdAt?: { toMillis?: () => number } | null
    }

    const role = (data.role ?? (isAdmin ? 'admin' : 'user')) as AppRole
    const blocked = !!data.blocked

    return {
      uid: fbUser.uid,
      email: data.email ?? fbUser.email ?? null,
      name: data.name ?? fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
      photoURL: data.photoURL ?? fbUser.photoURL ?? null,
      role,
      blocked,
      createdAt: data.createdAt?.toMillis?.() ?? null,
    }
  }

  const role: AppRole = isAdmin ? 'admin' : 'user'

  const profile = mapFirebaseUserToProfile(fbUser, role, false)
  await setDoc(ref, {
    email: fbUser.email ?? null,
    name: profile.name,
    photoURL: profile.photoURL,
    role,
    blocked: false,
    createdAt: serverTimestamp(),
  })

  return {
    ...profile,
    createdAt: null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [role, setRole] = useState<AppRole>('guest')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    if (!firebaseReady) {
      setError('Firebase is not configured yet. Add VITE_FIREBASE_* env vars to your .env file.')
      setUser(null)
      setRole('guest')
      setBlocked(false)
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setError(null)

        if (!fbUser) {
          setUser(null)
          setBlocked(false)
          setRole('guest')
          setLoading(false)
          return
        }

        const profile = await ensureUserDoc(fbUser)

        if (profile.blocked) {
          setUser(null)
          setBlocked(true)
          setRole('guest')
          setError('Your account is blocked. Please contact support.')
          await signOut(auth)
          setLoading(false)
          return
        }

        setUser(profile)
        setBlocked(false)
        setRole(profile.role)
        setLoading(false)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Auth] Failed to initialize user session', e)
        setError(errorToMessage(e))
        setUser(null)
        setRole('guest')
        setBlocked(false)
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      firebaseReady,
      user,
      role,
      blocked,
      error,
      loginWithEmail: async (email: string, password: string) => {
        setError(null)
        try {
          await signInWithEmailAndPassword(auth, email, password)
        } catch (e) {
          const msg = errorToMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] loginWithEmail failed', e)
          throw e
        }
      },
      registerWithEmail: async (email: string, password: string, name: string) => {
        setError(null)
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          // Sync displayName for nicer profile defaults.
          if (name && cred.user) {
            await updateProfile(cred.user, { displayName: name })
          }
        } catch (e) {
          const msg = errorToMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] registerWithEmail failed', e)
          throw e
        }
      },
      loginWithGoogle: async () => {
        setError(null)
        try {
          const provider = new GoogleAuthProvider()
          await signInWithPopup(auth, provider)
        } catch (e) {
          const msg = errorToMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] loginWithGoogle failed', e)
          throw e
        }
      },
      resetPassword: async (email: string) => {
        setError(null)
        try {
          await sendPasswordResetEmail(auth, email)
        } catch (e) {
          const msg = errorToMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] resetPassword failed', e)
          throw e
        }
      },
      logout: async () => {
        setError(null)
        try {
          await signOut(auth)
        } catch (e) {
          const msg = errorToMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] logout failed', e)
          throw e
        }
      },
    }),
    [blocked, error, loading, role, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

