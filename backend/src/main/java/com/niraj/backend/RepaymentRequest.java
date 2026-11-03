package com.niraj.backend;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

public record RepaymentRequest(
        @Positive double amount,
        @NotNull @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String date,
        @Size(max = 500) String note) {
}