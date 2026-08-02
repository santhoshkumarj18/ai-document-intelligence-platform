package com.platform.backend.dto;

import lombok.Data;

@Data
public class FieldUpdateRequest {
    private String value;
    private String changedBy;
}