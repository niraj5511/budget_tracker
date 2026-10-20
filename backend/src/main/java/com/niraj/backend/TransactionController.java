package com.niraj.backend;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final List<Transaction> transactions = List.of(
            new Transaction(1, "Salary", 50000, "income", "Salary", "2026-10-01"),
            new Transaction(2, "Groceries", 3200, "expense", "Food", "2026-10-03"));

    @GetMapping
    public List<Transaction> getAll() {
        return transactions;
    }
}