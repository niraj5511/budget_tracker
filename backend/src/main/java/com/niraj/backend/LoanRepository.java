package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<LoanEntity, Long> {

    List<LoanEntity> findByUserIdOrderById(Long userId);

    Optional<LoanEntity> findByIdAndUserId(Long id, Long userId);
}