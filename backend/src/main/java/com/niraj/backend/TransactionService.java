package com.niraj.backend;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TransactionService {

    private final ConcurrentSkipListMap<Long, Transaction> store = new ConcurrentSkipListMap<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public List<Transaction> findAll() {
        return new ArrayList<>(store.values());
    }

    public Transaction create(TransactionRequest request) {
        long id = nextId.getAndIncrement();
        Transaction transaction = toTransaction(id, request);
        store.put(id, transaction);
        return transaction;
    }

    public Transaction update(long id, TransactionRequest request) {
        Transaction transaction = toTransaction(id, request);
        if (store.replace(id, transaction) == null) {
            throw notFound(id);
        }
        return transaction;
    }

    public void delete(long id) {
        if (store.remove(id) == null) {
            throw notFound(id);
        }
    }

    private Transaction toTransaction(long id, TransactionRequest request) {
        return new Transaction(
                id,
                request.description(),
                request.amount(),
                request.type(),
                request.category(),
                request.date());
    }

    private ResponseStatusException notFound(long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction " + id + " not found");
    }
}