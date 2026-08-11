// src/pages/DocumentDetailPage.jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDocuments } from '../context/DocumentsContext'
import StatusPill from '../components/common/StatusPill'
import SplitView from '../components/detail/SplitView'
import ConfirmDialog from '../components/common/ConfirmDialog'

const STATUS_TO_PILL = {
  COMPLETE: 'complete',
  VALIDATED: 'complete',
  NEEDS_REVIEW: 'review',
  FAILED: 'error',
  EXTRACTED: 'review',
  UPLOADED: 'review',
}

function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getDocumentById,
    updateField,
    updateDocument,
    extractDocument,
    getNextReviewableDocument,
    getTodayReviewStats,
  } = useDocuments()
  const document = getDocumentById(id)

  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [isConfirming, setIsConfirming] = useState(false)
  // { action: 'approve' | 'reject', message, nextDoc }
  const [pendingAction, setPendingAction] = useState(null)

  if (!document) {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <p className="font-ui text-body text-ink">Document not found.</p>
        <Link to="/" className="font-ui text-body text-accent hover:underline">← Back to queue</Link>
      </div>
    )
  }

  const canApprove = !document.extractedFields.some((f) => f.validationFailed)

  function handleFieldSave(fieldId, newValue) {
    updateField(document.id, fieldId, {
      value: newValue,
      confidence: 100,
      validationFailed: false,
      validationMessage: null,
    })
  }

  // Opens the confirmation dialog only — no backend call yet, so the
  // document (and its fields) remain fully editable until the user
  // explicitly confirms inside the dialog.
  function openConfirm(action) {
    const stats = getTodayReviewStats(document.id) // includes +1 for this doc via justProcessedId
    const nextDoc = getNextReviewableDocument(document.id)
    const label = action === 'approve' ? 'Approve this document?' : 'Reject this document?'
    setPendingAction({
      action,
      message: `${label} This will count as ${stats.reviewed}/${stats.total} reviewed today.`,
      nextDoc,
    })
  }

  async function handleConfirm() {
    if (!pendingAction) return
    setIsConfirming(true)
    try {
      const status = pendingAction.action === 'approve' ? 'COMPLETE' : 'FAILED'
      await updateDocument(document.id, { status, updatedAt: new Date().toISOString() })
      const nextDoc = pendingAction.nextDoc
      setPendingAction(null)
      if (nextDoc) {
        navigate(`/documents/${nextDoc.id}`)
      } else {
        navigate('/')
      }
    } finally {
      setIsConfirming(false)
    }
  }

  function handleCancel() {
    // Nothing was persisted — document and fields are untouched.
    setPendingAction(null)
  }

  async function handleExtract() {
    setIsExtracting(true)
    setExtractError(null)
    try {
      await extractDocument(document.id)
    } catch (err) {
      setExtractError(err.message || 'Extraction failed')
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="flex items-center justify-between mb-4">
        <p className="font-ui text-body text-ink-faint">
          <Link to="/" className="text-accent hover:underline">Documents</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{document.filename}</span>
        </p>
        <Link to="/" className="font-ui text-body text-accent hover:underline">← Back to queue</Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          {document.filename}
        </h1>
        <StatusPill status={STATUS_TO_PILL[document.status]} label={document.status.replace('_', ' ')} />
      </div>

      <SplitView
        document={document}
        onFieldSave={handleFieldSave}
        onApprove={() => openConfirm('approve')}
        onReject={() => openConfirm('reject')}
        canApprove={canApprove}
        onExtract={handleExtract}
        isExtracting={isExtracting}
        extractError={extractError}
        isApproving={false}
        isRejecting={false}
      />

      {pendingAction && (
        <ConfirmDialog
          message={pendingAction.message}
          nextDocLabel={pendingAction.nextDoc?.filename}
          confirmLabel={isConfirming ? 'Working…' : (pendingAction.action === 'approve' ? 'Approve' : 'Reject')}
          confirmDisabled={isConfirming}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default DocumentDetailPage