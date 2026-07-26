// src/components/upload/DropZone.jsx
import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

function DropZone({ onFilesSelected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files)
    if (files.length > 0) onFilesSelected(files)
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
        PDF, JPG, or PNG — any supported document type
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