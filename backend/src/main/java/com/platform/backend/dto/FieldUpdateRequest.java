package com.platform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FieldUpdateRequest {
    @NotBlank(message = "Value is required")
    private String value;

    @NotBlank(message = "changedBy is required")
    private String changedBy;
}