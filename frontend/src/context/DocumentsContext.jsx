// src/context/DocumentsContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import { useAuth } from './AuthContext'

const DocumentsContext = createContext(null)

export function DocumentsProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getDocuments()
      setDocuments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      refresh()
    } else {
      setDocuments([])
    }
  }, [isAuthenticated, refresh])

  function getDocumentById(id) {
    return documents.find((d) => d.id === id) || null
  }

  // Updates a document's status (approve/reject) and persists it to the
  // backend. This is the only kind of document update the app currently
  // performs outside of field edits, extraction, and type classification,
  // each of which has its own dedicated function below.
  async function updateDocument(id, { status }) {
    const updated = await api.updateStatus(id, {
      status,
      changedBy: user?.name || 'Unknown',
    })
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)))
  }

  async function updateField(documentId, fieldId, updates) {
    const updated = await api.updateField(documentId, fieldId, {
      value: updates.value,
      changedBy: user?.name || 'Unknown',
    })
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? updated : doc))
    )
  }

  // Extraction now runs asynchronously on the backend: the POST call
  // returns immediately once the document flips to EXTRACTING, then this
  // polls GET /documents/{id} every 2s until the status leaves EXTRACTING
  // (either VALIDATED/NEEDS_REVIEW on success, or EXTRACTION_FAILED).
  // Polling stops after 60s as a safety net against a stuck/lost job.
  async function extractDocument(id) {
    const started = await api.extractDocument(id)
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? started : doc)))

    const POLL_INTERVAL_MS = 2000
    const MAX_POLL_MS = 60000
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const poll = async () => {
        if (Date.now() - startTime > MAX_POLL_MS) {
          reject(new Error('Extraction is taking longer than expected. Refresh to check its status.'))
          return
        }
        try {
          const updated = await api.getDocument(id)
          setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)))
          if (updated.status === 'EXTRACTING') {
            setTimeout(poll, POLL_INTERVAL_MS)
          } else if (updated.status === 'EXTRACTION_FAILED') {
            reject(new Error('Extraction failed. Please try again.'))
          } else {
            resolve(updated)
          }
        } catch (err) {
          reject(err)
        }
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    })
  }

  async function classifyDocument(id, documentType) {
    const updated = await api.updateDocumentType(id, {
      documentType,
      changedBy: user?.name || 'Unknown',
    })
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)))
    return updated
  }

  // Permanently removes a document. Only updates local state after the
  // backend confirms deletion succeeded, so a failed delete leaves the
  // document visible rather than optimistically disappearing.
  async function deleteDocument(id) {
    await api.deleteDocument(id)
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  function getNextReviewableDocument(currentId) {
    const reviewable = documents.filter(
      (d) => d.status === 'VALIDATED' || d.status === 'NEEDS_REVIEW'
    )
    const others = reviewable.filter((d) => d.id !== currentId)
    if (others.length === 0) return null

    const currentIndex = documents.findIndex((d) => d.id === currentId)
    const after = documents.slice(currentIndex + 1).find((d) => others.includes(d))
    return after || others[0]
  }

  function getTodayReviewStats(justProcessedId) {
    const todayStr = new Date().toISOString().slice(0, 10)
    const uploadedToday = documents.filter((d) => d.uploadedAt?.slice(0, 10) === todayStr)
    const reviewed = uploadedToday.filter(
      (d) => d.status === 'COMPLETE' || d.status === 'FAILED' || d.id === justProcessedId
    ).length
    return { reviewed, total: uploadedToday.length }
  }

  const value = {
    documents,
    loading,
    error,
    refresh,
    getDocumentById,
    updateDocument,
    updateField,
    extractDocument,
    classifyDocument,
    deleteDocument,
    getNextReviewableDocument,
    getTodayReviewStats,
  }

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentsContext)
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider')
  }
  return context
}