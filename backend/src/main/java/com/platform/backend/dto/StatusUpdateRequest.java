package com.platform.backend.dto;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private String status;
    private String changedBy;
}