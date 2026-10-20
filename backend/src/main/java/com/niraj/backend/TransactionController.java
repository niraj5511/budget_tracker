package com.niraj.backend;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final List<Transaction> transactions = new CopyOnWriteArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    @GetMapping
    public List<Transaction> getAll() {
        return transactions;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@Valid @RequestBody TransactionRequest request) {
        Transaction transaction = new Transaction(
                nextId.getAndIncrement(),
                request.description(),
                request.amount(),
                request.type(),
                request.category(),
                request.date());
        transactions.add(transaction);
        return transaction;
    }
}