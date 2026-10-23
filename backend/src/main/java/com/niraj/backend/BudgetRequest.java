package com.niraj.backend;

import jakarta.validation.constraints.Positive;

public record BudgetRequest(@Positive double limit) {
}