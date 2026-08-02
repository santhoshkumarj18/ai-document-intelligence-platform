package com.platform.backend.service;

import com.platform.backend.dto.FieldUpdateRequest;
import com.platform.backend.model.AuditAction;
import com.platform.backend.model.AuditEntry;
import com.platform.backend.model.Document;
import com.platform.backend.model.ExtractedField;
import com.platform.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Optional<Document> getDocumentById(String id) {
        return documentRepository.findById(id);
    }

    public Document createDocument(Document document) {
        return documentRepository.save(document);
    }

    public Optional<Document> updateField(String documentId, String fieldId, FieldUpdateRequest request) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return Optional.empty();
        }

        Document document = docOpt.get();

        List<ExtractedField> fields = new ArrayList<>(document.getExtractedFields());
        ExtractedField target = fields.stream()
                .filter(f -> f.getId().equals(fieldId))
                .findFirst()
                .orElse(null);

        if (target == null) {
            return Optional.empty();
        }

        String previousValue = target.getValue();
        target.setValue(request.getValue());
        target.setConfidence(100);
        target.setValidationFailed(false);
        target.setValidationMessage(null);

        document.setExtractedFields(fields);

        String changedBy = request.getChangedBy() != null ? request.getChangedBy() : "Unknown reviewer";

        AuditEntry entry = AuditEntry.builder()
                .id(UUID.randomUUID().toString())
                .documentId(documentId)
                .action(AuditAction.FIELD_EDITED)
                .changedBy(changedBy)
                .timestamp(Instant.now())
                .fieldLabel(target.getLabel())
                .previousValue(previousValue)
                .newValue(request.getValue())
                .build();

        List<AuditEntry> auditLog = new ArrayList<>(document.getAuditLog());
        auditLog.add(entry);
        document.setAuditLog(auditLog);

        document.setUpdatedAt(Instant.now());

        Document saved = documentRepository.save(document);
        return Optional.of(saved);
    }
}