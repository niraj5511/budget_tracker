package com.niraj.backend;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RepaymentRequest(
        @Positive double amount,
        @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String date,
        @Size(max = 500) String note) {
}