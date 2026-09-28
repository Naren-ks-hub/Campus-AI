package com.campusai.repository;

import com.campusai.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByDepartmentAndSemester(String department, Integer semester);
    List<Timetable> findByDepartmentAndSemesterAndDayOfWeek(String department, Integer semester, Timetable.DayOfWeek dayOfWeek);
    List<Timetable> findByFacultyId(Long facultyId);
}
