package com.platform.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum FieldType {
    @JsonProperty("text") TEXT,
    @JsonProperty("currency") CURRENCY,
    @JsonProperty("date") DATE,
    @JsonProperty("number") NUMBER
}