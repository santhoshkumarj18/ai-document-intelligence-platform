// src/services/api.js

const API_BASE_URL = 'http://localhost:8080/api'

let authToken = null
let onUnauthorized = null

export function setAuthToken(token) {
  authToken = token
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    if (onUnauthorized) onUnauthorized()
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

// ---- Auth ----

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

// ---- Documents ----

export function getDocuments() {
  return request('/documents')
}

export function updateField(documentId, fieldId, { value, changedBy }) {
  return request(`/documents/${documentId}/fields/${fieldId}`, {
    method: 'PATCH',
    body: JSON.stringify({ value, changedBy }),
  })
}

export function updateStatus(documentId, { status, changedBy }) {
  return request(`/documents/${documentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, changedBy }),
  })
}