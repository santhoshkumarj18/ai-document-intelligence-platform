// src/mock/mockDocuments.js

/**
 * Document.status lifecycle (from blueprint Section 1.4):
 * UPLOADED -> EXTRACTED -> VALIDATED -> COMPLETE
 *                       -> NEEDS_REVIEW -> COMPLETE
 * FAILED is an edge case: extraction/validation could not proceed at all
 * (e.g. unreadable file) — distinct from NEEDS_REVIEW, which has data, just low-confidence data.
 */

export const mockUser = {
  id: 'user_1',
  name: 'Santhosh Kumar',
  email: 'santhosh@example.com',
  role: 'reviewer',
}

/**
 * ExtractedField
 * - confidence: 0-100 integer
 * - validationFailed: true when a RULE failed (e.g. totals don't match),
 *   independent of the AI's confidence score — a field can be 99% confident
 *   and still fail a business rule.
 */
function field(id, label, value, confidence, type = 'text', validationFailed = false, validationMessage = null) {
  return { id, label, value, confidence, type, validationFailed, validationMessage }
}

/**
 * AuditEntry — one entry per human action on a document.
 * action: 'UPLOADED' | 'FIELD_EDITED' | 'APPROVED' | 'REJECTED'
 */
function auditEntry(id, documentId, action, changedBy, timestamp, fieldLabel = null, previousValue = null, newValue = null) {
  return { id, documentId, action, changedBy, timestamp, fieldLabel, previousValue, newValue }
}

export const mockDocuments = [
  {
    id: 'doc_1',
    filename: 'invoice_acme_q3.pdf',
    documentType: 'invoice',
    status: 'COMPLETE',
    fileType: 'pdf',
    fileUrl: 'https://picsum.photos/seed/doc1/800/1000',
    uploadedBy: 'user_1',
    uploadedAt: '2026-07-20T09:12:00Z',
    updatedAt: '2026-07-20T09:15:00Z',
    summary: 'Invoice from Acme Supplies for Q3 office equipment, totaling $4,230.00, due within 30 days. All line items reconcile with the stated total.',
    anomalies: [],
    extractedFields: [
      field('f1', 'Invoice Number', 'INV-88213', 98, 'text'),
      field('f2', 'Vendor', 'Acme Supplies Inc.', 97, 'text'),
      field('f3', 'Total', '$4,230.00', 96, 'currency'),
      field('f4', 'Due Date', '2026-08-19', 95, 'date'),
    ],
    auditLog: [
      auditEntry('a1', 'doc_1', 'UPLOADED', 'Santhosh Kumar', '2026-07-20T09:12:00Z'),
      auditEntry('a2', 'doc_1', 'APPROVED', 'Santhosh Kumar', '2026-07-20T09:15:00Z'),
    ],
  },

  {
    id: 'doc_2',
    filename: 'contract_vendor_nda.pdf',
    documentType: 'contract',
    status: 'NEEDS_REVIEW',
    fileType: 'pdf',
    fileUrl: 'https://picsum.photos/seed/doc2/800/1000',
    uploadedBy: 'user_1',
    uploadedAt: '2026-07-24T14:02:00Z',
    updatedAt: '2026-07-24T14:05:00Z',
    summary: 'Mutual NDA between two parties, standard confidentiality terms, but the effective date field could not be extracted with confidence.',
    anomalies: ['Effective date is ambiguous — two conflicting dates appear in the document.'],
    extractedFields: [
      field('f5', 'Party A', 'Northwind Traders LLC', 94, 'text'),
      field('f6', 'Party B', 'Contoso Manufacturing', 91, 'text'),
      field('f7', 'Effective Date', '2026-01-??', 52, 'date', true, 'Two different dates found in document — verify manually.'),
      field('f8', 'Term Length', '2 years', 88, 'text'),
    ],
    auditLog: [
      auditEntry('a3', 'doc_2', 'UPLOADED', 'Santhosh Kumar', '2026-07-24T14:02:00Z'),
    ],
  },

  {
    id: 'doc_3',
    filename: 'receipt_office_supplies.jpg',
    documentType: 'receipt',
    status: 'VALIDATED',
    fileType: 'jpg',
    fileUrl: 'https://picsum.photos/seed/doc3/800/1000',
    uploadedBy: 'user_1',
    uploadedAt: '2026-07-25T10:30:00Z',
    updatedAt: '2026-07-25T10:31:00Z',
    summary: null,
    anomalies: [],
    extractedFields: [
      field('f9', 'Merchant', 'Staples', 93, 'text'),
      field('f10', 'Total', '$58.42', 95, 'currency'),
      field('f11', 'Date', '2026-07-24', 92, 'date'),
    ],
    auditLog: [
      auditEntry('a4', 'doc_3', 'UPLOADED', 'Santhosh Kumar', '2026-07-25T10:30:00Z'),
    ],
  },

  {
    id: 'doc_4',
    filename: 'resume_jdoe.pdf',
    documentType: 'resume',
    status: 'EXTRACTED',
    fileType: 'pdf',
    fileUrl: 'https://picsum.photos/seed/doc4/800/1000',
    uploadedBy: 'user_1',
    uploadedAt: '2026-07-25T16:45:00Z',
    updatedAt: '2026-07-25T16:46:00Z',
    summary: null,
    anomalies: [],
    extractedFields: [
      field('f12', 'Candidate Name', 'Jordan Doe', 97, 'text'),
      field('f13', 'Years Experience', '6', 85, 'number'),
      field('f14', 'Email', 'jordan.doe@email.com', 99, 'text'),
    ],
    auditLog: [
      auditEntry('a5', 'doc_4', 'UPLOADED', 'Santhosh Kumar', '2026-07-25T16:45:00Z'),
    ],
  },

  {
    id: 'doc_5',
    filename: 'id_scan_blurry.png',
    documentType: 'identity',
    status: 'FAILED',
    fileType: 'png',
    fileUrl: 'https://picsum.photos/seed/doc5/800/1000',
    uploadedBy: 'user_1',
    uploadedAt: '2026-07-25T18:00:00Z',
    updatedAt: '2026-07-25T18:01:00Z',
    summary: null,
    anomalies: ['Image quality too low to extract any fields reliably.'],
    extractedFields: [],
    auditLog: [
      auditEntry('a6', 'doc_5', 'UPLOADED', 'Santhosh Kumar', '2026-07-25T18:00:00Z'),
    ],
  },

  {
    id: 'doc_6',
    filename: 'certificate_completion.pdf',
    documentType: 'certificate',
    status: 'UPLOADED',
    fileType: 'pdf',
    fileUrl: 'https://picsum.photos/seed/doc6/800/1000',
    uploadedBy: 'user_1',
    uploadedAt: '2026-07-26T08:00:00Z',
    updatedAt: '2026-07-26T08:00:00Z',
    summary: null,
    anomalies: [],
    extractedFields: [],
    auditLog: [
      auditEntry('a7', 'doc_6', 'UPLOADED', 'Santhosh Kumar', '2026-07-26T08:00:00Z'),
    ],
  },
]

export function getDocumentById(id) {
  return mockDocuments.find((d) => d.id === id) || null
}