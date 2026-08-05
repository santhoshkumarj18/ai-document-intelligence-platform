package com.platform.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@org.springframework.data.mongodb.core.mapping.Document(collection = "documents")
public class Document {
    @Id
    private String id;
    private String filename;
    private DocumentType documentType;
    private DocumentStatus status;
    private String fileType;
    private String fileUrl;
    private String uploadedBy;
    private Instant uploadedAt;
    private Instant updatedAt;
    private String summary;
    private String fileId; // GridFS ObjectId (as String) — null for mock/legacy documents with only a fileUrl

    @Builder.Default
    private List<String> anomalies = List.of();

    @Builder.Default
    private List<ExtractedField> extractedFields = List.of();

    @Builder.Default
    private List<AuditEntry> auditLog = List.of();
}