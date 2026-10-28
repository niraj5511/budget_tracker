package com.niraj.backend;

public record LoginResponse(String token, UserResponse user) {
}