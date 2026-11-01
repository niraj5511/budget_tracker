package com.niraj.backend;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final ImportService service;

    public ImportController(ImportService service) {
        this.service = service;
    }

    @PostMapping
    public ImportService.ImportResult replaceAll(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ImportRequest request) {
        return service.replaceAll(Long.parseLong(jwt.getSubject()), request);
    }
}