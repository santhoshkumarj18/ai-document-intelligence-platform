// src/pages/UploadPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
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

      setUploads((prev) => [...prev, { id, filename: file.name, stageIndex: 0, failed: false }])

      // Reflect the upload in the shared document list immediately,
      // status UPLOADED, so it shows in the Queue right away — the
      // progress animation below is purely local UI feedback on this page.
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
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, stageIndex: stage, failed: true } : u))
          )
          clearInterval(interval)
          return
        }

        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, stageIndex: stage } : u))
        )

        if (stage >= STAGE_COUNT - 1) clearInterval(interval)
      }, STAGE_DELAY_MS)
    })
  }

  return (
    <div className="min-h-screen bg-canvas p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          Upload Documents
        </h1>
        <Link to="/" className="font-ui text-body text-accent hover:underline">
          ← Back to queue
        </Link>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} />

      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploads.map((u) => (
            <UploadProgress
              key={u.id}
              filename={u.filename}
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