package com.campusai.repository;

import com.campusai.model.CollegeInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollegeInfoRepository extends JpaRepository<CollegeInfo, Long> {
    List<CollegeInfo> findByCategory(String category);

    @Query("SELECT c FROM CollegeInfo c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.keywords) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CollegeInfo> searchByKeyword(String query);
}
