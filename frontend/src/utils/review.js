// src/utils/review.js

/**
 * Flattens extractedFields across all documents into a single worklist,
 * including only fields that failed validation or fell below the
 * design system's "low/failed" confidence threshold (<70%).
 * Sorted lowest confidence first — the review queue always works
 * through the worst offenders first.
 */
export function getFlaggedFields(documents) {
  const flagged = []
  documents.forEach((doc) => {
    doc.extractedFields.forEach((field) => {
      if (field.validationFailed || field.confidence < 70) {
        flagged.push({
          ...field,
          documentId: doc.id,
          documentFilename: doc.filename,
        })
      }
    })
  })
  return flagged.sort((a, b) => a.confidence - b.confidence)
}