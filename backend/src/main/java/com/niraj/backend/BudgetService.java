package com.niraj.backend;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BudgetService {

    private final BudgetRepository repository;

    public BudgetService(BudgetRepository repository) {
        this.repository = repository;
    }

    public List<Budget> findAll() {
        return repository.findAll(Sort.by("category")).stream().map(this::toBudget).toList();
    }

    public Budget set(String category, double limit) {
        return toBudget(repository.save(new BudgetEntity(category, limit)));
    }

    public void delete(String category) {
        if (!repository.existsById(category)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No budget for " + category);
        }
        repository.deleteById(category);
    }

    private Budget toBudget(BudgetEntity entity) {
        return new Budget(entity.getCategory(), entity.getLimit());
    }
}