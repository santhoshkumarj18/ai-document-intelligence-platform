// src/components/analytics/StatCard.jsx
function StatCard({ label, value, sublabel, accent = false }) {
  return (
    <div className={`bg-surface border rounded-md p-5 ${accent ? 'border-accent' : 'border-border'}`}>
      <p className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint mb-2">
        {label}
      </p>
      <p className={`font-data text-[28px] leading-[36px] font-semibold ${accent ? 'text-accent' : 'text-ink'}`}>
        {value}
      </p>
      {sublabel && (
        <p className="font-ui text-[12px] text-ink-faint mt-1">{sublabel}</p>
      )}
    </div>
  )
}

export default StatCard