import { createContext, useState, useEffect, useCallback } from 'react'
import { loginRequest, registerRequest, fetchCurrentUser, logoutLocal } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrateUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      // NOTE: this hits the real FastAPI backend. Until the backend is
      // running and connected to MySQL, this call will fail silently
      // and the app falls back to the logged-out state.
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    } catch (err) {
      logoutLocal()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrateUser()
  }, [hydrateUser])

  const login = async (email, password) => {
    const tokens = await loginRequest(email, password)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const currentUser = await fetchCurrentUser()
    setUser(currentUser)
    return currentUser
  }

  const register = async (payload) => {
    return registerRequest(payload)
  }

  const logout = () => {
    logoutLocal()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
