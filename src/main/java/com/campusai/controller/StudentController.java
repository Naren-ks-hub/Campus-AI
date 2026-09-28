package com.campusai.controller;

import com.campusai.model.*;
import com.campusai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(@RequestParam Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        long totalClasses = attendanceRepository.countTotalClasses(studentId);
        long presentClasses = attendanceRepository.countPresentClasses(studentId);
        double attendancePercent = totalClasses > 0 ? ((double) presentClasses / totalClasses) * 100.0 : 85.0;

        List<Assignment> assignments = assignmentRepository.findByDepartmentAndSemester(
                student.getDepartment() != null ? student.getDepartment() : "Computer Science & Engineering",
                student.getSemester() != null ? student.getSemester() : 5
        );
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentId(studentId);
        long pendingAssignments = Math.max(0, assignments.size() - submissions.size());

        List<Complaint> complaints = complaintRepository.findByStudentIdOrderByCreatedAtDesc(studentId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("student", student);
        stats.put("totalClasses", totalClasses > 0 ? totalClasses : 20);
        stats.put("presentClasses", totalClasses > 0 ? presentClasses : 17);
        stats.put("attendancePercent", Math.round(attendancePercent * 10.0) / 10.0);
        stats.put("totalAssignments", assignments.size());
        stats.put("pendingAssignments", pendingAssignments);
        stats.put("submittedAssignments", submissions.size());
        stats.put("totalComplaints", complaints.size());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(@RequestParam Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/timetable")
    public ResponseEntity<?> getTimetable(@RequestParam(defaultValue = "Computer Science & Engineering") String department,
                                          @RequestParam(defaultValue = "5") Integer semester) {
        List<Timetable> schedule = timetableRepository.findByDepartmentAndSemester(department, semester);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getAssignments(@RequestParam(defaultValue = "Computer Science & Engineering") String department,
                                            @RequestParam(defaultValue = "5") Integer semester,
                                            @RequestParam Long studentId) {
        List<Assignment> assignments = assignmentRepository.findByDepartmentAndSemester(department, semester);
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentId(studentId);
        
        Map<Long, AssignmentSubmission> subMap = new HashMap<>();
        for (AssignmentSubmission s : submissions) {
            subMap.put(s.getAssignmentId(), s);
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Assignment a : assignments) {
            Map<String, Object> item = new HashMap<>();
            item.put("assignment", a);
            item.put("submission", subMap.get(a.getId()));
            response.add(item);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assignments/submit")
    public ResponseEntity<?> submitAssignment(@RequestBody AssignmentSubmission submission) {
        Optional<AssignmentSubmission> existing = submissionRepository.findByAssignmentIdAndStudentId(
                submission.getAssignmentId(), submission.getStudentId());
        
        if (existing.isPresent()) {
            AssignmentSubmission sub = existing.get();
            sub.setSubmissionText(submission.getSubmissionText());
            sub.setFileUrl(submission.getFileUrl());
            sub.setStatus(AssignmentSubmission.Status.SUBMITTED);
            return ResponseEntity.ok(submissionRepository.save(sub));
        }

        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getComplaints(@RequestParam Long studentId) {
        return ResponseEntity.ok(complaintRepository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }

    @PostMapping("/complaints")
    public ResponseEntity<?> lodgeComplaint(@RequestBody Complaint complaint) {
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(saved);
    }
}
