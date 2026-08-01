package com.platform.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedField {
    private String id;
    private String label;
    private String value;
    private int confidence;
    private FieldType type;
    private boolean validationFailed;
    private String validationMessage;
}