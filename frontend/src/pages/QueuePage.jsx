// src/pages/QueuePage.jsx
import { useNavigate, Link } from 'react-router-dom'
import DocumentTable from '../components/queue/DocumentTable'
import { useDocuments } from '../context/DocumentsContext'

function QueuePage() {
  const navigate = useNavigate()
  const { documents } = useDocuments()

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          Document Queue
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/upload" className="font-ui text-body text-accent hover:underline">
            Upload →
          </Link>
          <Link to="/review" className="font-ui text-body text-accent hover:underline">
            Review Queue →
          </Link>
          <Link to="/analytics" className="font-ui text-body text-accent hover:underline">
            Analytics →
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <DocumentTable
          documents={documents}
          onRowClick={(id) => navigate(`/documents/${id}`)}
        />
      </div>
    </div>
  )
}

export default QueuePage