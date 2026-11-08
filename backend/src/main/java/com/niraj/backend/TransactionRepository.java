package com.niraj.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    List<TransactionEntity> findByUserIdOrderById(Long userId);

    Optional<TransactionEntity> findByIdAndUserId(Long id, Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from TransactionEntity t where t.userId = :userId")
    void deleteAllForUser(@Param("userId") Long userId);

    // Moves a user's transactions of one type from one category name to another.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update TransactionEntity t set t.category = :newName "
            + "where t.userId = :userId and t.type = :type and t.category = :oldName")
    void renameCategory(@Param("userId") Long userId, @Param("type") String type,
            @Param("oldName") String oldName, @Param("newName") String newName);
}
