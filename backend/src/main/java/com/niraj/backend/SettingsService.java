package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SettingsService {

    private final UserRepository users;
    private final CategoryRepository categories;

    public SettingsService(UserRepository users, CategoryRepository categories) {
        this.users = users;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public Settings get(long userId) {
        return toSettings(find(userId));
    }

    @Transactional
    public Settings update(long userId, SettingsRequest request) {
        UserEntity user = find(userId);
        String expense = clean(request.defaultExpenseCategory());
        String income = clean(request.defaultIncomeCategory());
        check(userId, "expense", expense);
        check(userId, "income", income);

        user.setDefaultExpenseCategory(expense);
        user.setDefaultIncomeCategory(income);
        users.save(user);
        return toSettings(user);
    }

    private UserEntity find(long userId) {
        // Valid token but the user no longer exists: 401 makes the frontend log out.
        return users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String clean(String name) {
        if (name == null) return null;
        String trimmed = name.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // A default must be a built-in category or one of the user's own, for that type.
    private void check(long userId, String type, String name) {
        if (name == null) return;
        List<String> defaults = type.equals("income")
                ? CategoryService.INCOME_DEFAULTS
                : CategoryService.EXPENSE_DEFAULTS;
        boolean known = defaults.contains(name)
                || categories.findByUserIdAndType(userId, type).stream()
                        .anyMatch(c -> c.getName().equals(name));
        if (!known) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown " + type + " category");
        }
    }

    private Settings toSettings(UserEntity user) {
        return new Settings(user.getDefaultExpenseCategory(), user.getDefaultIncomeCategory());
    }
}