// src/pages/UploadPage.jsx
import { useState } from 'react'
import DropZone from '../components/upload/DropZone'
import UploadProgress from '../components/upload/UploadProgress'
import { useDocuments } from '../context/DocumentsContext'

const STAGE_COUNT = 6
const STAGE_DELAY_MS = 700

function UploadPage() {
  const { addDocument } = useDocuments()
  const [uploads, setUploads] = useState([])

  function handleFilesSelected(files) {
    files.forEach((file) => {
      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const willFail = file.name.toLowerCase().includes('blurry')
      const now = new Date().toISOString()

      const sizeLabel = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`

      setUploads((prev) => [...prev, { id, filename: file.name, sizeLabel, stageIndex: 0, failed: false }])

      addDocument({
        id,
        filename: file.name,
        documentType: 'unknown',
        status: 'UPLOADED',
        fileType: file.name.split('.').pop(),
        fileUrl: `https://picsum.photos/seed/${id}/800/1000`,
        uploadedBy: 'user_1',
        uploadedAt: now,
        updatedAt: now,
        summary: null,
        anomalies: [],
        extractedFields: [],
        auditLog: [],
      })

      let stage = 0
      const interval = setInterval(() => {
        stage += 1
        if (willFail && stage === 3) {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, stageIndex: stage, failed: true } : u)))
          clearInterval(interval)
          return
        }
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, stageIndex: stage } : u)))
        if (stage >= STAGE_COUNT - 1) clearInterval(interval)
      }, STAGE_DELAY_MS)
    })
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Upload Documents
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        Add documents to extract data and automate your workflow.
      </p>

      <DropZone onFilesSelected={handleFilesSelected} />

      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploads.map((u) => (
            <UploadProgress key={u.id} filename={u.filename} sizeLabel={u.sizeLabel} currentStageIndex={u.stageIndex} failed={u.failed} />
          ))}
        </div>
      )}
    </div>
  )
}

export default UploadPage