package com.campusai.controller;

import com.campusai.model.Announcement;
import com.campusai.model.CollegeInfo;
import com.campusai.model.Event;
import com.campusai.repository.AnnouncementRepository;
import com.campusai.repository.CollegeInfoRepository;
import com.campusai.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class GeneralDataController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private CollegeInfoRepository collegeInfoRepository;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents() {
        return ResponseEntity.ok(eventRepository.findAllByOrderByEventDateAsc());
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/info")
    public ResponseEntity<List<CollegeInfo>> getCollegeInfo(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(collegeInfoRepository.findByCategory(category.toUpperCase()));
        }
        return ResponseEntity.ok(collegeInfoRepository.findAll());
    }
}
