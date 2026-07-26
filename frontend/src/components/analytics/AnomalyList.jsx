// src/components/analytics/AnomalyList.jsx
import { Link } from 'react-router-dom'

function AnomalyList({ anomalies }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint mb-4">
        Flagged anomalies
      </p>
      {anomalies.length === 0 ? (
        <p className="font-ui text-body text-ink-faint italic">No anomalies flagged.</p>
      ) : (
        <ul className="space-y-3">
          {anomalies.map((a, i) => (
            <li key={i} className="border-b border-border last:border-b-0 pb-3 last:pb-0">
              <Link to={`/documents/${a.documentId}`} className="font-ui text-[12px] text-accent hover:underline">
                {a.filename}
              </Link>
              <p className="font-ui text-body text-ink mt-0.5">{a.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AnomalyList