// src/pages/QueuePage.jsx
import { useNavigate } from 'react-router-dom'
import DocumentTable from '../components/queue/DocumentTable'
import { useDocuments } from '../context/DocumentsContext'

function QueuePage() {
  const navigate = useNavigate()
  const { documents } = useDocuments()

  return (
    <div>
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Document Queue
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        All uploaded documents and their extraction status.
      </p>

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