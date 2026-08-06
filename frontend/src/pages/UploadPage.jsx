// src/pages/UploadPage.jsx
import { useState } from 'react'
import DropZone from '../components/upload/DropZone'
import UploadProgress from '../components/upload/UploadProgress'
import { useDocuments } from '../context/DocumentsContext'
import * as api from '../services/api'

const STAGE_COUNT = 6
const STAGE_DELAY_MS = 700

const DOCUMENT_TYPES = ['INVOICE', 'RECEIPT', 'CONTRACT', 'IDENTITY', 'RESUME', 'CERTIFICATE']

function UploadPage() {
  const { refresh } = useDocuments()
  const [documentType, setDocumentType] = useState('INVOICE')
  const [uploads, setUploads] = useState([])

  function handleFilesSelected(files) {
    files.forEach((file) => uploadOne(file))
  }

  async function uploadOne(file) {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const sizeLabel = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`

    setUploads((prev) => [...prev, { id, filename: file.name, sizeLabel, stageIndex: 0, failed: false }])

    // Cosmetic stage animation only, while the real request is in flight —
    // your backend doesn't emit per-stage events yet (OCR/classification
    // pipeline is Phase 2, still pending), so this can't reflect real
    // progress. It advances up to the second-to-last stage, then the final
    // state (done vs failed) is driven by what the API actually returns.
    let stage = 0
    const interval = setInterval(() => {
      stage = Math.min(stage + 1, STAGE_COUNT - 2)
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, stageIndex: stage } : u)))
    }, STAGE_DELAY_MS)

    try {
      await api.uploadDocument(file, documentType)
      clearInterval(interval)
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, stageIndex: STAGE_COUNT - 1 } : u)))
      await refresh() // pull the real, server-assigned document into the queue
    } catch (err) {
      clearInterval(interval)
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, failed: true } : u)))
      console.error(`Upload failed for ${file.name}:`, err.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Upload Documents
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        Add documents to extract data and automate your workflow.
      </p>

      <div className="mb-4 max-w-xs">
        <label className="block font-ui text-[12px] font-medium text-ink-muted mb-1">
          Document type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full rounded border border-border px-3 py-2 font-ui text-body text-ink"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} />

      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploads.map((u) => (
            <UploadProgress
              key={u.id}
              filename={u.filename}
              sizeLabel={u.sizeLabel}
              currentStageIndex={u.stageIndex}
              failed={u.failed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default UploadPage