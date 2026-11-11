package com.niraj.backend;

import jakarta.validation.constraints.Size;

// A null (or blank) name clears that default, which means "Other".
public record SettingsRequest(
        @Size(max = 30) String defaultExpenseCategory,
        @Size(max = 30) String defaultIncomeCategory) {
}