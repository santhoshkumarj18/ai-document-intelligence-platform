// src/components/detail/SplitView.jsx
import SummaryPanel from './SummaryPanel'
import FieldRow from './FieldRow'

function SplitView({ document }) {
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
      <div className="bg-surface border border-border rounded-md overflow-auto p-6">
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
              <FieldRow key={field.id} field={field} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SplitView