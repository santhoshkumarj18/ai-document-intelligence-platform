package com.platform.backend.controller;

import com.platform.backend.dto.FieldUpdateRequest;
import com.platform.backend.dto.StatusUpdateRequest;
import com.platform.backend.dto.TypeUpdateRequest;
import com.platform.backend.model.Document;
import com.platform.backend.model.DocumentType;
import com.platform.backend.service.DocumentService;
import com.platform.backend.service.ExtractionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final ExtractionService extractionService;

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Document createDocument(@RequestBody Document document) {
        return documentService.createDocument(document);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false, defaultValue = "UNCLASSIFIED") DocumentType documentType,
            Authentication authentication) throws IOException {
        String uploadedBy = authentication.getName();
        Document saved = documentService.uploadDocument(file, documentType, uploadedBy);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getFile(@PathVariable String id) {
        return documentService.getFileResource(id)
                .map(resource -> {
                    String contentType = resource.getContentType() != null
                            ? resource.getContentType()
                            : MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(contentType))
                            .body((Resource) resource);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/fields/{fieldId}")
    public ResponseEntity<Document> updateField(
            @PathVariable String id,
            @PathVariable String fieldId,
            @Valid @RequestBody FieldUpdateRequest request) {
        return documentService.updateField(id, fieldId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Document> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return documentService.updateStatus(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/type")
    public ResponseEntity<Document> updateDocumentType(
            @PathVariable String id,
            @Valid @RequestBody TypeUpdateRequest request) {
        return documentService.updateDocumentType(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/extract")
    public ResponseEntity<Document> extractDocument(@PathVariable String id) throws Exception {
        return extractionService.extract(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        boolean deleted = documentService.deleteDocument(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}