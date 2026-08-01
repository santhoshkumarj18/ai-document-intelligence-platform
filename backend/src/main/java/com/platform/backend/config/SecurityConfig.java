package com.platform.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * TEMPORARY: opens all /api/** endpoints with no authentication so we can
 * build and test the Document Controller/Service layer in isolation.
 * This MUST be replaced with real JWT-based authentication before any
 * endpoint here is considered production-ready — tracked as the next
 * Phase 0 task, not forgotten scope.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }
}