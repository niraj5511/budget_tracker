package com.niraj.backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "categories", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "type", "name" }))
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String name;

    protected CategoryEntity() {
    }

    public CategoryEntity(Long userId, String type, String name) {
        this.userId = userId;
        this.type = type;
        this.name = name;
    }

    public Long getId() { return id; }

    public String getType() { return type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}