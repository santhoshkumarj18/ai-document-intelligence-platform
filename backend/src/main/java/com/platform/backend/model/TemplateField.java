package com.platform.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateField {
    private String key;      // stable identifier, e.g. "invoiceNumber"
    private String label;    // display name, e.g. "Invoice Number"
    private FieldType type;  // reuses your existing text|currency|date|number enum
    private boolean required;
}