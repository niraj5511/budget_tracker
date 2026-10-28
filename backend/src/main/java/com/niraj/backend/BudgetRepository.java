package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<BudgetEntity, Long> {

    List<BudgetEntity> findByUserIdOrderByCategory(Long userId);

    Optional<BudgetEntity> findByUserIdAndCategory(Long userId, String category);
}