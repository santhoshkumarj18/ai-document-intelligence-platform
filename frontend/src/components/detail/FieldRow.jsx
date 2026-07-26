// src/components/detail/FieldRow.jsx
import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import ConfidenceIndicator from '../common/ConfidenceIndicator'

function FieldRow({ field, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(field.value)

  function startEditing() {
    setDraftValue(field.value)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  function confirmSave() {
    onSave(field.id, draftValue)
    setIsEditing(false)
  }

  return (
    <div className="group flex items-start justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <p className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint mb-1">
          {field.label}
        </p>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmSave()
                if (e.key === 'Escape') cancelEditing()
              }}
              className="font-data text-data text-ink bg-surface border border-accent rounded-sm px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={confirmSave} className="text-status-complete hover:bg-status-complete-bg rounded-sm p-1" aria-label="Save">
              <Check size={16} />
            </button>
            <button onClick={cancelEditing} className="text-ink-muted hover:bg-surface-sunken rounded-sm p-1" aria-label="Cancel">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-data text-data text-ink">{field.value}</p>
            <button
              onClick={startEditing}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-accent"
              aria-label={`Edit ${field.label}`}
            >
              <Pencil size={13} />
            </button>
          </div>
        )}

        {field.validationFailed && field.validationMessage && (
          <p className="font-ui text-[12px] text-status-error mt-1">{field.validationMessage}</p>
        )}
      </div>
      <div className="pl-4 pt-1">
        <ConfidenceIndicator
          confidence={field.confidence}
          validationFailed={field.validationFailed}
          size="md"
        />
      </div>
    </div>
  )
}

export default FieldRow