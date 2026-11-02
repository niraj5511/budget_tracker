package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepaymentRepository extends JpaRepository<RepaymentEntity, Long> {

    List<RepaymentEntity> findByUserIdOrderById(Long userId);

    List<RepaymentEntity> findByLoanIdOrderById(Long loanId);

    Optional<RepaymentEntity> findByIdAndLoanIdAndUserId(Long id, Long loanId, Long userId);

    @Query("select coalesce(sum(r.amount), 0.0) from RepaymentEntity r where r.loanId = :loanId")
    double totalForLoan(@Param("loanId") Long loanId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from RepaymentEntity r where r.loanId = :loanId")
    void deleteAllForLoan(@Param("loanId") Long loanId);
}