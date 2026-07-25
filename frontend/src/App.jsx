// src/App.jsx
function App() {
  return (
    <div className="min-h-screen bg-canvas p-8">
      <h1 className="font-ui text-[28px] leading-[36px] font-semibold text-ink">
        Design tokens wired ✓
      </h1>

      <p className="font-ui text-[14px] leading-[20px] text-ink-muted mt-2">
        If this looks like a warm off-white background with dark ink text, tokens are working.
      </p>

      <p className="font-document text-[15px] leading-[24px] text-ink mt-4 bg-surface-sunken p-4 rounded-md">
        This paragraph should render in Source Serif 4 — this is the font reserved for AI summaries later.
      </p>

      <p className="font-data text-[14px] leading-[20px] text-ink mt-4">
        1234.56 — this line should render in IBM Plex Mono with tabular figures.
      </p>

      <div className="flex gap-3 mt-6">
        <span className="px-3 py-1 rounded-full text-[12px] font-medium tracking-wide" style={{ color: 'var(--color-status-complete)', backgroundColor: 'var(--color-status-complete-bg)' }}>
          Complete
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium tracking-wide" style={{ color: 'var(--color-status-review)', backgroundColor: 'var(--color-status-review-bg)' }}>
          Needs review
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium tracking-wide" style={{ color: 'var(--color-status-error)', backgroundColor: 'var(--color-status-error-bg)' }}>
          Failed
        </span>
      </div>
    </div>
  )
}

export default App