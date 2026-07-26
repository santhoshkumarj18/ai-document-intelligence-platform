// src/components/detail/FieldRow.jsx
import ConfidenceIndicator from '../common/ConfidenceIndicator'

function FieldRow({ field }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <p className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint mb-1">
          {field.label}
        </p>
        <p className="font-data text-data text-ink">{field.value}</p>
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
