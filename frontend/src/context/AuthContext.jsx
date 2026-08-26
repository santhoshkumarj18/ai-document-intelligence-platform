// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'dociq_auth'

function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredSession(token, user) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
  } catch {
    // safe degrade — session just won't survive a reload
  }
}

function clearStoredSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}

// Read and apply any stored session BEFORE the component tree even renders,
// not inside a useEffect. This matters because DocumentsProvider is a CHILD
// of AuthProvider (see main.jsx), and React fires child effects before
// parent effects — so if the token were only applied to api.js inside
// AuthProvider's own useEffect, DocumentsContext's refresh() would already
// have fired its GET /documents request with no Authorization header,
// causing a 401 and an incorrect logout on every reload.
const restored = readStoredSession()
if (restored?.token) {
  api.setAuthToken(restored.token)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(restored?.token ?? null)
  const [user, setUser] = useState(restored?.user ?? null)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    api.setAuthToken(null)
    clearStoredSession()
  }, [])

  useEffect(() => {
    api.setUnauthorizedHandler(logout)
  }, [logout])

  async function login(email, password) {
    const { token, user } = await api.login(email, password)
    setToken(token)
    setUser(user)
    api.setAuthToken(token)
    writeStoredSession(token, user)
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