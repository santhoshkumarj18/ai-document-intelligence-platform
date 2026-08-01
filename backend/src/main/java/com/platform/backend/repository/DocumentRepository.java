package com.platform.backend.repository;

import com.platform.backend.model.Document;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends MongoRepository<Document, String> {
    List<Document> findByStatus(String status);
    List<Document> findByDocumentType(String documentType);
}