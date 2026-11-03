package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoanRepository extends JpaRepository<LoanEntity, Long> {

    List<LoanEntity> findByUserIdOrderById(Long userId);

    Optional<LoanEntity> findByIdAndUserId(Long id, Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from LoanEntity l where l.userId = :userId")
    void deleteAllForUser(@Param("userId") Long userId);
}