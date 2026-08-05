package com.platform.backend.service;

import com.platform.backend.dto.FieldUpdateRequest;
import com.platform.backend.dto.StatusUpdateRequest;
import com.platform.backend.model.AuditAction;
import com.platform.backend.model.AuditEntry;
import com.platform.backend.model.Document;
import com.platform.backend.model.DocumentStatus;
import com.platform.backend.model.DocumentType;
import com.platform.backend.model.ExtractedField;
import com.platform.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Optional<Document> getDocumentById(String id) {
        return documentRepository.findById(id);
    }

    public Document createDocument(Document document) {
        return documentRepository.save(document);
    }

    public Document uploadDocument(MultipartFile file, DocumentType documentType, String uploadedBy) throws IOException {
        String fileId = storageService.store(file);

        Document document = Document.builder()
                .filename(file.getOriginalFilename())
                .documentType(documentType)
                .status(DocumentStatus.UPLOADED)
                .fileType(extractFileType(file))
                .fileId(fileId)
                .uploadedBy(uploadedBy)
                .uploadedAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Document saved = documentRepository.save(document);

        // fileUrl points at our own serving endpoint, not a third-party URL,
        // and needs the generated id — hence the second save.
        saved.setFileUrl("/api/documents/" + saved.getId() + "/file");
        return documentRepository.save(saved);
    }

    public Optional<GridFsResource> getFileResource(String documentId) {
        return documentRepository.findById(documentId)
                .map(Document::getFileId)
                .filter(fileId -> fileId != null && !fileId.isBlank())
                .flatMap(storageService::retrieve);
    }

    private String extractFileType(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        }
        return "unknown";
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

    public Optional<Document> updateStatus(String documentId, StatusUpdateRequest request) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return Optional.empty();
        }

        Document document = docOpt.get();

        DocumentStatus newStatus;
        try {
            newStatus = DocumentStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + request.getStatus());
        }

        if (newStatus == DocumentStatus.COMPLETE) {
            boolean hasUnresolvedField = document.getExtractedFields().stream()
                    .anyMatch(ExtractedField::isValidationFailed);
            if (hasUnresolvedField) {
                throw new IllegalStateException("Cannot mark document COMPLETE while unresolved fields remain.");
            }
        }

        document.setStatus(newStatus);
        document.setUpdatedAt(Instant.now());

        String changedBy = request.getChangedBy() != null ? request.getChangedBy() : "Unknown reviewer";
        AuditAction action = newStatus == DocumentStatus.COMPLETE ? AuditAction.APPROVED : AuditAction.REJECTED;

        AuditEntry entry = AuditEntry.builder()
                .id(UUID.randomUUID().toString())
                .documentId(documentId)
                .action(action)
                .changedBy(changedBy)
                .timestamp(Instant.now())
                .build();

        List<AuditEntry> auditLog = new ArrayList<>(document.getAuditLog());
        auditLog.add(entry);
        document.setAuditLog(auditLog);

        Document saved = documentRepository.save(document);
        return Optional.of(saved);
    }
}