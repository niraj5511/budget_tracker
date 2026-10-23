package com.niraj.backend;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentSkipListMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BudgetService {

    private final ConcurrentSkipListMap<String, Double> store = new ConcurrentSkipListMap<>();

    public List<Budget> findAll() {
        List<Budget> result = new ArrayList<>();
        store.forEach((category, limit) -> result.add(new Budget(category, limit)));
        return result;
    }

    public Budget set(String category, double limit) {
        store.put(category, limit);
        return new Budget(category, limit);
    }

    public void delete(String category) {
        if (store.remove(category) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No budget for " + category);
        }
    }
}