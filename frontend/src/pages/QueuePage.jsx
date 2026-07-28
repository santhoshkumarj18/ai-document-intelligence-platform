// src/pages/QueuePage.jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DocumentTable from '../components/queue/DocumentTable'
import FilterBar from '../components/queue/FilterBar'
import { useDocuments } from '../context/DocumentsContext'

const DEFAULT_FILTERS = { search: '', type: '', status: '', dateFrom: '', dateTo: '' }

function QueuePage() {
  const navigate = useNavigate()
  const { documents } = useDocuments()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (filters.search && !doc.filename.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.type && doc.documentType !== filters.type) return false
      if (filters.status && doc.status !== filters.status) return false
      if (filters.dateFrom && doc.uploadedAt.slice(0, 10) < filters.dateFrom) return false
      if (filters.dateTo && doc.uploadedAt.slice(0, 10) > filters.dateTo) return false
      return true
    })
  }, [documents, filters])

  return (
    <div>
      <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
        Document Queue
      </h1>
      <p className="font-ui text-body text-ink-muted mt-1 mb-6">
        All uploaded documents and their extraction status.
      </p>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        resultCount={filtered.length}
      />

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-ui text-body text-ink-faint">
              No documents match these filters.
            </p>
          </div>
        ) : (
          <DocumentTable
            documents={filtered}
            onRowClick={(id) => navigate(`/documents/${id}`)}
          />
        )}
      </div>
    </div>
  )
}

export default QueuePage