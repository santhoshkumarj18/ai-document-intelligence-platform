package com.platform.backend.controller;

import com.platform.backend.model.Document;
import com.platform.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}