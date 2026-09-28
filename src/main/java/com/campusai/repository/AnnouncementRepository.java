package com.campusai.repository;

import com.campusai.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
    List<Announcement> findByTargetRoleOrTargetRoleOrderByCreatedAtDesc(String targetRole1, String targetRole2);
}
