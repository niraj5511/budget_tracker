package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BudgetRepository extends JpaRepository<BudgetEntity, Long> {

    List<BudgetEntity> findByUserIdOrderByCategory(Long userId);

    Optional<BudgetEntity> findByUserIdAndCategory(Long userId, String category);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from BudgetEntity b where b.userId = :userId")
    void deleteAllForUser(@Param("userId") Long userId);
}