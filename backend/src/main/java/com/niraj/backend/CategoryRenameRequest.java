package com.niraj.backend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRenameRequest(@NotBlank @Size(max = 30) String name) {
}