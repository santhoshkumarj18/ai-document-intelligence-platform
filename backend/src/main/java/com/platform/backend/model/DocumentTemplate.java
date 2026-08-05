package com.platform.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@org.springframework.data.mongodb.core.mapping.Document(collection = "document_templates")
public class DocumentTemplate {
    @Id
    private String id;
    private DocumentType documentType;

    @Builder.Default
    private List<TemplateField> fields = List.of();
}