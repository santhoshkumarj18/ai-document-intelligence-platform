package com.platform.backend.controller;

import com.platform.backend.dto.FieldUpdateRequest;
import com.platform.backend.dto.StatusUpdateRequest;
import com.platform.backend.model.Document;
import com.platform.backend.model.DocumentType;
import com.platform.backend.service.DocumentService;
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
            @RequestParam("documentType") DocumentType documentType,
            Authentication authentication
    ) throws IOException {
        // "who uploaded this" comes from the verified JWT, not a client-supplied
        // field — same defense-in-depth principle as the COMPLETE-status check
        // re-validating server-side instead of trusting the frontend.
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
            @RequestBody FieldUpdateRequest request) {
        return documentService.updateField(id, fieldId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Document> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        return documentService.updateStatus(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}