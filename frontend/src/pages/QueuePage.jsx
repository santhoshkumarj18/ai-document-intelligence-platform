// src/pages/QueuePage.jsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
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
const MAX_CONCURRENT_UPLOADS = 3
const PAGE_SIZE = 10

function formatSize(bytes) {
  return bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`
}

function QueuePage() {
  const navigate = useNavigate()
  const { documents, refresh } = useDocuments()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [documentType, setDocumentType] = useState('UNCLASSIFIED')
  const [uploads, setUploads] = useState([])
  const [rejectedFiles, setRejectedFiles] = useState([])
  const [page, setPage] = useState(1)
  const queueRef = useRef(null)
  const startedIds = useRef(new Set())

  const uploadingCount = uploads.filter((u) => u.status === 'uploading').length
  const queuedCount = uploads.filter((u) => u.status === 'queued').length

  const phase = uploads.length === 0
    ? 'idle'
    : uploads.every((u) => u.status !== 'uploading' && u.status !== 'queued')
      ? 'summary'
      : 'uploading'

  const successCount = uploads.filter((u) => u.status === 'success').length
  const failedCount = uploads.filter((u) => u.status === 'failed').length
  const cancelledCount = uploads.filter((u) => u.status === 'cancelled').length

  const isSingleSuccess = uploads.length === 1 && uploads[0]?.status === 'success'

  useEffect(() => {
    if (phase === 'summary' && isSingleSuccess) {
      const timer = setTimeout(() => {
        navigate(`/documents/${uploads[0].documentId}`)
      }, AUTO_OPEN_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [phase, isSingleSuccess, uploads, navigate])

  useEffect(() => {
    const freeSlots = MAX_CONCURRENT_UPLOADS - uploadingCount
    if (freeSlots <= 0) return

    const nextToStart = uploads
      .filter((u) => u.status === 'queued' && !startedIds.current.has(u.id))
      .slice(0, freeSlots)

    nextToStart.forEach((entry) => startUpload(entry))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads, uploadingCount])

  function handleFilesSelected(files) {
    setRejectedFiles([])
    const newEntries = files.map((file) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      file,
      filename: file.name,
      sizeLabel: formatSize(file.size),
      percent: 0,
      status: 'queued',
      controller: null,
      documentId: null,
    }))
    setUploads((prev) => [...prev, ...newEntries])
  }

  function handleFilesRejected(files) {
    setRejectedFiles(files.map((f) => ({ filename: f.name, sizeLabel: formatSize(f.size) })))
  }

  function startUpload(entry) {
    startedIds.current.add(entry.id)
    const controller = new AbortController()

    setUploads((prev) =>
      prev.map((u) => (u.id === entry.id ? { ...u, status: 'uploading', controller } : u))
    )

    function handleProgress(percent) {
      setUploads((prev) => prev.map((u) => (u.id === entry.id ? { ...u, percent } : u)))
    }

    api.uploadDocument(entry.file, documentType, { onProgress: handleProgress, signal: controller.signal })
      .then(async (saved) => {
        setUploads((prev) =>
          prev.map((u) => (u.id === entry.id ? { ...u, percent: 100, status: 'success', documentId: saved?.id } : u))
        )
        await refresh()
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          setUploads((prev) => prev.map((u) => (u.id === entry.id ? { ...u, status: 'cancelled' } : u)))
        } else {
          setUploads((prev) => prev.map((u) => (u.id === entry.id ? { ...u, status: 'failed' } : u)))
          console.error(`Upload failed for ${entry.filename}:`, err.message)
        }
      })
  }

  function handleCancelOne(id) {
    const entry = uploads.find((u) => u.id === id)
    if (!entry) return
    if (entry.status === 'uploading' && entry.controller) {
      entry.controller.abort()
    } else if (entry.status === 'queued') {
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'cancelled' } : u)))
    }
  }

  function handleCancelAll() {
    uploads.forEach((u) => {
      if (u.status === 'uploading' && u.controller) {
        u.controller.abort()
      } else if (u.status === 'queued') {
        setUploads((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'cancelled' } : x)))
      }
    })
  }

  function handleUploadMore() {
    setUploads([])
    setRejectedFiles([])
    startedIds.current = new Set()
  }

  function handleViewAll() {
    setUploads([])
    startedIds.current = new Set()
    queueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleOpenNow() {
    if (uploads[0]?.documentId) {
      navigate(`/documents/${uploads[0].documentId}`)
    }
  }

  function handleStayHere() {
    setUploads([])
    startedIds.current = new Set()
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters)
    setPage(1)
  }

  function handleFilterReset() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div>
      <div className="pt-8">
        <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          Documents
        </h1>
        <p className="font-ui text-body text-ink-muted mt-1 mb-6">
          Upload documents to extract data and automate your workflow.
        </p>
      </div>

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

            <DropZone onFilesSelected={handleFilesSelected} onFilesRejected={handleFilesRejected} />

            {rejectedFiles.length > 0 && (
              <div className="mt-4 bg-status-error/10 border border-status-error/30 rounded-md p-3">
                <p className="flex items-center gap-1.5 font-ui text-[12px] font-medium text-status-error mb-1.5">
                  <AlertTriangle size={14} />
                  {rejectedFiles.length} file{rejectedFiles.length !== 1 ? 's' : ''} too large (max 50MB) — not uploaded:
                </p>
                <ul className="font-ui text-[12px] text-ink-muted space-y-0.5">
                  {rejectedFiles.map((f, i) => (
                    <li key={i}>{f.filename} ({f.sizeLabel})</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {phase === 'uploading' && (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-ui text-body text-ink font-medium">
                  Uploading {uploadingCount} of {uploads.length} file{uploads.length !== 1 ? 's' : ''}...
                  {queuedCount > 0 && ` (${queuedCount} queued)`}
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
        <div className="sticky top-0 z-10 bg-canvas pb-4 -mx-8 px-8 pt-4">
          <h2 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
            Document Queue
          </h2>
          <p className="font-ui text-body text-ink-muted mt-1 mb-6">
            All uploaded documents and their extraction status.
          </p>

          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
            resultCount={filtered.length}
          />
        </div>

        <div className="bg-surface border border-border rounded-md overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-ui text-body text-ink-faint">
                No documents match these filters.
              </p>
            </div>
          ) : (
            <>
              <DocumentTable
                documents={paginated}
                onRowClick={(id) => navigate(`/documents/${id}`)}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="font-ui text-[12px] text-ink-faint">
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-ui text-[12px] text-ink-muted px-1">
                      Page {safePage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueuePage