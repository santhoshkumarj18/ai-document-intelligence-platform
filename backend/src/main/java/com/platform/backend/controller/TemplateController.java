package com.platform.backend.controller;

import com.platform.backend.model.DocumentTemplate;
import com.platform.backend.model.DocumentType;
import com.platform.backend.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateRepository templateRepository;

    @GetMapping
    public List<DocumentTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @GetMapping("/{documentType}")
    public ResponseEntity<DocumentTemplate> getByType(@PathVariable DocumentType documentType) {
        return templateRepository.findByDocumentType(documentType)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}