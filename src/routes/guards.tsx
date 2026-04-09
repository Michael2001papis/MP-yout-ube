import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

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
