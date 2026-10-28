package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    List<TransactionEntity> findByUserIdOrderById(Long userId);

    Optional<TransactionEntity> findByIdAndUserId(Long id, Long userId);
}