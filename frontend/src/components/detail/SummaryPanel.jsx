// src/components/detail/SummaryPanel.jsx
function SummaryPanel({ summary, anomalies }) {
  if (!summary && (!anomalies || anomalies.length === 0)) {
    return (
      <p className="font-ui text-body text-ink-faint italic">
        No summary available yet — this document hasn't completed processing.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {summary && (
        <p className="font-document text-summary text-ink bg-surface-sunken p-4 rounded-md">
          {summary}
        </p>
      )}

      {anomalies && anomalies.length > 0 && (
        <div className="bg-status-review-bg border border-status-review/30 rounded-md p-4">
          <p className="font-ui text-[12px] font-medium uppercase tracking-wide text-status-review mb-2">
            Flagged anomalies
          </p>
          <ul className="space-y-1">
            {anomalies.map((a, i) => (
              <li key={i} className="font-ui text-body text-ink">• {a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SummaryPanel