// src/components/detail/SplitView.jsx
import { useState } from 'react'
import SummaryPanel from './SummaryPanel'
import FieldRow from './FieldRow'
import DocumentViewer from './DocumentViewer'
import Button from '../common/Button'

const DOCUMENT_TYPES = ['INVOICE', 'RECEIPT', 'CONTRACT', 'IDENTITY', 'RESUME', 'CERTIFICATE']

function SplitView({
  document,
  onFieldSave,
  onApprove,
  onReject,
  canApprove,
  onExtract,
  isExtracting,
  extractError,
  spotCheckFieldId,
  spotCheckConfirmed,
  onConfirmSpotCheck,
  onClassify,
  isClassifying,
  classifyError,
}) {
  const [selectedType, setSelectedType] = useState('')
  const isUnclassified = document.documentType === 'UNCLASSIFIED'

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-140px)]">
      <DocumentViewer fileUrl={document.fileUrl} filename={document.filename} />

      <div className="bg-surface border border-border rounded-md overflow-auto p-6 flex flex-col">
        <div className="flex-1">
          <h2 className="font-ui text-subheading text-ink mb-3">Summary</h2>
          <SummaryPanel summary={document.summary} anomalies={document.anomalies} />

          <h2 className="font-ui text-subheading text-ink mt-6 mb-2">Extracted fields</h2>

          {isUnclassified ? (
            <div className="mt-2 bg-surface-sunken border border-border rounded-md p-4">
              <p className="font-ui text-body text-ink mb-3">
                This document was uploaded as <span className="font-medium">UNCLASSIFIED</span> and
                hasn't been classified yet. Select its type to enable extraction.
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="font-ui text-body text-ink bg-surface border border-border rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="" disabled>UNCLASSIFIED</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  onClick={() => onClassify(selectedType)}
                  disabled={isClassifying || !selectedType}
                  className={isClassifying || !selectedType ? 'opacity-60 cursor-not-allowed hover:bg-accent' : ''}
                >
                  {isClassifying ? 'Saving…' : 'Set type'}
                </Button>
              </div>
              {classifyError && (
                <p className="font-ui text-[12px] text-status-error mt-2">
                  {classifyError}
                </p>
              )}
            </div>
          ) : document.extractedFields.length === 0 || document.status === 'EXTRACTING' ? (
            <div className="mt-2">
              <p className="font-ui text-body text-ink-faint italic mb-3">
                No fields extracted yet.
              </p>
                            <Button variant="primary" onClick={onExtract} disabled={isExtracting || document.status === 'EXTRACTING'}
                className={isExtracting || document.status === 'EXTRACTING' ? 'opacity-60 cursor-not-allowed hover:bg-accent' : ''}>
                {isExtracting || document.status === 'EXTRACTING' ? 'Extracting…' : 'Extract'}
              </Button>
              {extractError && (
                <p className="font-ui text-[12px] text-status-error mt-2">
                  {extractError}
                </p>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="font-ui text-[11px] font-medium uppercase tracking-wide text-ink-faint text-left py-2 pr-4">Field</th>
                  <th className="font-ui text-[11px] font-medium uppercase tracking-wide text-ink-faint text-left py-2 pr-4">Value</th>
                  <th className="font-ui text-[11px] font-medium uppercase tracking-wide text-ink-faint text-left py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {document.extractedFields.map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    onSave={onFieldSave}
                    isSpotCheck={field.id === spotCheckFieldId}
                    spotCheckConfirmed={spotCheckConfirmed}
                    onConfirmSpotCheck={onConfirmSpotCheck}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {document.extractedFields.length > 0 && (
          <div className="border-t border-border pt-4 mt-6">
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 font-ui text-[12px] text-ink-muted">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-solid border-accent" />
                High confidence
              </span>
              <span className="flex items-center gap-1.5 font-ui text-[12px] text-ink-muted">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-status-error" />
                Needs review
              </span>
            </div>

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