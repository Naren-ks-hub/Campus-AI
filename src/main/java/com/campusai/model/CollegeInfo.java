package com.campusai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "college_info")
public class CollegeInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category; // ABOUT, ADMISSION, FEES, LIBRARY, HOSTEL, EXAMS, PLACEMENTS, DEPARTMENTS

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 255)
    private String keywords;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public CollegeInfo() {}

    public CollegeInfo(String category, String title, String content, String keywords) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.keywords = keywords;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
