package com.niraj.backend;

import java.util.List;

public record Loan(
        long id,
        String direction,
        String person,
        double amount,
        double repaid,
        String date,
        String dueDate,
        String note,
        List<Repayment> repayments) {
}