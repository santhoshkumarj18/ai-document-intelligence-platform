// src/utils/confidence.js

/**
 * Overall confidence for a document = average of its extracted fields' confidence.
 * Returns null if there are no fields yet (e.g. status UPLOADED, nothing extracted).
 */
export function getOverallConfidence(document) {
  const fields = document.extractedFields
  if (!fields || fields.length === 0) return null

  const sum = fields.reduce((acc, f) => acc + f.confidence, 0)
  return Math.round(sum / fields.length)
}

/**
 * A document "needs attention" in the queue/badge sense if any field
 * failed validation, or if status is explicitly NEEDS_REVIEW or FAILED.
 */
export function needsAttention(document) {
  if (document.status === 'NEEDS_REVIEW' || document.status === 'FAILED') return true
  return document.extractedFields.some((f) => f.validationFailed)
}