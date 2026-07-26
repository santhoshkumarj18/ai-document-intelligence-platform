// src/components/analytics/TrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TrendChart({ data }) {
  const chartData = data.map((d) => ({ ...d, label: formatDateLabel(d.date) }))

  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="font-ui text-[12px] font-medium uppercase tracking-wide text-ink-faint mb-4">
        Processing volume over time
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--color-ink-muted)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 12, fill: 'var(--color-ink-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontFamily: 'Inter',
              fontSize: 12,
              backgroundColor: 'var(--color-ink)',
              border: 'none',
              borderRadius: 4,
              color: 'white',
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-accent)', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart