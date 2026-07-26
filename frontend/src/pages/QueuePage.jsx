// src/pages/QueuePage.jsx
import DocumentTable from '../components/queue/DocumentTable'
import { mockDocuments } from '../mock/mockDocuments'

function QueuePage() {
  return (
    <div className="min-h-screen bg-canvas p-8">
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink mb-6">
        Document Queue
      </h1>

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <DocumentTable
          documents={mockDocuments}
          onRowClick={(id) => console.log('clicked document', id)}
        />
      </div>
    </div>
  )
}

export default QueuePage