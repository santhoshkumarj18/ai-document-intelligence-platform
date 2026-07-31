// src/pages/ReviewQueuePage.jsx
import { useState, useMemo, useEffect } from 'react'
import { useDocuments } from '../context/DocumentsContext'
import { getFlaggedFields } from '../utils/review'
import ReviewFieldRow from '../components/review/ReviewFieldRow'

function ReviewQueuePage() {
  const { documents, updateField } = useDocuments()
  const [skippedIds, setSkippedIds] = useState(new Set())
  const [editingId, setEditingId] = useState(null)

  const allFlagged = useMemo(() => getFlaggedFields(documents), [documents])
  const visible = allFlagged.filter((f) => !skippedIds.has(f.id))

  function handleApprove(field) {
    updateField(field.documentId, field.id, {
      confidence: 100,
      validationFailed: false,
      validationMessage: null,
    })
  }

  function handleConfirmEdit(fieldId, newValue) {
    const field = visible.find((f) => f.id === fieldId)
    if (!field) return
    updateField(field.documentId, fieldId, {
      value: newValue,
      confidence: 100,
      validationFailed: false,
      validationMessage: null,
    })
    setEditingId(null)
  }

  function handleSkip(field) {
    setSkippedIds((prev) => new Set(prev).add(field.id))
  }

  // Keyboard shortcuts act on the top (lowest-confidence) visible row,
  // and are disabled while a field is actively being edited so typing
  // "a"/"e"/"s" into the input doesn't accidentally trigger an action.
  useEffect(() => {
    function handleKeyDown(e) {
      if (editingId) return
      if (visible.length === 0) return

      const topField = visible[0]
      const key = e.key.toLowerCase()

      if (key === 'a') {
        e.preventDefault()
        handleApprove(topField)
      }
      if (key === 's') {
        e.preventDefault()
        handleSkip(topField)
      }
      if (key === 'e') {
        e.preventDefault()
        setEditingId(topField.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, editingId])

  return (
    <div>
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Review Queue
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        Lowest confidence items first. Review, correct, or skip.
      </p>

      {visible.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-8 text-center">
          <p className="font-ui text-body text-ink-faint">
            Nothing needs review right now. 🎉
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          {visible.map((field, i) => (
            <ReviewFieldRow
              key={field.id}
              field={field}
              isActive={i === 0}
              isEditing={editingId === field.id}
              onApprove={handleApprove}
              onStartEdit={setEditingId}
              onCancelEdit={() => setEditingId(null)}
              onConfirmEdit={handleConfirmEdit}
              onSkip={handleSkip}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewQueuePage