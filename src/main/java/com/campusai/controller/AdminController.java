package com.campusai.controller;

import com.campusai.model.*;
import com.campusai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private CollegeInfoRepository collegeInfoRepository;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAdminAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
        stats.put("totalFaculty", userRepository.countByRole(User.Role.FACULTY));
        stats.put("totalAdmins", userRepository.countByRole(User.Role.ADMIN));
        stats.put("pendingComplaints", complaintRepository.countByStatus(Complaint.Status.PENDING));
        stats.put("resolvedComplaints", complaintRepository.countByStatus(Complaint.Status.RESOLVED));
        stats.put("upcomingEvents", eventRepository.findAll().size());
        stats.put("totalAnnouncements", announcementRepository.findAll().size());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "User deleted successfully");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id,
                                                   @RequestParam Complaint.Status status,
                                                   @RequestParam(required = false) String response,
                                                   @RequestParam(required = false) Long resolvedBy) {
        Optional<Complaint> compOpt = complaintRepository.findById(id);
        if (compOpt.isPresent()) {
            Complaint c = compOpt.get();
            c.setStatus(status);
            if (response != null) c.setAdminResponse(response);
            if (resolvedBy != null) c.setResolvedBy(resolvedBy);
            c.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(complaintRepository.save(c));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/announcements")
    public ResponseEntity<?> createAnnouncement(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @GetMapping("/knowledge-base")
    public ResponseEntity<?> getKnowledgeBase() {
        return ResponseEntity.ok(collegeInfoRepository.findAll());
    }

    @PostMapping("/knowledge-base")
    public ResponseEntity<?> saveKnowledgeBaseItem(@RequestBody CollegeInfo item) {
        return ResponseEntity.ok(collegeInfoRepository.save(item));
    }
}
