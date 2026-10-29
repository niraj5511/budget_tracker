import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  clearToken,
  getToken,
  loginRequest,
  registerRequest,
  setToken,
  setUnauthorizedHandler,
} from '../utils/api'

const USER_KEY = 'budget-tracker:user'

function loadUser() {
  try {
    if (!getToken()) return null
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const logout = useCallback(() => {
    clearToken()
    try {
      localStorage.removeItem(USER_KEY)
    } catch {
      /* nothing to remove */
    }
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const login = useCallback(async (email, password) => {
    const { token, user: nextUser } = await loginRequest(email, password)
    setToken(token)
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    } catch {
      /* the session lasts until reload */
    }
    setUser(nextUser)
  }, [])

  const register = useCallback(
    async (email, password) => {
      await registerRequest(email, password)
      await login(email, password)
    },
    [login],
  )

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}