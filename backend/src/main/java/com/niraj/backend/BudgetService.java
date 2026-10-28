package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BudgetService {

    private final BudgetRepository repository;

    public BudgetService(BudgetRepository repository) {
        this.repository = repository;
    }

    public List<Budget> findAll(long userId) {
        return repository.findByUserIdOrderByCategory(userId).stream().map(this::toBudget).toList();
    }

    public Budget set(long userId, String category, double limit) {
        BudgetEntity entity = repository.findByUserIdAndCategory(userId, category)
                .orElseGet(() -> new BudgetEntity(userId, category, limit));
        entity.setLimit(limit);
        return toBudget(repository.save(entity));
    }

    public void delete(long userId, String category) {
        BudgetEntity entity = repository.findByUserIdAndCategory(userId, category)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No budget for " + category));
        repository.delete(entity);
    }

    private Budget toBudget(BudgetEntity entity) {
        return new Budget(entity.getCategory(), entity.getLimit());
    }
}