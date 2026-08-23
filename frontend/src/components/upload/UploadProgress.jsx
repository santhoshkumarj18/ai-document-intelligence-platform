// src/components/upload/UploadProgress.jsx
import { FileText, X, Check, AlertCircle } from 'lucide-react'

function UploadProgress({ filename, sizeLabel, percent, status, onCancel }) {
  const failed = status === 'failed'
  const cancelled = status === 'cancelled'
  const success = status === 'success'
  const processing = status === 'uploading' && percent >= 100
  const displayPercent = success ? 100 : percent

  const barColor = failed
    ? 'bg-status-error'
    : cancelled
      ? 'bg-border-strong'
      : success
        ? 'bg-status-complete'
        : 'bg-accent'

  return (
    <div className={`flex items-center gap-3 bg-surface border border-border rounded-md px-4 py-3 ${cancelled ? 'opacity-60' : ''}`}>
      <div className="w-9 h-9 rounded-sm bg-status-error/10 flex items-center justify-center shrink-0">
        <FileText size={16} className="text-status-error" />
      </div>

      <div className="min-w-0 w-40 shrink-0">
        <p className="font-ui text-body text-ink truncate">{filename}</p>
        {sizeLabel && <p className="font-ui text-[12px] text-ink-faint">{sizeLabel}</p>}
      </div>

      <div className="flex-1 h-2 bg-surface-sunken rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor} ${processing ? 'animate-pulse' : ''}`}
          style={{ width: `${displayPercent}%` }}
        />
      </div>

      <div className="w-32 shrink-0 text-right">
        {failed && (
          <span className="flex items-center justify-end gap-1 font-ui text-[12px] text-status-error">
            <AlertCircle size={13} /> Failed
          </span>
        )}
        {cancelled && (
          <span className="font-ui text-[12px] text-ink-muted">Cancelled</span>
        )}
        {success && (
          <span className="flex items-center justify-end gap-1 font-ui text-[12px] text-status-complete">
            <Check size={13} /> Done
          </span>
        )}
        {status === 'uploading' && !processing && (
          <span className="font-ui text-[12px] text-accent">Uploading… {displayPercent}%</span>
        )}
        {processing && (
          <span className="font-ui text-[12px] text-accent">Processing…</span>
        )}
      </div>

      {status === 'uploading' && onCancel && (
        <button
          onClick={onCancel}
          className="text-ink-faint hover:text-status-error transition-colors shrink-0"
          aria-label={`Cancel upload of ${filename}`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export default UploadProgress