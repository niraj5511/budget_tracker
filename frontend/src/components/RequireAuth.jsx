import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps the routes that need a login; others are sent to /login,
// which sends them back here after they sign in.
export default function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (user) return <Outlet />
  return <Navigate to="/login" replace state={{ from: location }} />
}