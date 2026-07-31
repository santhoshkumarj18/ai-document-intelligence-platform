// src/components/review/ReviewFieldRow.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, ArrowRight } from 'lucide-react'
import ConfidenceIndicator from '../common/ConfidenceIndicator'

function KeyBadge({ letter }) {
  return (
    <span className="font-data text-[10px] font-medium text-ink-faint bg-surface-sunken border border-border rounded-sm px-1.5 py-0.5">
      {letter}
    </span>
  )
}

function ReviewFieldRow({ field, isActive, isEditing, onApprove, onStartEdit, onCancelEdit, onConfirmEdit, onSkip }) {
  const [draftValue, setDraftValue] = useState(field.value)

  function handleStartEdit() {
    setDraftValue(field.value)
    onStartEdit(field.id)
  }

  function handleConfirm() {
    onConfirmEdit(field.id, draftValue)
  }

  return (
    <div className={`flex items-center gap-4 p-4 border-b border-border last:border-b-0 ${isActive ? 'bg-accent-subtle/40' : ''}`}>
      <ConfidenceIndicator confidence={field.confidence} validationFailed={field.validationFailed} size="md" />
      <span className="font-data text-data text-ink w-12">{field.confidence}%</span>

      <div className="flex-1 min-w-0">
        <Link to={`/documents/${field.documentId}`} className="font-ui text-body text-accent hover:underline">
          {field.documentFilename}
        </Link>
        <p className="font-ui text-[12px] text-ink-faint">{field.label}</p>
      </div>

      <div className="flex-1 min-w-0">
       {isEditing ? (
          <input
            autoFocus
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm()
              if (e.key === 'Escape') onCancelEdit()
            }}
            className="font-data text-data text-ink bg-surface border border-accent rounded-sm px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-accent"
          />
        ) : (
          <p className="font-data text-data text-ink">{field.value}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onApprove(field)}
          className="flex items-center gap-1.5 font-ui text-[12px] text-ink border border-border-strong rounded-sm px-2.5 py-1.5 hover:bg-surface-sunken"
        >
          <Check size={13} /> Approve <KeyBadge letter="A" />
        </button>
        <button
          onClick={handleStartEdit}
          className="flex items-center gap-1.5 font-ui text-[12px] text-ink border border-border-strong rounded-sm px-2.5 py-1.5 hover:bg-surface-sunken"
        >
          <Pencil size={13} /> Correct <KeyBadge letter="E" />
        </button>
        <button
          onClick={() => onSkip(field)}
          className="flex items-center gap-1.5 font-ui text-[12px] text-ink border border-border-strong rounded-sm px-2.5 py-1.5 hover:bg-surface-sunken"
        >
          <ArrowRight size={13} /> Skip <KeyBadge letter="S" />
        </button>
      </div>
    </div>
  )
}

export default ReviewFieldRow