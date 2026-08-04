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

  const value = {
    documents,
    loading,
    error,
    refresh,
    getDocumentById,
    addDocument,
    updateDocument,
    updateField,
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