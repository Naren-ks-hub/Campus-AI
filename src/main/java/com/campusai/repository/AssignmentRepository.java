package com.campusai.repository;

import com.campusai.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByDepartmentAndSemester(String department, Integer semester);
    List<Assignment> findByFacultyId(Long facultyId);
}
