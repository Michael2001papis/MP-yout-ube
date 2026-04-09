import React from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import type { AppRole } from '../types/role'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/auth?mode=login"
        replace
        state={{ from: location.pathname, reason: 'auth_required' }}
      />
    )
  }

  return <>{children}</>
}

// SECURITY: Role checks here are client-side only (SPA). Real authorization for admin APIs and
// Firestore writes must be enforced with Firebase Security Rules (and/or Cloud Functions), not here.

export function RequireRole({
  allowed,
  children,
}: {
  allowed: AppRole[]
  children: React.ReactNode
}) {
  const { loading, user, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/auth?mode=login"
        replace
        state={{ from: location.pathname, reason: 'role_required' }}
      />
    )
  }

  if (!allowed.includes(role)) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This area is restricted to authorized staff. Your current account does not have the required role.
        </p>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Route checks here are for user experience only. Production deployments must enforce access with Firebase
          Security Rules (or trusted backend APIs).
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
            Back to home
          </Link>
          <Link to="/admin-access" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
            Staff sign-in information
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

