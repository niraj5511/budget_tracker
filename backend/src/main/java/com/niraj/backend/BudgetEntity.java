package com.niraj.backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "budgets", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "category" }))
public class BudgetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String category;

    // "limit" is a reserved word in SQL, so the column has a different name.
    @Column(name = "limit_amount", nullable = false)
    private double limit;

    protected BudgetEntity() {
    }

    public BudgetEntity(Long userId, String category, double limit) {
        this.userId = userId;
        this.category = category;
        this.limit = limit;
    }

    public String getCategory() { return category; }

    public double getLimit() { return limit; }
    public void setLimit(double limit) { this.limit = limit; }
}