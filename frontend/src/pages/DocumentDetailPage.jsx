// src/pages/DocumentDetailPage.jsx
import { useParams, Link } from 'react-router-dom'
import { getDocumentById } from '../mock/mockDocuments'

function DocumentDetailPage() {
  const { id } = useParams()
  const document = getDocumentById(id)

  if (!document) {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <p className="font-ui text-body text-ink">Document not found.</p>
        <Link to="/" className="font-ui text-body text-accent hover:underline">← Back to queue</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas p-8">
      <Link to="/" className="font-ui text-body text-accent hover:underline">← Back to queue</Link>
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink mt-4">
        {document.filename}
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1">
        Status: {document.status} — this is a placeholder, real split-view coming next.
      </p>
    </div>
  )
}

export default DocumentDetailPage