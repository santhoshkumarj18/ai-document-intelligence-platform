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

  // Not wired to the backend yet — real upload (multipart + storage) is
  // still a pending item. Stays local-only rather than creating
  // half-real documents server-side with no actual file behind them.
  function addDocument(newDoc) {
    setDocuments((prev) => [newDoc, ...prev])
  }

  async function updateDocument(id, updates) {
    if (updates.status) {
      const updated = await api.updateStatus(id, {
        status: updates.status,
        changedBy: user?.name || 'Unknown',
      })
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)))
      return
    }

    // No general-purpose document PATCH exists on the backend yet.
    // Anything other than a status change stays local-only for now.
    console.warn('updateDocument: only status changes persist to the backend currently')
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    )
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

  // Triggers the backend Gemini extraction pipeline for a document, then
  // replaces the local copy with the backend's response (which comes back
  // with populated summary/extractedFields and an advanced status —
  // VALIDATED or NEEDS_REVIEW).
  async function extractDocument(id) {
    const updated = await api.extractDocument(id)
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)))
    return updated
  }

  // Finds the next document still awaiting a review decision, following the
  // same order shown in the Queue table. Wraps to the start of the list if
  // nothing reviewable comes after the current document. Returns null if no
  // other reviewable document exists.
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

  // Approximate "reviewed today" stat for the post-approval toast. There is
  // no dedicated reviewedAt timestamp on Document, so this counts documents
  // uploaded today that are now COMPLETE/FAILED, out of all documents
  // uploaded today. justProcessedId lets the caller count the document that
  // was just approved/rejected even before the state update above has
  // re-rendered this context (avoids an off-by-one from React's async
  // state timing).
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
    addDocument,
    updateDocument,
    updateField,
    extractDocument,
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