package com.niraj.backend;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // The category a new transaction starts with. Empty means "Other".
    @Column(name = "default_expense_category")
    private String defaultExpenseCategory;

    @Column(name = "default_income_category")
    private String defaultIncomeCategory;

    protected UserEntity() {
    }

    public UserEntity(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    
    public String getDefaultExpenseCategory() { return defaultExpenseCategory; }
    public void setDefaultExpenseCategory(String name) { this.defaultExpenseCategory = name; }

    public String getDefaultIncomeCategory() { return defaultIncomeCategory; }
    public void setDefaultIncomeCategory(String name) { this.defaultIncomeCategory = name; }
}