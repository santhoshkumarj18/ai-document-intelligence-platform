// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    api.setAuthToken(null)
  }, [])

  // Lets api.js force a logout on ANY 401 — not just a bad login attempt,
  // but also a token that expires mid-session (24h from your jwt.expiration-ms).
  useEffect(() => {
    api.setUnauthorizedHandler(logout)
  }, [logout])

  async function login(email, password) {
    const { token, user } = await api.login(email, password)
    setToken(token)
    setUser(user)
    api.setAuthToken(token)
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}