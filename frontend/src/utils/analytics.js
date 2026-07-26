// src/utils/analytics.js
import { needsAttention } from './confidence'

export function getTotalDocuments(documents) {
  return documents.length
}

export function getPercentNeedingReview(documents) {
  if (documents.length === 0) return 0
  const flagged = documents.filter(needsAttention).length
  return Math.round((flagged / documents.length) * 100)
}

export function getDocumentsByType(documents) {
  const counts = {}
  documents.forEach((doc) => {
    counts[doc.documentType] = (counts[doc.documentType] || 0) + 1
  })
  return Object.entries(counts).map(([type, count]) => ({ type, count }))
}

/**
 * Average processing time in seconds, from upload to last update,
 * for documents that have actually progressed past UPLOADED.
 */
export function getAvgProcessingTimeSeconds(documents) {
  const processed = documents.filter((d) => d.status !== 'UPLOADED')
  if (processed.length === 0) return 0

  const totalSeconds = processed.reduce((acc, doc) => {
    const diffMs = new Date(doc.updatedAt) - new Date(doc.uploadedAt)
    return acc + diffMs / 1000
  }, 0)

  return Math.round(totalSeconds / processed.length)
}

/**
 * Volume grouped by calendar day, for the trend chart.
 */
export function getVolumeByDay(documents) {
  const counts = {}
  documents.forEach((doc) => {
    const day = doc.uploadedAt.slice(0, 10) // 'YYYY-MM-DD'
    counts[day] = (counts[day] || 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

export function getAllAnomalies(documents) {
  return documents
    .filter((doc) => doc.anomalies && doc.anomalies.length > 0)
    .flatMap((doc) => doc.anomalies.map((text) => ({ documentId: doc.id, filename: doc.filename, text })))
}