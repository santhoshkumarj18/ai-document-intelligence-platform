// src/components/queue/DocumentTable.jsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import StatusPill from '../common/StatusPill'
import ConfidenceIndicator from '../common/ConfidenceIndicator'
import ConfirmDialog from '../common/ConfirmDialog'
import { getOverallConfidence } from '../../utils/confidence'
import { useDocuments } from '../../context/DocumentsContext'

const STATUS_TO_PILL = {
  COMPLETE: 'complete',
  VALIDATED: 'complete',
  NEEDS_REVIEW: 'review',
  FAILED: 'error',
  EXTRACTED: 'review',
  UPLOADED: 'review',
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function DocumentTable({ documents, onRowClick }) {
  const { deleteDocument } = useDocuments()
  const [pendingDelete, setPendingDelete] = useState(null) // { id, filename }
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function handleDeleteClick(e, doc) {
    e.stopPropagation() // don't trigger the row's onRowClick navigation
    setDeleteError(null)
    setPendingDelete({ id: doc.id, filename: doc.filename })
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteDocument(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleCancelDelete() {
    setPendingDelete(null)
    setDeleteError(null)
  }

  return (
    <>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 px-4">Filename</th>
            <th className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 px-4">Type</th>
            <th className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 px-4">Status</th>
            <th className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 px-4">Confidence</th>
            <th className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 px-4">Uploaded</th>
            <th className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const confidence = getOverallConfidence(doc)
            return (
              <tr
                key={doc.id}
                onClick={() => onRowClick?.(doc.id)}
                className="border-b border-border hover:bg-surface-sunken cursor-pointer transition-colors"
              >
                <td className="font-ui text-body text-ink py-3 px-4">{doc.filename}</td>
                <td className="font-ui text-body text-ink-muted py-3 px-4 capitalize">{doc.documentType}</td>
                <td className="py-3 px-4">
                  <StatusPill status={STATUS_TO_PILL[doc.status]} label={doc.status.replace('_', ' ')} />
                </td>
                <td className="py-3 px-4">
                  {confidence !== null ? (
                    <span className="inline-flex items-center gap-2">
                      <ConfidenceIndicator confidence={confidence} size="sm" />
                      <span className="font-data text-data text-ink-muted">{confidence}%</span>
                    </span>
                  ) : (
                    <span className="font-ui text-body text-ink-faint">—</span>
                  )}
                </td>
                <td className="font-data text-data text-ink-muted py-3 px-4">{formatDate(doc.uploadedAt)}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => handleDeleteClick(e, doc)}
                    className="text-ink-faint hover:text-status-error transition-colors p-1"
                    aria-label={`Delete ${doc.filename}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {pendingDelete && (
        <ConfirmDialog
          message={`Delete "${pendingDelete.filename}"? This action will permanently delete the document and its associated data. This cannot be undone.${deleteError ? ` (${deleteError})` : ''}`}
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
          confirmDisabled={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  )
}

export default DocumentTable