// src/components/queue/FilterBar.jsx
import { Search } from 'lucide-react'

const DOCUMENT_TYPES = ['INVOICE', 'RECEIPT', 'CONTRACT', 'IDENTITY', 'RESUME', 'CERTIFICATE', 'UNCLASSIFIED']
const STATUSES = ['UPLOADED', 'EXTRACTED', 'VALIDATED', 'NEEDS_REVIEW', 'COMPLETE', 'FAILED']

function FilterBar({ filters, onChange, onReset, resultCount }) {
  return (
    <div className="mb-4">
      <div className="flex items-end gap-4 mb-3">
        <div className="flex-1">
          <label className="font-ui text-[12px] font-medium text-ink-faint mb-1 block">Search</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Search filenames..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full font-ui text-body text-ink bg-surface border border-border rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="font-ui text-[12px] font-medium text-ink-faint mb-1 block">Document type</label>
          <select
            value={filters.type}
            onChange={(e) => onChange({ ...filters, type: e.target.value })}
            className="font-ui text-body text-ink bg-surface border border-border rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All types</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-ui text-[12px] font-medium text-ink-faint mb-1 block">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="font-ui text-body text-ink bg-surface border border-border rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-ui text-[12px] font-medium text-ink-faint mb-1 block">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="font-ui text-body text-ink bg-surface border border-border rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="font-ui text-[12px] font-medium text-ink-faint mb-1 block">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="font-ui text-body text-ink bg-surface border border-border rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          onClick={onReset}
          className="font-ui text-body text-accent hover:underline py-2 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      <p className="font-ui text-[12px] text-ink-faint">
        {resultCount} document{resultCount !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default FilterBar