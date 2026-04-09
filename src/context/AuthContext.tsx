/*
 * © 2026 Michael Papismedov – MP
 * All rights reserved.
 *
 * This code is proprietary and protected.
 * Unauthorized use, distribution, or modification is strictly prohibited.
 */

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

function assertFirebaseConfigured(): void {
  if (!firebaseReady) {
    throw new Error('Firebase is not configured.')
  }
}

function errorToMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Something went wrong. Please try again.'
}

/** Firebase Auth uses `code` on error objects; map to clearer UX copy. */
function firebaseAuthErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = String((e as { code?: string }).code)
    switch (code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Try again if you want to continue with Google.'
      case 'auth/popup-blocked':
        return 'The browser blocked the Google popup. Allow popups for this site and try again.'
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.'
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method.'
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for OAuth. Add it under Firebase Console → Authentication → Settings → Authorized domains.'
      default:
        break
    }
  }
  return errorToMessage(e)
}

function normalizeMemberRole(stored: unknown): AppRole {
  if (stored === 'guest') return 'guest'
  return 'user'
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

  if (snap.exists()) {
    const data = snap.data() as {
      email?: string
      name?: string
      photoURL?: string | null
      role?: string
      blocked?: boolean
      createdAt?: { toMillis?: () => number } | null
    }

    const role = normalizeMemberRole(data.role ?? 'user')
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

  const role: AppRole = 'user'

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
      // Missing env: do not set global `error` — Layout would show a red banner on every page.
      // AuthPage explains setup when the user opens /auth.
      setError(null)
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
        assertFirebaseConfigured()
        setError(null)
        try {
          await signInWithEmailAndPassword(auth, email, password)
        } catch (e) {
          const msg = firebaseAuthErrorMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] loginWithEmail failed', e)
          throw e
        }
      },
      registerWithEmail: async (email: string, password: string, name: string) => {
        assertFirebaseConfigured()
        setError(null)
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          // Sync displayName for nicer profile defaults.
          if (name && cred.user) {
            await updateProfile(cred.user, { displayName: name })
          }
        } catch (e) {
          const msg = firebaseAuthErrorMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] registerWithEmail failed', e)
          throw e
        }
      },
      loginWithGoogle: async () => {
        assertFirebaseConfigured()
        setError(null)
        try {
          const provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: 'select_account' })
          await signInWithPopup(auth, provider)
        } catch (e) {
          const msg = firebaseAuthErrorMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] loginWithGoogle failed', e)
          throw e
        }
      },
      resetPassword: async (email: string) => {
        assertFirebaseConfigured()
        setError(null)
        try {
          await sendPasswordResetEmail(auth, email)
        } catch (e) {
          const msg = firebaseAuthErrorMessage(e)
          setError(msg)
          // eslint-disable-next-line no-console
          console.error('[Auth] resetPassword failed', e)
          throw e
        }
      },
      logout: async () => {
        assertFirebaseConfigured()
        setError(null)
        try {
          await signOut(auth)
        } catch (e) {
          const msg = firebaseAuthErrorMessage(e)
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

