package com.platform.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // optional; defaults to "REVIEWER" if omitted
}