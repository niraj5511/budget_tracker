package com.niraj.backend;

public record Loan(
        long id,
        String direction,
        String person,
        double amount,
        String date,
        String dueDate,
        String note) {
}