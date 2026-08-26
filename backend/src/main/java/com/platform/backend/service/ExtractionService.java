package com.platform.backend.service;

import com.platform.backend.model.Document;
import com.platform.backend.model.DocumentStatus;
import com.platform.backend.model.DocumentType;
import com.platform.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExtractionService {

    private final DocumentRepository documentRepository;
    private final AsyncExtractionWorker asyncExtractionWorker;

    // Synchronous kickoff: validates the document exists and is in a
    // startable state, flips it to EXTRACTING immediately, then hands off
    // to the async worker bean. Because asyncExtractionWorker is a
    // different Spring bean, the call below genuinely goes through the
    // proxy and @Async takes effect — returns right away instead of
    // blocking for the full extraction duration.
    public Optional<Document> startExtraction(String documentId) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return Optional.empty();
        }
        Document document = docOpt.get();

        if (document.getDocumentType() == DocumentType.UNCLASSIFIED) {
            throw new IllegalStateException(
                    "Document type must be set before extraction. Please classify this document first.");
        }

        if (document.getStatus() == DocumentStatus.EXTRACTING) {
            throw new IllegalStateException("Extraction is already in progress for this document.");
        }

        document.setStatus(DocumentStatus.EXTRACTING);
        document.setUpdatedAt(Instant.now());
        Document saved = documentRepository.save(document);

        asyncExtractionWorker.runExtractionAsync(documentId);

        return Optional.of(saved);
    }
}