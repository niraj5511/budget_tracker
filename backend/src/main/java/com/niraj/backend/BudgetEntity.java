package com.niraj.backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "budgets")
public class BudgetEntity {

    @Id
    private String category;

    // "limit" is a reserved word in SQL, so the column has a different name.
    @Column(name = "limit_amount", nullable = false)
    private double limit;

    protected BudgetEntity() {
    }

    public BudgetEntity(String category, double limit) {
        this.category = category;
        this.limit = limit;
    }

    public String getCategory() { return category; }

    public double getLimit() { return limit; }
}