package com.platform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "changedBy is required")
    private String changedBy;
}