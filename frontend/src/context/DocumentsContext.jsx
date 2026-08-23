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

  async function extractDocument(id) {
    const updated = await api.extractDocument(id)
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)))
    return updated
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
    addDocument,
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