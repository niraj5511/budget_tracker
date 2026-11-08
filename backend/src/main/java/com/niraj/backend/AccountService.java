package com.niraj.backend;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountService {

    private final UserRepository users;
    private final TransactionRepository transactions;
    private final BudgetRepository budgets;
    private final LoanRepository loans;
    private final RepaymentRepository repayments;
    private final CategoryRepository categories;
    private final PasswordEncoder encoder;
    private final LoginAttemptLimiter limiter;

    public AccountService(UserRepository users, TransactionRepository transactions,
            BudgetRepository budgets, LoanRepository loans, RepaymentRepository repayments,
            CategoryRepository categories,
            PasswordEncoder encoder, LoginAttemptLimiter limiter) {
        this.users = users;
        this.transactions = transactions;
        this.budgets = budgets;
        this.loans = loans;
        this.repayments = repayments;
        this.categories = categories;
        this.encoder = encoder;
        this.limiter = limiter;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        UserEntity user = verify(userId, request.currentPassword());
        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);
    }

    // One database transaction: if anything throws, nothing is deleted.
    @Transactional
    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        verify(userId, request.password());
        repayments.deleteAllForUser(userId);
        loans.deleteAllForUser(userId);
        transactions.deleteAllForUser(userId);
        budgets.deleteAllForUser(userId);
        categories.deleteAllForUser(userId);
        users.deleteById(userId);
    }

    // Finds the user and checks the password. Failures count in the login limiter.
    private UserEntity verify(Long userId, String password) {
        // Valid token but the user no longer exists: 401 makes the frontend log out.
        UserEntity user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String email = user.getEmail();
        if (limiter.isLocked(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts");
        }
        if (!encoder.matches(password, user.getPasswordHash())) {
            limiter.recordFailure(email);
            // 403, not 401, so the frontend does not treat it as an expired login.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Password is wrong");
        }
        limiter.recordSuccess(email);
        return user;
    }
}