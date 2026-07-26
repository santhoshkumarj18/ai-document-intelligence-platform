# API Contract — AI Document Intelligence Platform

**Status**: FROZEN as of this document's creation. This is the contract the frontend
(built against mock data) and the backend (Spring Boot + MongoDB, built next) both
must honor. Changes after this point should be deliberate and versioned, not silent.

This contract is derived directly from `frontend/src/mock/mockDocuments.js`, which
was built out first and validated against 5 working screens before being frozen here.

---

## 1. Enums

### DocumentType (fixed enum — extend deliberately, not freely)

**Values:** `INVOICE`, `RECEIPT`, `CONTRACT`, `IDENTITY`, `RESUME`, `CERTIFICATE`

Adding a new type requires: a new enum value here, a corresponding `DocumentTemplate`
entry (field schema + validation rules), and no other code changes — this is the
"document-agnostic by design" principle from the blueprint (Section 1.1).

### DocumentStatus (pipeline lifecycle — see blueprint Section 1.4)

**Values:** `UPLOADED`, `EXTRACTED`, `VALIDATED`, `NEEDS_REVIEW`, `COMPLETE`, `FAILED`

Flow: `UPLOADED → EXTRACTED → VALIDATED → COMPLETE`, or `EXTRACTED → NEEDS_REVIEW → COMPLETE`.
`FAILED` is terminal and reachable from any stage if processing cannot continue.

### FieldType

**Values:** `text`, `currency`, `date`, `number`

### AuditAction

**Values:** `UPLOADED`, `FIELD_EDITED`, `APPROVED`, `REJECTED`

### Confidence semantics (drives ConfidenceIndicator rendering, see design system)

- Confidence **>= 90** → high confidence (solid, filled)
- Confidence **70–89** → medium confidence (solid, hollow)
- Confidence **< 70**, or `validationFailed = true` → low/failed (dashed, hollow)

Confidence is always an integer 0–100 (not a 0–1 decimal).

---
---

## 2. Entities

### Document
| Field | Type | Notes |
|---|---|---|
| id | string | Server-generated unique ID |
| filename | string | Original uploaded filename |
| documentType | DocumentType | Set after classification; `null`/absent until then |
| status | DocumentStatus | |
| fileType | string | File extension, e.g. `"pdf"` |
| fileUrl | string | URL to retrieve the stored original file |
| uploadedBy | string | User ID |
| uploadedAt | string (ISO 8601) | |
| updatedAt | string (ISO 8601) | Updated on every status change or field edit |
| summary | string \| null | AI-generated; null until status reaches VALIDATED+ |
| anomalies | string[] | Empty array if none |
| extractedFields | ExtractedField[] | Empty array before extraction |
| auditLog | AuditEntry[] | Always has at least one entry (the upload event) |

### ExtractedField
| Field | Type | Notes |
|---|---|---|
| id | string | |
| label | string | Human-readable field name, e.g. "Invoice Number" |
| value | string | Always a string, even for currency/number/date — formatting is a display concern |
| confidence | integer (0–100) | |
| type | FieldType | |
| validationFailed | boolean | True if a rule-based check failed independent of confidence |
| validationMessage | string \| null | Human-readable reason, shown only if validationFailed |

### AuditEntry
| Field | Type | Notes |
|---|---|---|
| id | string | |
| documentId | string | |
| action | AuditAction | |
| changedBy | string | User display name |
| timestamp | string (ISO 8601) | |
| fieldLabel | string \| null | Only present for FIELD_EDITED |
| previousValue | string \| null | Only present for FIELD_EDITED |
| newValue | string \| null | Only present for FIELD_EDITED |

**Server behavior**: the backend automatically creates an AuditEntry for every
UPLOADED / FIELD_EDITED / APPROVED / REJECTED action — the frontend never
constructs or sends AuditEntry objects directly. This keeps the audit trail
authoritative and tamper-proof (Phase 3 requirement, blueprint Section 2).

### User
| Field | Type | Notes |
|---|---|---|
| id | string | |
| name | string | |
| email | string | |
| role | string | e.g. `"reviewer"` — not yet enumerated, revisit when roles expand |

---

## 3. Derived values (computed, never stored)

These are computed client-side today (`src/utils/confidence.js`,
`src/utils/analytics.js`) and must be recomputed server-side identically once
real data exists — never persisted as their own stored fields, to avoid drift:

- **Overall document confidence** = average of `extractedFields[].confidence`
- **needsAttention** = `status IN (NEEDS_REVIEW, FAILED)` OR any field has `validationFailed = true`
- **% requiring review**, **avg processing time**, **volume by day** — all analytics
  aggregates, computed fresh from the document list, not cached fields.

---

## 4. Expected REST endpoints (for Phase 1–3 backend work)

These aren't finalized route specs, just the operations the frontend already
depends on via `DocumentsContext` — a starting checklist for the Spring Boot phase:

| Operation | Frontend Context method | Likely endpoint |
|---|---|---|
| List all documents | `documents` (from context) | `GET /api/documents` |
| Get one document | `getDocumentById(id)` | `GET /api/documents/{id}` |
| Create (upload) | `addDocument(doc)` | `POST /api/documents` (multipart) |
| Update document (status, etc.) | `updateDocument(id, updates)` | `PATCH /api/documents/{id}` |
| Update one field | `updateField(docId, fieldId, updates)` | `PATCH /api/documents/{id}/fields/{fieldId}` |

---

## 5. Known gaps this contract does NOT yet resolve

Flagging honestly rather than pretending these are solved:
- Auth/user context is currently hardcoded (`mockUser`) — real JWT-based user
  identity is a Phase 0 backend task, not addressed here.
- `DocumentTemplate` (per-type field schemas + validation rules) exists in the
  blueprint's data model but has no mock representation yet — needed once
  the backend implements real template-driven extraction.
- Pagination is not addressed — `GET /api/documents` currently implies
  "return everything," fine for prototype scale, not for production volume.