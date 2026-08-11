// src/components/common/ConfirmDialog.jsx
import { AlertCircle } from 'lucide-react'
import Button from './Button'

function ConfirmDialog({ message, nextDocLabel, confirmLabel, confirmDisabled, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-md shadow-lg w-[420px] p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle size={22} className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-ui text-body text-ink font-medium">{message}</p>
            {nextDocLabel && (
              <p className="font-ui text-[13px] text-ink-muted mt-1">
                Next up: {nextDocLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={confirmDisabled}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog