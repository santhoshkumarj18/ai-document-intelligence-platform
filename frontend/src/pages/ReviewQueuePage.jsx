// src/pages/ReviewQueuePage.jsx
import { useNavigate } from 'react-router-dom'
import DocumentTable from '../components/queue/DocumentTable'
import { mockDocuments } from '../mock/mockDocuments'
import { getOverallConfidence } from '../utils/confidence'

function ReviewQueuePage() {
  const navigate = useNavigate()

  // Only documents actually needing human attention.
  const reviewDocs = mockDocuments.filter((doc) => doc.status === 'NEEDS_REVIEW')

  // Lowest confidence first — the riskiest documents surface at the top,
  // per the design system's spec for this screen.
  const sorted = [...reviewDocs].sort((a, b) => {
    const confA = getOverallConfidence(a) ?? 0
    const confB = getOverallConfidence(b) ?? 0
    return confA - confB
  })

  return (
    <div className="min-h-screen bg-canvas p-8">
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink mb-2">
        Review Queue
      </h1>
      <p className="font-ui text-body text-ink-muted mb-6">
        {sorted.length} document{sorted.length !== 1 ? 's' : ''} awaiting review, sorted by lowest confidence first.
      </p>

      {sorted.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-8 text-center">
          <p className="font-ui text-body text-ink-faint">
            Nothing needs review right now. 🎉
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <DocumentTable
            documents={sorted}
            onRowClick={(id) => navigate(`/documents/${id}`)}
          />
        </div>
      )}
    </div>
  )
}

export default ReviewQueuePage