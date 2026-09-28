package com.campusai.repository;

import com.campusai.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndSubjectCode(Long studentId, String subjectCode);
    List<Attendance> findBySubjectCodeAndAttendanceDate(String subjectCode, LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId")
    long countTotalClasses(Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.status = 'PRESENT'")
    long countPresentClasses(Long studentId);
}
