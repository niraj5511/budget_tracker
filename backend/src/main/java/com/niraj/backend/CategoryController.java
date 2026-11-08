package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Category> getAll(@AuthenticationPrincipal Jwt jwt) {
        return service.findAll(userId(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CategoryRequest request) {
        return service.create(userId(jwt), request);
    }

    private long userId(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }
}