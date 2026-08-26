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
export function getDocument(documentId) {
  return request(`/documents/${documentId}`)
}
// Uses XMLHttpRequest instead of fetch specifically because fetch has no
// upload-progress event — xhr.upload.onprogress is the only way to report
// real bytes-sent percentage during the request body being sent, which is
// what the upload UI's "Uploading… X%" now reflects. Every other API call
// stays on fetch via request(); this is the one deliberate exception.
//
// options: { onProgress?: (percent: number) => void, signal?: AbortSignal }
export function uploadDocument(file, documentType, options = {}) {
  const { onProgress, signal } = options

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/documents/upload`)

    if (authToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        if (onUnauthorized) onUnauthorized()
        reject(new Error('Unauthorized'))
        return
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null)
        } catch {
          resolve(null)
        }
        return
      }

      let message = `Request failed: ${xhr.status}`
      try {
        const body = JSON.parse(xhr.responseText)
        if (body?.message) message = body.message
      } catch {
        // response wasn't JSON — keep the generic message
      }
      reject(new Error(message))
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))

    xhr.onabort = () => {
      const err = new Error('Upload cancelled')
      err.name = 'AbortError' // matches the name QueuePage already checks for
      reject(err)
    }

    if (signal) {
      if (signal.aborted) {
        xhr.abort()
      } else {
        signal.addEventListener('abort', () => xhr.abort())
      }
    }

    xhr.send(formData)
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

export function updateDocumentType(documentId, { documentType, changedBy }) {
  return request(`/documents/${documentId}/type`, {
    method: 'PATCH',
    body: JSON.stringify({ documentType, changedBy }),
  })
}

export function deleteDocument(documentId) {
  return request(`/documents/${documentId}`, {
    method: 'DELETE',
  })
}

// ---- Files ----

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