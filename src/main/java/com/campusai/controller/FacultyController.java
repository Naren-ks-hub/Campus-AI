package com.campusai.controller;

import com.campusai.model.*;
import com.campusai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping("/students")
    public ResponseEntity<?> getStudentsByDepartment(@RequestParam(defaultValue = "Computer Science & Engineering") String department) {
        return ResponseEntity.ok(userRepository.findByRoleAndDepartment(User.Role.STUDENT, department));
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<?> markAttendance(@RequestBody List<Attendance> attendanceList) {
        List<Attendance> saved = attendanceRepository.saveAll(attendanceList);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getFacultyAssignments(@RequestParam Long facultyId) {
        return ResponseEntity.ok(assignmentRepository.findByFacultyId(facultyId));
    }

    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getAssignmentSubmissions(@PathVariable Long assignmentId) {
        List<AssignmentSubmission> list = submissionRepository.findByAssignmentId(assignmentId);
        List<Map<String, Object>> response = new ArrayList<>();
        for (AssignmentSubmission s : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("submission", s);
            map.put("student", userRepository.findById(s.getStudentId()).orElse(null));
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assignments/grade")
    public ResponseEntity<?> gradeSubmission(@RequestParam Long submissionId,
                                             @RequestParam Integer marks,
                                             @RequestParam(required = false) String feedback) {
        Optional<AssignmentSubmission> subOpt = submissionRepository.findById(submissionId);
        if (subOpt.isPresent()) {
            AssignmentSubmission sub = subOpt.get();
            sub.setMarksObtained(marks);
            sub.setFeedback(feedback);
            sub.setStatus(AssignmentSubmission.Status.GRADED);
            return ResponseEntity.ok(submissionRepository.save(sub));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/timetable")
    public ResponseEntity<?> getFacultyTimetable(@RequestParam Long facultyId) {
        return ResponseEntity.ok(timetableRepository.findByFacultyId(facultyId));
    }
}
