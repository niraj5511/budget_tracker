package com.niraj.backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    List<CategoryEntity> findByUserIdOrderByTypeAscNameAsc(Long userId);

    List<CategoryEntity> findByUserIdAndType(Long userId, String type);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from CategoryEntity c where c.userId = :userId")
    void deleteAllForUser(@Param("userId") Long userId);
}