// src/pages/QueuePage.jsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import DocumentTable from '../components/queue/DocumentTable'
import FilterBar from '../components/queue/FilterBar'
import DropZone from '../components/upload/DropZone'
import UploadProgress from '../components/upload/UploadProgress'
import Button from '../components/common/Button'
import { useDocuments } from '../context/DocumentsContext'
import * as api from '../services/api'

const DEFAULT_FILTERS = { search: '', type: '', status: '', dateFrom: '', dateTo: '' }
const DOCUMENT_TYPES = ['INVOICE', 'RECEIPT', 'CONTRACT', 'IDENTITY', 'RESUME', 'CERTIFICATE']
const AUTO_OPEN_DELAY_MS = 1200

function QueuePage() {
  const navigate = useNavigate()
  const { documents, refresh } = useDocuments()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [documentType, setDocumentType] = useState('UNCLASSIFIED')
  const [uploads, setUploads] = useState([])
  const queueRef = useRef(null)

  const phase = uploads.length === 0
    ? 'idle'
    : uploads.every((u) => u.status !== 'uploading')
      ? 'summary'
      : 'uploading'

  const successCount = uploads.filter((u) => u.status === 'success').length
  const failedCount = uploads.filter((u) => u.status === 'failed').length
  const cancelledCount = uploads.filter((u) => u.status === 'cancelled').length

  // Single-file, single-success uploads skip the summary screen and open
  // the document directly — the common case doesn't need an extra click
  // through "View all in queue". Multi-file batches, or any failure/
  // cancellation, still land on the summary so the user can see what
  // happened to each file before deciding where to go.
  const isSingleSuccess = uploads.length === 1 && uploads[0]?.status === 'success'

  useEffect(() => {
    if (phase === 'summary' && isSingleSuccess) {
      const timer = setTimeout(() => {
        navigate(`/documents/${uploads[0].documentId}`)
      }, AUTO_OPEN_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [phase, isSingleSuccess, uploads, navigate])

  function handleFilesSelected(files) {
    files.forEach((file) => uploadOne(file))
  }

  async function uploadOne(file) {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const controller = new AbortController()
    const sizeLabel = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`

    setUploads((prev) => [
      ...prev,
      { id, filename: file.name, sizeLabel, percent: 0, status: 'uploading', controller, documentId: null },
    ])

    function handleProgress(percent) {
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, percent } : u)))
    }

    try {
      const saved = await api.uploadDocument(file, documentType, { onProgress: handleProgress, signal: controller.signal })
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, percent: 100, status: 'success', documentId: saved?.id } : u))
      )
      await refresh()
    } catch (err) {
      if (err.name === 'AbortError') {
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'cancelled' } : u)))
      } else {
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'failed' } : u)))
        console.error(`Upload failed for ${file.name}:`, err.message)
      }
    }
  }

  function handleCancelOne(id) {
    uploads.find((u) => u.id === id)?.controller?.abort()
  }

  function handleCancelAll() {
    uploads.filter((u) => u.status === 'uploading').forEach((u) => u.controller.abort())
  }

  function handleUploadMore() {
    setUploads([])
  }

  function handleViewAll() {
    setUploads([])
    queueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleOpenNow() {
    if (uploads[0]?.documentId) {
      navigate(`/documents/${uploads[0].documentId}`)
    }
  }

  function handleStayHere() {
    // Cancels the pending auto-navigation by clearing uploads, which also
    // resets the section back to idle — equivalent to "Upload more files".
    setUploads([])
  }

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (filters.search && !doc.filename.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.type && doc.documentType !== filters.type) return false
      if (filters.status && doc.status !== filters.status) return false
      if (filters.dateFrom && doc.uploadedAt.slice(0, 10) < filters.dateFrom) return false
      if (filters.dateTo && doc.uploadedAt.slice(0, 10) > filters.dateTo) return false
      return true
    })
  }, [documents, filters])

  return (
    <div>
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Documents
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        Upload documents to extract data and automate your workflow.
      </p>

      <div className="bg-surface border border-border rounded-md p-6 mb-8">
        {phase === 'idle' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <UploadCloud size={18} className="text-ink-muted" />
              <h2 className="font-ui text-subheading text-ink">Upload Documents</h2>
            </div>

            <div className="mb-4 max-w-xs">
              <label className="block font-ui text-[12px] font-medium text-ink-muted mb-1">
                Document type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 font-ui text-body text-ink"
              >
                <option value="UNCLASSIFIED">All type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="font-ui text-[12px] text-ink-faint mt-1">
                Mixing document types in one batch? Keep "All type" selected and classify each file after upload.
              </p>
            </div>

            <DropZone onFilesSelected={handleFilesSelected} />
          </>
        )}

        {phase === 'uploading' && (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-ui text-body text-ink font-medium">
                  Uploading {uploads.length} file{uploads.length !== 1 ? 's' : ''}...
                </p>
                <p className="font-ui text-[12px] text-ink-faint">
                  Please don't close or refresh this page.
                </p>
              </div>
              <button
                onClick={handleCancelAll}
                className="font-ui text-[12px] text-status-error hover:underline whitespace-nowrap"
              >
                Cancel All
              </button>
            </div>
            <div className="space-y-3">
              {uploads.map((u) => (
                <UploadProgress
                  key={u.id}
                  filename={u.filename}
                  sizeLabel={u.sizeLabel}
                  percent={u.percent}
                  status={u.status}
                  onCancel={() => handleCancelOne(u.id)}
                />
              ))}
            </div>
          </>
        )}

        {phase === 'summary' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={18} className="text-status-complete" />
              <p className="font-ui text-body text-ink font-medium">
                {successCount} file{successCount !== 1 ? 's' : ''} uploaded successfully
                {failedCount > 0 && `, ${failedCount} failed`}
                {cancelledCount > 0 && `, ${cancelledCount} cancelled`}
              </p>
            </div>
            <div className="space-y-3 my-4">
              {uploads.map((u) => (
                <UploadProgress
                  key={u.id}
                  filename={u.filename}
                  sizeLabel={u.sizeLabel}
                  percent={u.percent}
                  status={u.status}
                />
              ))}
            </div>

            {isSingleSuccess ? (
              <div className="flex items-center gap-4">
                <p className="font-ui text-[12px] text-ink-faint">Opening document…</p>
                <button onClick={handleOpenNow} className="font-ui text-body text-accent hover:underline">
                  Open now →
                </button>
                <button onClick={handleStayHere} className="font-ui text-body text-ink-muted hover:underline">
                  Stay here
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={handleUploadMore}>
                  Upload more files
                </Button>
                <button
                  onClick={handleViewAll}
                  className="font-ui text-body text-accent hover:underline"
                >
                  View all in queue →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div ref={queueRef}>
        <h2 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          Document Queue
        </h2>
        <p className="font-ui text-body text-ink-muted mt-1 mb-6">
          All uploaded documents and their extraction status.
        </p>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          resultCount={filtered.length}
        />

        <div className="bg-surface border border-border rounded-md overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-ui text-body text-ink-faint">
                No documents match these filters.
              </p>
            </div>
          ) : (
            <DocumentTable
              documents={filtered}
              onRowClick={(id) => navigate(`/documents/${id}`)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default QueuePage