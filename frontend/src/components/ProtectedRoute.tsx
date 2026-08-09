import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "../context/useAuth"

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute