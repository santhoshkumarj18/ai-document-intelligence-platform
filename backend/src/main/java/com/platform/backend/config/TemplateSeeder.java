package com.platform.backend.config;

import com.platform.backend.model.DocumentTemplate;
import com.platform.backend.model.DocumentType;
import com.platform.backend.model.FieldType;
import com.platform.backend.model.TemplateField;
import com.platform.backend.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TemplateSeeder implements CommandLineRunner {

    private final TemplateRepository templateRepository;

    @Override
    public void run(String... args) {
        seedIfMissing(DocumentType.INVOICE, List.of(
                TemplateField.builder().key("invoiceNumber").label("Invoice Number").type(FieldType.TEXT).required(true).build(),
                TemplateField.builder().key("vendor").label("Vendor").type(FieldType.TEXT).required(true).build(),
                TemplateField.builder().key("invoiceDate").label("Invoice Date").type(FieldType.DATE).required(true).build(),
                TemplateField.builder().key("dueDate").label("Due Date").type(FieldType.DATE).required(false).build(),
                TemplateField.builder().key("total").label("Total").type(FieldType.CURRENCY).required(true).build()
        ));

        seedIfMissing(DocumentType.CONTRACT, List.of(
                TemplateField.builder().key("effectiveDate").label("Effective Date").type(FieldType.DATE).required(true).build(),
                TemplateField.builder().key("parties").label("Parties").type(FieldType.TEXT).required(true).build(),
                TemplateField.builder().key("term").label("Term").type(FieldType.TEXT).required(false).build(),
                TemplateField.builder().key("value").label("Contract Value").type(FieldType.CURRENCY).required(false).build()
        ));
    }

    private void seedIfMissing(DocumentType type, List<TemplateField> fields) {
        if (templateRepository.findByDocumentType(type).isPresent()) {
            return;
        }
        DocumentTemplate template = DocumentTemplate.builder()
                .documentType(type)
                .fields(fields)
                .build();
        templateRepository.save(template);
    }
}