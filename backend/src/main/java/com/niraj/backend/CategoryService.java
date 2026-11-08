package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoryService {

    static final int MAX_PER_TYPE = 30;

    // The built-in categories. Keep in step with frontend/src/data/categories.js.
    static final List<String> INCOME_DEFAULTS =
            List.of("Salary", "Freelance", "Business", "Investment", "Gift", "Other");
    static final List<String> EXPENSE_DEFAULTS =
            List.of("Food", "Rent", "Transport", "Utilities", "Shopping", "Health",
                    "Entertainment", "Education", "Other");

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<Category> findAll(long userId) {
        return repository.findByUserIdOrderByTypeAscNameAsc(userId).stream()
                .map(this::toCategory).toList();
    }

    public Category create(long userId, CategoryRequest request) {
        String type = request.type();
        String name = request.name().trim();

        List<CategoryEntity> existing = repository.findByUserIdAndType(userId, type);
        if (existing.size() >= MAX_PER_TYPE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "At most " + MAX_PER_TYPE + " custom categories");
        }
        if (isTaken(type, name, existing)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }
        return toCategory(repository.save(new CategoryEntity(userId, type, name)));
    }

    // A name is taken if it matches a built-in or a custom one of the same type, ignoring case.
    private boolean isTaken(String type, String name, List<CategoryEntity> existing) {
        List<String> defaults = type.equals("income") ? INCOME_DEFAULTS : EXPENSE_DEFAULTS;
        return defaults.stream().anyMatch(d -> d.equalsIgnoreCase(name))
                || existing.stream().anyMatch(c -> c.getName().equalsIgnoreCase(name));
    }

    private Category toCategory(CategoryEntity entity) {
        return new Category(entity.getId(), entity.getType(), entity.getName());
    }
}