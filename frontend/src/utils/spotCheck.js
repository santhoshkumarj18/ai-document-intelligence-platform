// src/utils/spotCheck.js

const HIGH_CONFIDENCE_THRESHOLD = 90

// Deterministically picks one high-confidence, non-flagged field per document
// to nudge the reviewer toward spot-checking — countering the tendency to
// only scrutinize fields that are already flagged. Deterministic (hashed from
// the document id) rather than random on every render, so the same field
// stays selected while reviewing one document, but the selection varies
// across different documents for organic coverage over time.
export function getSpotCheckFieldId(document) {
  if (!document?.extractedFields?.length) return null

  const eligible = document.extractedFields
    .filter((f) => !f.validationFailed && f.confidence >= HIGH_CONFIDENCE_THRESHOLD)
    .map((f) => f.id)
    .sort()

  if (eligible.length === 0) return null

  let hash = 0
  for (let i = 0; i < document.id.length; i++) {
    hash = (hash * 31 + document.id.charCodeAt(i)) >>> 0
  }

  return eligible[hash % eligible.length]
}