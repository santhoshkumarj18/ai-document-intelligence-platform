package com.platform.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.platform.backend.model.*;
import com.platform.backend.repository.DocumentRepository;
import com.platform.backend.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExtractionService {

    private static final int LOW_CONFIDENCE_THRESHOLD = 70;

    private final DocumentRepository documentRepository;
    private final TemplateRepository templateRepository;
    private final StorageService storageService;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

   public Optional<Document> extract(String documentId) throws Exception {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return Optional.empty();
        }
        Document document = docOpt.get();

        DocumentTemplate template = templateRepository.findByDocumentType(document.getDocumentType())
                .orElseThrow(() -> new IllegalStateException(
                        "No template configured for document type: " + document.getDocumentType()));

        GridFsResource fileResource = storageService.retrieve(document.getFileId())
                .orElseThrow(() -> new IllegalStateException(
                        "File not found in storage for document: " + documentId));

        byte[] fileBytes = fileResource.getInputStream().readAllBytes();
        String mimeType = fileResource.getContentType() != null ? fileResource.getContentType() : "application/pdf";

        JsonNode schema = buildSchema(template.getFields());
        String prompt = buildPrompt(document.getDocumentType(), template.getFields());

        JsonNode result = geminiClient.extractStructured(fileBytes, mimeType, prompt, schema);

        List<ExtractedField> extractedFields = new ArrayList<>();
        boolean anyLowConfidence = false;

        for (TemplateField templateField : template.getFields()) {
            JsonNode fieldResult = result.path(templateField.getKey());
            String value = fieldResult.path("value").asText("");
            int confidence = fieldResult.path("confidence").asInt(0);

            boolean validationFailed = confidence < LOW_CONFIDENCE_THRESHOLD;
            if (validationFailed) anyLowConfidence = true;

            extractedFields.add(ExtractedField.builder()
                    .id(templateField.getKey())
                    .label(templateField.getLabel())
                    .value(value)
                    .confidence(confidence)
                    .type(templateField.getType())
                    .validationFailed(validationFailed)
                    .validationMessage(validationFailed ? "Low confidence extraction — please verify." : null)
                    .build());
        }

        String summary = result.path("summary").asText("");

        // Gemini returns this as a JSON array of short strings, each describing
        // one flagged issue (math/consistency problems, suspicious-but-confident
        // values, or required fields missing despite the document appearing
        // complete). See buildSchema/buildPrompt for what Gemini is asked to
        // check. Falls back to an empty list if Gemini omits the field or
        // returns something unexpected, so a parsing hiccup here never breaks
        // extraction as a whole.
        List<String> anomalies = new ArrayList<>();
        JsonNode anomaliesNode = result.path("anomalies");
        if (anomaliesNode.isArray()) {
            for (JsonNode anomalyNode : anomaliesNode) {
                String anomalyText = anomalyNode.asText("");
                if (!anomalyText.isBlank()) {
                    anomalies.add(anomalyText);
                }
            }
        }

        document.setExtractedFields(extractedFields);
        document.setSummary(summary.isBlank() ? null : summary);
        document.setAnomalies(anomalies);
        document.setStatus(anyLowConfidence ? DocumentStatus.NEEDS_REVIEW : DocumentStatus.VALIDATED);
        document.setUpdatedAt(Instant.now());

        return Optional.of(documentRepository.save(document));
    }

    private JsonNode buildSchema(List<TemplateField> fields) {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = schema.putObject("properties");
        ArrayNode required = schema.putArray("required");

        ObjectNode summarySchema = properties.putObject("summary");
        summarySchema.put("type", "string");
        summarySchema.put("description",
                "A concise 1-2 sentence plain-language summary of what this document is and its key contents.");
        required.add("summary");

        // Array of short, plain-language strings, one per flagged issue. Kept
        // as a simple array of strings (not objects with severity/type) to
        // match the anomalies field type already on the Document model —
        // richer structure can be added later if needed.
        ObjectNode anomaliesSchema = properties.putObject("anomalies");
        anomaliesSchema.put("type", "array");
        anomaliesSchema.put("description",
                "A list of short descriptions of anything unusual or inconsistent found in the document. " +
                "Return an empty array if nothing seems wrong.");
        ObjectNode anomalyItemSchema = objectMapper.createObjectNode();
        anomalyItemSchema.put("type", "string");
        anomaliesSchema.set("items", anomalyItemSchema);
        required.add("anomalies");

        for (TemplateField field : fields) {
            ObjectNode fieldSchema = properties.putObject(field.getKey());
            fieldSchema.put("type", "object");
            ObjectNode fieldProps = fieldSchema.putObject("properties");

            ObjectNode valueSchema = fieldProps.putObject("value");
            valueSchema.put("type", "string");
            valueSchema.put("description", field.getLabel());

            ObjectNode confidenceSchema = fieldProps.putObject("confidence");
            confidenceSchema.put("type", "integer");
            confidenceSchema.put("minimum", 0);
            confidenceSchema.put("maximum", 100);
            confidenceSchema.put("description", "Confidence 0-100 that this value was read correctly from the document");

            ArrayNode fieldRequired = fieldSchema.putArray("required");
            fieldRequired.add("value");
            fieldRequired.add("confidence");

            required.add(field.getKey());
        }

        return schema;
    }

    private String buildPrompt(DocumentType documentType, List<TemplateField> fields) {
        StringBuilder sb = new StringBuilder();
        sb.append("This is a ").append(documentType).append(" document. ");
        sb.append("First, write a concise 1-2 sentence summary of what this document is ");
        sb.append("and its key contents, in plain language. ");
        sb.append("Then extract the following fields exactly as they appear in the document. ");
        sb.append("For each field, also estimate your confidence (0-100) that the extracted ");
        sb.append("value is correct and complete. If a field is not present in the document, ");
        sb.append("return an empty string for its value and a confidence of 0.\n\n");
        sb.append("Fields to extract:\n");
        for (TemplateField field : fields) {
            sb.append("- ").append(field.getKey()).append(" (").append(field.getLabel()).append(")\n");
        }
        sb.append("\nAlso check for anomalies and list each one as a short plain-language string ");
        sb.append("in the anomalies array. Specifically flag:\n");
        sb.append("- Internal inconsistencies, such as a due date earlier than the issue date, ");
        sb.append("or a total that doesn't match other amounts shown in the document.\n");
        sb.append("- Values that look structurally unusual even if you are confident you read them ");
        sb.append("correctly, such as a suspiciously round or zero total, or a date far outside a ");
        sb.append("plausible range for this type of document.\n");
        sb.append("- Required fields that appear genuinely missing or blank in the document itself, ");
        sb.append("as opposed to fields you simply had trouble reading.\n");
        sb.append("Return an empty array if you find nothing unusual. Do not invent anomalies just to fill the list.");
        return sb.toString();
    }
}