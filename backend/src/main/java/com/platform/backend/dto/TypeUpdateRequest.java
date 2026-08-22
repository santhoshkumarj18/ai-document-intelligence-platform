package com.platform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TypeUpdateRequest {
    @NotBlank(message = "documentType is required")
    private String documentType;

    @NotBlank(message = "changedBy is required")
    private String changedBy;
}