// src/pages/DocumentDetailPage.jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDocuments } from '../context/DocumentsContext'
import { useToast } from '../components/common/Toast'
import StatusPill from '../components/common/StatusPill'
import SplitView from '../components/detail/SplitView'

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
  const { showToast } = useToast()
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
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

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

  function advanceToNext() {
    const next = getNextReviewableDocument(document.id)
    if (next) {
      navigate(`/documents/${next.id}`)
    } else {
      navigate('/')
    }
  }

  async function handleApprove() {
    setIsApproving(true)
    try {
      await updateDocument(document.id, { status: 'COMPLETE', updatedAt: new Date().toISOString() })
      const stats = getTodayReviewStats(document.id)
      showToast(`Document approved · ${stats.reviewed}/${stats.total} reviewed today`)
      advanceToNext()
    } finally {
      setIsApproving(false)
    }
  }

  async function handleReject() {
    setIsRejecting(true)
    try {
      await updateDocument(document.id, { status: 'FAILED', updatedAt: new Date().toISOString() })
      const stats = getTodayReviewStats(document.id)
      showToast(`Document rejected · ${stats.reviewed}/${stats.total} reviewed today`)
      advanceToNext()
    } finally {
      setIsRejecting(false)
    }
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
        onApprove={handleApprove}
        onReject={handleReject}
        canApprove={canApprove}
        onExtract={handleExtract}
        isExtracting={isExtracting}
        extractError={extractError}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />
    </div>
  )
}

export default DocumentDetailPage