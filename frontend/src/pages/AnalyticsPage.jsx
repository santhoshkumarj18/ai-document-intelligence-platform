// src/pages/AnalyticsPage.jsx
import { Link } from 'react-router-dom'
import StatCard from '../components/analytics/StatCard'
import TrendChart from '../components/analytics/TrendChart'
import AnomalyList from '../components/analytics/AnomalyList'
import { useDocuments } from '../context/DocumentsContext'
import {
  getTotalDocuments,
  getPercentNeedingReview,
  getAvgProcessingTimeSeconds,
  getVolumeByDay,
  getAllAnomalies,
} from '../utils/analytics'

function formatSeconds(seconds) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rem = seconds % 60
  return `${minutes}m ${rem}s`
}

function AnalyticsPage() {
  const { documents } = useDocuments()

  const total = getTotalDocuments(documents)
  const percentReview = getPercentNeedingReview(documents)
  const avgTime = getAvgProcessingTimeSeconds(documents)
  const volume = getVolumeByDay(documents)
  const anomalies = getAllAnomalies(documents)

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-ui text-[20px] leading-[28px] font-semibold text-ink">
          Analytics
        </h1>
        <Link to="/" className="font-ui text-body text-accent hover:underline">
          ← Back to queue
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total documents" value={total} />
        <StatCard label="Requiring review" value={`${percentReview}%`} />
        <StatCard label="Avg. processing time" value={formatSeconds(avgTime)} />
        <StatCard
          label="Manual review time saved"
          value="8m → 15s"
          sublabel="Estimated, based on industry benchmark — not yet measured from live usage"
          accent
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TrendChart data={volume} />
        <AnomalyList anomalies={anomalies} />
      </div>
    </div>
  )
}

export default AnalyticsPage