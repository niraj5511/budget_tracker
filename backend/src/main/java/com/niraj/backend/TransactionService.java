package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public List<Transaction> findAll(long userId) {
        return repository.findByUserIdOrderById(userId).stream().map(this::toTransaction).toList();
    }

    public Transaction create(long userId, TransactionRequest request) {
        TransactionEntity entity = new TransactionEntity();
        entity.setUserId(userId);
        apply(entity, request);
        return toTransaction(repository.save(entity));
    }

    public Transaction update(long userId, long id, TransactionRequest request) {
        TransactionEntity entity = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(id));
        apply(entity, request);
        return toTransaction(repository.save(entity));
    }

    public void delete(long userId, long id) {
        TransactionEntity entity = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(id));
        repository.delete(entity);
    }

    private void apply(TransactionEntity entity, TransactionRequest request) {
        entity.setDescription(request.description());
        entity.setAmount(request.amount());
        entity.setType(request.type());
        entity.setCategory(request.category());
        entity.setDate(request.date());
    }

    private Transaction toTransaction(TransactionEntity entity) {
        return new Transaction(
                entity.getId(),
                entity.getDescription(),
                entity.getAmount(),
                entity.getType(),
                entity.getCategory(),
                entity.getDate());
    }

    private ResponseStatusException notFound(long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction " + id + " not found");
    }
}