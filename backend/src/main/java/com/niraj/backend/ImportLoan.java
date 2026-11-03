package com.niraj.backend;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ImportLoan(
        @NotNull @Pattern(regexp = "lent|borrowed") String direction,
        @NotBlank @Size(max = 100) String person,
        @Positive double amount,
        @NotNull @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String date,
        @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String dueDate,
        @Size(max = 500) String note,
        @NotNull @Size(max = 1000) List<@Valid @NotNull RepaymentRequest> repayments) {
}