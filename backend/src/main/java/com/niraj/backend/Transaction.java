package com.niraj.backend;

public record Transaction(
        long id,
        String description,
        double amount,
        String type,
        String category,
        String date) {
}