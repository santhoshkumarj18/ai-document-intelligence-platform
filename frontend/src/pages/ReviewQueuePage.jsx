// src/pages/ReviewQueuePage.jsx
import { useNavigate } from 'react-router-dom'
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
    <div>
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Review Queue
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        Lowest confidence items first. Review, correct, or skip.
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