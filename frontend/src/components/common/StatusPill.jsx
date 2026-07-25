// src/components/common/StatusPill.jsx
const STATUS_CONFIG = {
  complete: {
    label: 'Complete',
    text: 'text-status-complete',
    bg: 'bg-status-complete-bg',
    dot: 'bg-status-complete', // solid dot = confirmed
  },
  review: {
    label: 'Needs review',
    text: 'text-status-review',
    bg: 'bg-status-review-bg',
    dot: 'border border-dashed border-status-review', // dashed = provisional
  },
  error: {
    label: 'Failed',
    text: 'text-status-error',
    bg: 'bg-status-error-bg',
    dot: 'bg-status-error', // solid = definitively failed
  },
}

function StatusPill({ status, label }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium uppercase tracking-wide ${config.text} ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.label}
    </span>
  )
}

export default StatusPill