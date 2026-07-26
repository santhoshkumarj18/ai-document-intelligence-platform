// src/pages/QueuePage.jsx
import { useNavigate } from 'react-router-dom'
import DocumentTable from '../components/queue/DocumentTable'
import { mockDocuments } from '../mock/mockDocuments'

function QueuePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-canvas p-8">
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink mb-6">
        Document Queue
      </h1>

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <DocumentTable
          documents={mockDocuments}
          onRowClick={(id) => navigate(`/documents/${id}`)}
        />
      </div>
    </div>
  )
}

export default QueuePage