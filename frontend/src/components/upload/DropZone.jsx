// src/components/upload/DropZone.jsx
import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB, matches the UI copy below

function DropZone({ onFilesSelected, onFilesRejected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function splitBySize(files) {
    const accepted = []
    const rejected = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejected.push(file)
      } else {
        accepted.push(file)
      }
    }
    return { accepted, rejected }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const { accepted, rejected } = splitBySize(files)
    if (rejected.length > 0) onFilesRejected?.(rejected)
    if (accepted.length > 0) onFilesSelected(accepted)
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files)
    const { accepted, rejected } = splitBySize(files)
    if (rejected.length > 0) onFilesRejected?.(rejected)
    if (accepted.length > 0) onFilesSelected(accepted)
    e.target.value = '' // allow re-selecting the same file later
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-md flex flex-col items-center justify-center py-16 cursor-pointer transition-colors
        ${isDragging ? 'border-accent bg-accent-subtle' : 'border-border-strong bg-surface hover:bg-surface-sunken'}`}
    >
      <UploadCloud size={32} className={isDragging ? 'text-accent' : 'text-ink-faint'} />
      <p className="font-ui text-body text-ink mt-3">
        <span className="text-accent font-medium">Click to upload</span> or drag and drop
      </p>
      <p className="font-ui text-[12px] text-ink-faint mt-1">
        Supports PDF, JPG, PNG
      </p>
      <p className="font-ui text-[12px] text-ink-faint">
        Max file size: 50MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}

export default DropZone