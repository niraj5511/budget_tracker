package com.niraj.backend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotNull @Pattern(regexp = "income|expense") String type,
        @NotBlank @Size(max = 30) String name) {
}