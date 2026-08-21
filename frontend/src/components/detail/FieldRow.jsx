// src/components/detail/FieldRow.jsx
import { useState } from 'react'
import { Pencil, Check, X, Circle, CheckCircle2 } from 'lucide-react'
import ConfidenceIndicator from '../common/ConfidenceIndicator'

function FieldRow({ field, onSave, isSpotCheck, spotCheckConfirmed, onConfirmSpotCheck }) {
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
    <tr className="group border-b border-border last:border-b-0">
      <td className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint py-3 pr-4 align-top whitespace-nowrap">
        {field.label}
      </td>

      <td className="py-3 pr-4 align-top w-full">
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
            <button onClick={confirmSave} className="text-status-complete hover:bg-status-complete-bg rounded-sm p-1 shrink-0" aria-label="Save">
              <Check size={16} />
            </button>
            <button onClick={cancelEditing} className="text-ink-muted hover:bg-surface-sunken rounded-sm p-1 shrink-0" aria-label="Cancel">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-data text-data text-ink">{field.value}</p>
            <button
              onClick={startEditing}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-accent shrink-0"
              aria-label={`Edit ${field.label}`}
            >
              <Pencil size={13} />
            </button>
          </div>
        )}

        {field.validationFailed && field.validationMessage && (
          <p className="font-ui text-[12px] text-status-error mt-1">{field.validationMessage}</p>
        )}

        {isSpotCheck && !isEditing && (
          spotCheckConfirmed ? (
            <p className="flex items-center gap-1.5 font-ui text-[12px] text-status-complete mt-1">
              <CheckCircle2 size={14} />
              Verified
            </p>
          ) : (
            <button
              onClick={() => onConfirmSpotCheck(field.id)}
              className="flex items-center gap-1.5 font-ui text-[12px] text-ink-muted hover:text-accent mt-1"
            >
              <Circle size={14} />
              Mark as verified
            </button>
          )
        )}
      </td>

      <td className="py-3 align-top">
        <ConfidenceIndicator
          confidence={field.confidence}
          validationFailed={field.validationFailed}
          size="md"
        />
      </td>
    </tr>
  )
}

export default FieldRow