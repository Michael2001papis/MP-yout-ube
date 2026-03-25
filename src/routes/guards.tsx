import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

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

export function RequireRole({
  allowed,
  children,
}: {
  allowed: AppRole[]
  children: React.ReactNode
}) {
  const { loading, user, role } = useAuth()

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />
  }

  if (!allowed.includes(role)) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}

