// src/components/detail/DocumentViewer.jsx
import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react'

function DocumentViewer({ fileUrl, filename }) {
  const [zoom, setZoom] = useState(100)

  function zoomIn() {
    setZoom((z) => Math.min(z + 25, 200))
  }
  function zoomOut() {
    setZoom((z) => Math.max(z - 25, 50))
  }
  function resetZoom() {
    setZoom(100)
  }

  return (
    <div className="bg-surface-sunken border border-border rounded-md flex flex-col overflow-hidden">
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

          {/* Visual-only for now: no real file storage exists yet in mock mode,
              so there's nothing to actually download or expand — these are placed
              here to match the expected toolbar, wired up once file storage is real. */}
          <button className="p-1.5 rounded-sm text-ink-faint cursor-not-allowed" aria-label="Download (not yet available)" title="Available once file storage is implemented">
            <Download size={15} />
          </button>
          <button className="p-1.5 rounded-sm text-ink-faint cursor-not-allowed" aria-label="Fullscreen (not yet available)" title="Available once file storage is implemented">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <img
          src={fileUrl}
          alt={filename}
          style={{ width: `${zoom}%` }}
          className="max-w-none rounded-sm shadow-popover transition-[width] duration-150"
        />
      </div>
    </div>
  )
}

export default DocumentViewer
