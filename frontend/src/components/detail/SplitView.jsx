// src/components/detail/SplitView.jsx
import SummaryPanel from './SummaryPanel'
import FieldRow from './FieldRow'
import Button from '../common/Button'

function SplitView({ document, onFieldSave, onApprove, onReject, canApprove }) {
  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-140px)]">
      {/* Left: original document */}
      <div className="bg-surface-sunken border border-border rounded-md overflow-auto flex items-start justify-center p-4">
        <img
          src={document.fileUrl}
          alt={document.filename}
          className="max-w-full rounded-sm shadow-popover"
        />
      </div>

      {/* Right: summary + extracted fields */}
      <div className="bg-surface border border-border rounded-md overflow-auto p-6 flex flex-col">
        <div className="flex-1">
          <h2 className="font-ui text-subheading text-ink mb-3">Summary</h2>
          <SummaryPanel summary={document.summary} anomalies={document.anomalies} />

          <h2 className="font-ui text-subheading text-ink mt-6 mb-1">Extracted fields</h2>
          {document.extractedFields.length === 0 ? (
            <p className="font-ui text-body text-ink-faint italic mt-2">
              No fields extracted yet.
            </p>
          ) : (
            <div>
              {document.extractedFields.map((field) => (
                <FieldRow key={field.id} field={field} onSave={onFieldSave} />
              ))}
            </div>
          )}
        </div>

        {document.extractedFields.length > 0 && (
          <div className="border-t border-border pt-4 mt-6">
            {!canApprove && (
              <p className="font-ui text-[12px] text-status-error mb-2">
                Resolve all flagged fields before approving.
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="primary" onClick={onApprove} disabled={!canApprove}
                className={!canApprove ? 'opacity-40 cursor-not-allowed hover:bg-accent' : ''}>
                Approve &amp; Complete
              </Button>
              <Button variant="destructive" onClick={onReject}>Reject</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SplitView