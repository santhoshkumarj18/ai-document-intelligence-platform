package com.platform.backend.repository;

import com.platform.backend.model.DocumentTemplate;
import com.platform.backend.model.DocumentType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TemplateRepository extends MongoRepository<DocumentTemplate, String> {
    Optional<DocumentTemplate> findByDocumentType(DocumentType documentType);
}