package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaction> getAll(@AuthenticationPrincipal Jwt jwt) {
        return service.findAll(userId(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TransactionRequest request) {
        return service.create(userId(jwt), request);
    }

    @PutMapping("/{id}")
    public Transaction update(@AuthenticationPrincipal Jwt jwt, @PathVariable long id,
            @Valid @RequestBody TransactionRequest request) {
        return service.update(userId(jwt), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        service.delete(userId(jwt), id);
    }

    // The token's subject is the user's id, set when the token is created at login.
    private long userId(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }
}