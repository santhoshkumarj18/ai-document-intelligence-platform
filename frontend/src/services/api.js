// src/services/api.js

const API_BASE_URL = 'http://localhost:8080/api'
const ORIGIN = 'http://localhost:8080'

let authToken = null
let onUnauthorized = null

export function setAuthToken(token) {
  authToken = token
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

export function uploadDocument(file, documentType) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)
  return request('/documents/upload', {
    method: 'POST',
    body: formData,
  })
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

export function extractDocument(documentId) {
  return request(`/documents/${documentId}/extract`, {
    method: 'POST',
  })
}

// ---- Files ----
// Files come back from the backend behind the JWT filter, same as everything
// else — so they can't be loaded with a plain <img src="..."> the way mock
// picsum.photos URLs could. This fetches bytes manually with the
// Authorization header attached, then hands back a Blob the caller turns
// into an object URL.

export function isProtectedFileUrl(url) {
  return typeof url === 'string' && url.startsWith('/api/')
}

export async function fetchFileBlob(relativeUrl) {
  const headers = {}
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${ORIGIN}${relativeUrl}`, { headers })

  if (response.status === 401) {
    if (onUnauthorized) onUnauthorized()
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error(`Failed to load file: ${response.status}`)
  }

  return response.blob()
}