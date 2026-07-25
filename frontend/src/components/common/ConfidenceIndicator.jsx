// src/components/common/ConfidenceIndicator.jsx
function getConfidenceState(confidence, validationFailed) {
  if (validationFailed || confidence < 70) {
    return { ring: 'border-2 border-dashed border-status-error', fill: null }
  }
  if (confidence < 90) {
    return { ring: 'border-2 border-solid border-status-review', fill: null }
  }
  return { ring: 'border-2 border-solid border-accent', fill: 'bg-accent' }
}

const SIZES = {
  sm: 'w-2 h-2',   // 8px — inline next to a field value
  md: 'w-3 h-3',   // table row badge
  lg: 'w-5 h-5',   // large annotation mark on split view
}

function ConfidenceIndicator({ confidence, validationFailed = false, size = 'sm' }) {
  const { ring, fill } = getConfidenceState(confidence, validationFailed)

  return (
    <span className="relative inline-flex group">
      <span className={`rounded-full ${SIZES[size]} ${ring} flex items-center justify-center`}>
        {fill && <span className={`rounded-full w-1/2 h-1/2 ${fill}`} />}
      </span>

      <span
        className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:flex
                   font-data text-[12px] leading-[16px] font-medium
                   bg-ink text-white px-2 py-1 rounded-sm whitespace-nowrap z-10"
      >
        {confidence}%
      </span>
    </span>
  )
}

export default ConfidenceIndicator