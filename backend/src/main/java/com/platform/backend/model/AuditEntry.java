package com.platform.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEntry {
    private String id;
    private String documentId;
    private AuditAction action;
    private String changedBy;
    private Instant timestamp;
    private String fieldLabel;
    private String previousValue;
    private String newValue;
}