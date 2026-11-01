package com.niraj.backend;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ImportRequest(
        @NotNull @Size(max = 10000) List<@Valid @NotNull TransactionRequest> transactions,
        @NotNull @Size(max = 1000) Map<@NotBlank String, @NotNull @Positive Double> budgets) {
}