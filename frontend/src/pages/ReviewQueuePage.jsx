// src/pages/ReviewQueuePage.jsx
import { useNavigate, Link } from 'react-router-dom'
import DocumentTable from '../components/queue/DocumentTable'
import { useDocuments } from '../context/DocumentsContext'
import { getOverallConfidence } from '../utils/confidence'

function ReviewQueuePage() {
  const navigate = useNavigate()
  const { documents } = useDocuments()

  const reviewDocs = documents.filter((doc) => doc.status === 'NEEDS_REVIEW')

  const sorted = [...reviewDocs].sort((a, b) => {
    const confA = getOverallConfidence(a) ?? 0
    const confB = getOverallConfidence(b) ?? 0
    return confA - confB
  })

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          Review Queue
        </h1>
        <Link to="/" className="font-ui text-body text-accent hover:underline">
          ← Back to queue
        </Link>
      </div>
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