import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps the routes that need a login. Someone opening the bare address sees
// the welcome page; anyone opening a deeper link goes to the login form, which
// sends them back there after they sign in.
export default function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (user) return <Outlet />
  const target = location.pathname === '/' ? '/welcome' : '/login'
  return <Navigate to={target} replace state={{ from: location }} />
}