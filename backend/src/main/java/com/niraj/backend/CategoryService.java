package com.niraj.backend;

import java.util.List;
import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoryService {

    static final int MAX_PER_TYPE = 30;
    static final String DEFAULT_CATEGORY = "Other";

    // The built-in categories. Keep in step with frontend/src/data/categories.js.
    static final List<String> INCOME_DEFAULTS = List.of("Salary", "Freelance", "Business", "Investment", "Gift",
            "Other");
    static final List<String> EXPENSE_DEFAULTS = List.of("Food", "Rent", "Transport", "Utilities", "Shopping", "Health",
            "Entertainment", "Education", "Other");

    private final CategoryRepository repository;
    private final TransactionRepository transactions;
    private final BudgetRepository budgets;

    public CategoryService(CategoryRepository repository, TransactionRepository transactions,
            BudgetRepository budgets) {
        this.repository = repository;
        this.transactions = transactions;
        this.budgets = budgets;
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

    // One database transaction: the category, its transactions and its budget
    // change together.
    @Transactional
    public Category rename(long userId, long id, CategoryRenameRequest request) {
        CategoryEntity category = find(userId, id);
        String type = category.getType();
        String oldName = category.getName();
        String newName = request.name().trim();

        List<CategoryEntity> others = repository.findByUserIdAndType(userId, type).stream()
                .filter(c -> !c.getId().equals(id)).toList();
        if (isTaken(type, newName, others)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }
        boolean isExpense = type.equals("expense");
        if (isExpense && !newName.equals(oldName)
                && budgets.findByUserIdAndCategory(userId, newName).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A budget already uses that name");
        }

        category.setName(newName);
        repository.save(category);
        if (!newName.equals(oldName)) {
            transactions.renameCategory(userId, type, oldName, newName);
            if (isExpense) {
                budgets.renameCategory(userId, oldName, newName);
            }
        }
        return toCategory(category);
    }

    // Transactions are kept: they move to "Other". The category's budget is
    // removed.
    @Transactional
    public void delete(long userId, long id) {
        CategoryEntity category = find(userId, id);
        String type = category.getType();
        String name = category.getName();

        transactions.renameCategory(userId, type, name, DEFAULT_CATEGORY);
        if (type.equals("expense")) {
            budgets.deleteForCategory(userId, name);
        }
        repository.delete(category);
    }

    // Used by import. Replaces all of the user's categories with the given ones,
    // under the same rules as create. Runs inside the import's database
    // transaction.
    @Transactional
    public int replaceAll(long userId, List<CategoryRequest> items) {
        repository.deleteAllForUser(userId);

        List<CategoryEntity> saved = new ArrayList<>();
        for (CategoryRequest item : items) {
            String name = item.name().trim();
            List<CategoryEntity> sameType = saved.stream()
                    .filter(c -> c.getType().equals(item.type())).toList();
            if (sameType.size() >= MAX_PER_TYPE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "At most " + MAX_PER_TYPE + " custom categories");
            }
            if (isTaken(item.type(), name, sameType)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Duplicate or built-in category: " + name);
            }
            saved.add(new CategoryEntity(userId, item.type(), name));
        }
        repository.saveAll(saved);
        return saved.size();
    }

    private CategoryEntity find(long userId, long id) {
        return repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No such category"));
    }

    // A name is taken if it matches a built-in or a custom one of the same type,
    // ignoring case.
    private boolean isTaken(String type, String name, List<CategoryEntity> existing) {
        List<String> defaults = type.equals("income") ? INCOME_DEFAULTS : EXPENSE_DEFAULTS;
        return defaults.stream().anyMatch(d -> d.equalsIgnoreCase(name))
                || existing.stream().anyMatch(c -> c.getName().equalsIgnoreCase(name));
    }

    private Category toCategory(CategoryEntity entity) {
        return new Category(entity.getId(), entity.getType(), entity.getName());
    }
}