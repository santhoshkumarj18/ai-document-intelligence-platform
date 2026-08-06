// src/components/detail/DocumentViewer.jsx
import { useState, useEffect, useRef } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react'
import { isProtectedFileUrl, fetchFileBlob } from '../../services/api'

function getExtension(filename) {
  if (!filename || !filename.includes('.')) return ''
  return filename.split('.').pop().toLowerCase()
}

function DocumentViewer({ fileUrl, filename }) {
  const [zoom, setZoom] = useState(100)
  const [resolvedSrc, setResolvedSrc] = useState(null)
  const [error, setError] = useState(null)
  const containerRef = useRef(null)

  const isPdf = getExtension(filename) === 'pdf'

  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function loadFile() {
      setError(null)
      setResolvedSrc(null)

      if (!isProtectedFileUrl(fileUrl)) {
        // Mock/legacy documents (picsum.photos etc.) — public URL, no auth needed.
        setResolvedSrc(fileUrl)
        return
      }

      try {
        const blob = await fetchFileBlob(fileUrl)
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setResolvedSrc(objectUrl)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    loadFile()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileUrl])

  function zoomIn() { setZoom((z) => Math.min(z + 25, 200)) }
  function zoomOut() { setZoom((z) => Math.max(z - 25, 50)) }
  function resetZoom() { setZoom(100) }

  function handleDownload() {
    if (!resolvedSrc) return
    const a = window.document.createElement('a')
    a.href = resolvedSrc
    a.download = filename || 'document'
    a.click()
  }

  function handleFullscreen() {
    containerRef.current?.requestFullscreen?.()
  }

  return (
    <div ref={containerRef} className="bg-surface-sunken border border-border rounded-md flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface">
        <span className="font-data text-[12px] text-ink-muted">1 / 1</span>

        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink" aria-label="Zoom out">
            <ZoomOut size={15} />
          </button>
          <span className="font-data text-[12px] text-ink-muted w-10 text-center">{zoom}%</span>
          <button onClick={zoomIn} className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink" aria-label="Zoom in">
            <ZoomIn size={15} />
          </button>
          <button onClick={resetZoom} className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink" aria-label="Reset zoom">
            <RotateCcw size={14} />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={handleDownload}
            disabled={!resolvedSrc}
            className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:text-ink-faint disabled:cursor-not-allowed"
            aria-label="Download"
          >
            <Download size={15} />
          </button>
          <button
            onClick={handleFullscreen}
            disabled={!resolvedSrc}
            className="p-1.5 rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:text-ink-faint disabled:cursor-not-allowed"
            aria-label="Fullscreen"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        {error && (
          <p className="font-ui text-body text-red-600">Couldn't load file: {error}</p>
        )}

        {!error && resolvedSrc && isPdf && (
          <iframe
            src={resolvedSrc}
            title={filename}
            style={{ width: `${zoom}%`, height: '80vh' }}
            className="rounded-sm shadow-popover border-0 transition-[width] duration-150"
          />
        )}

        {!error && resolvedSrc && !isPdf && (
          <img
            src={resolvedSrc}
            alt={filename}
            style={{ width: `${zoom}%` }}
            className="max-w-none rounded-sm shadow-popover transition-[width] duration-150"
          />
        )}

        {!error && !resolvedSrc && (
          <p className="font-ui text-body text-ink-muted">Loading…</p>
        )}
      </div>
    </div>
  )
}

export default DocumentViewer