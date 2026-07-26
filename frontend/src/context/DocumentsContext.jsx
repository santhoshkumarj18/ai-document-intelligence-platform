// src/context/DocumentsContext.jsx
import { createContext, useContext, useState } from 'react'
import { mockDocuments as initialDocuments } from '../mock/mockDocuments'

const DocumentsContext = createContext(null)

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState(initialDocuments)

  function getDocumentById(id) {
    return documents.find((d) => d.id === id) || null
  }

  function addDocument(newDoc) {
    setDocuments((prev) => [newDoc, ...prev])
  }

  function updateDocument(id, updates) {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    )
  }

  function updateField(documentId, fieldId, updates) {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentId) return doc
        return {
          ...doc,
          extractedFields: doc.extractedFields.map((f) =>
            f.id === fieldId ? { ...f, ...updates } : f
          ),
        }
      })
    )
  }

  const value = { documents, getDocumentById, addDocument, updateDocument, updateField }

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