package com.niraj.backend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record TransactionRequest(
        @NotBlank String description,
        @Positive double amount,
        @Pattern(regexp = "income|expense") String type,
        @NotBlank String category,
        @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String date) {
}