-- ==========================================================
-- CampusAI: College Management Assistant & AI Chatbot Database
-- Database Schema & Comprehensive Demo Seed Data
-- ==========================================================

CREATE DATABASE IF NOT EXISTS campusai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusai_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    department VARCHAR(100),
    roll_number VARCHAR(50) UNIQUE,
    semester INT DEFAULT 1,
    phone VARCHAR(20),
    avatar VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. College Information / Knowledge Base (for AI Chatbot and portal)
CREATE TABLE IF NOT EXISTS college_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- e.g. 'ABOUT', 'ADMISSION', 'FEES', 'HOSTEL', 'LIBRARY', 'DEPARTMENTS', 'PLACEMENTS', 'EXAMS'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    keywords VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    faculty_id BIGINT,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') DEFAULT 'PRESENT',
    marked_by BIGINT,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    max_marks INT DEFAULT 100,
    due_date DATETIME NOT NULL,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT,
    file_url VARCHAR(255),
    status ENUM('SUBMITTED', 'GRADED', 'LATE') DEFAULT 'SUBMITTED',
    marks_obtained INT DEFAULT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Events Table
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'Academic',
    description TEXT NOT NULL,
    event_date DATETIME NOT NULL,
    location VARCHAR(150) NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    banner_url VARCHAR(255),
    registration_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    target_role ENUM('ALL', 'STUDENT', 'FACULTY') DEFAULT 'ALL',
    department VARCHAR(100) DEFAULT 'ALL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Complaints / Grievances Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Hostel', 'Academic', 'Library', 'Infrastructure', 'Canteen'
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
    admin_response TEXT,
    resolved_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. AI Chatbot Conversation History
CREATE TABLE IF NOT EXISTS chatbot_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    user_query TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent_detected VARCHAR(100),
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================================
-- SEED DATA (Default Accounts, Courses, Schedules, Info)
-- Passwords below are plain/hashed for demo: "admin123", "faculty123", "student123"
-- ==========================================================

-- Default Users
INSERT INTO users (id, username, password, full_name, email, role, department, roll_number, semester, phone, avatar) VALUES
(1, 'admin', 'admin123', 'Dr. Alistair Vance', 'admin@campusai.edu', 'ADMIN', 'Administration', 'ADM-001', 0, '+1 (555) 100-2000', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'faculty_smith', 'faculty123', 'Prof. Sarah Jenkins', 's.jenkins@campusai.edu', 'FACULTY', 'Computer Science & Engineering', 'FAC-CS-101', 0, '+1 (555) 200-3001', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(3, 'faculty_rao', 'faculty123', 'Dr. Ramesh Rao', 'r.rao@campusai.edu', 'FACULTY', 'Computer Science & Engineering', 'FAC-CS-102', 0, '+1 (555) 200-3002', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
(4, 'student_alex', 'student123', 'Alex Morgan', 'alex.m@campusai.edu', 'STUDENT', 'Computer Science & Engineering', 'CS2024-042', 5, '+1 (555) 300-4001', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
(5, 'student_priya', 'student123', 'Priya Sharma', 'priya.s@campusai.edu', 'STUDENT', 'Computer Science & Engineering', 'CS2024-043', 5, '+1 (555) 300-4002', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Knowledge Base / College Information for AI Bot
INSERT INTO college_info (category, title, content, keywords) VALUES
('ABOUT', 'About CampusAI Institute of Technology', 'CampusAI Institute of Technology is a premier engineering and research institution established in 1998, renowned for AI, Computer Science, and Engineering excellence with NBA and NAAC A++ accreditation.', 'about, history, accreditation, campus, ranking, college info'),
('ADMISSION', 'Admissions & Eligibility', 'Admissions for undergraduate B.Tech programs require 75% in 10+2 with Physics, Mathematics & Chemistry, along with national entrance test scores (JEE / State CET). Applications open every April on the admissions portal.', 'admission, apply, eligibility, cut off, entrance exam, criteria, btech'),
('FEES', 'Fee Structure & Scholarships', 'Annual tuition fee is $4,500 / INR 1,20,000. Merit scholarships covering up to 50% tuition are available for students with GPA above 9.0 or top entrance test ranks. Financial aid can be requested via student portal.', 'fee, fees, tuition, cost, scholarship, installment, payment, financial aid'),
('LIBRARY', 'Campus Central Library & Digital Access', 'The Central Library is open from 8:00 AM to 10:00 PM on weekdays and 9:00 AM to 6:00 PM on weekends. Students can borrow up to 5 books for 14 days and access IEEE Xplore, ACM, and Springer digital databases remotely.', 'library, books, borrow, timing, digital library, ieee, journals, opening hours'),
('HOSTEL', 'Hostel Accommodation & Dining', 'Campus has 4 boys hostels and 3 girls hostels equipped with Wi-Fi, air-conditioned and non-AC rooms, gym, 24/7 security, and mess dining providing vegetarian and non-vegetarian balanced meals.', 'hostel, room, mess, accommodation, food, hostel fees, warden, curfew'),
('EXAMS', 'Examinations & Grading System', 'Mid-term exams carry 30% weightage, continuous lab evaluations carry 20%, and End-Semester finals carry 50%. Grading follows a 10-point CGPA system. Minimum passing grade is 40% (Grade D).', 'exams, exam schedule, marks, grading, cgpa, gpa, results, pass criteria, mid terms'),
('PLACEMENTS', 'Career & Placement Cell', 'CampusAI placement cell connects students with 150+ top tech recruiters including Google, Microsoft, Amazon, Infosys, and TCS. The average package is $14,000 / INR 11 LPA with highest package at $58,000 / INR 45 LPA.', 'placement, job, internship, packages, recruiters, careers, interview, salary'),
('DEPARTMENTS', 'Academic Departments & HODs', 'Departments include: Computer Science & Engg (HOD: Dr. Vance), Artificial Intelligence & Data Science (HOD: Dr. Rao), Electronics & Comm, Mechanical, and Civil Engineering.', 'departments, branches, hod, head of department, cse, aids, ece, mech');

-- Timetable Seed Data (For CS 5th Semester)
INSERT INTO timetable (department, semester, day_of_week, period_number, start_time, end_time, subject_code, subject_name, room_number, faculty_id) VALUES
('Computer Science & Engineering', 5, 'MONDAY', 1, '09:00:00', '10:00:00', 'CS501', 'Artificial Intelligence & Neural Nets', 'Lab 301', 2),
('Computer Science & Engineering', 5, 'MONDAY', 2, '10:00:00', '11:00:00', 'CS502', 'Database Management Systems', 'Room 204', 3),
('Computer Science & Engineering', 5, 'MONDAY', 3, '11:15:00', '12:15:00', 'CS503', 'Operating Systems & Concurrency', 'Room 204', 2),
('Computer Science & Engineering', 5, 'MONDAY', 4, '13:00:00', '14:30:00', 'CS504', 'Cloud Computing Architecture', 'Lab 102', 3),

('Computer Science & Engineering', 5, 'TUESDAY', 1, '09:00:00', '10:00:00', 'CS502', 'Database Management Systems', 'Room 204', 3),
('Computer Science & Engineering', 5, 'TUESDAY', 2, '10:00:00', '11:00:00', 'CS505', 'Software Engineering & Agile', 'Room 205', 2),
('Computer Science & Engineering', 5, 'TUESDAY', 3, '11:15:00', '12:15:00', 'CS501', 'Artificial Intelligence & Neural Nets', 'Lab 301', 2),
('Computer Science & Engineering', 5, 'TUESDAY', 4, '13:00:00', '15:00:00', 'CS506', 'Full-Stack Java Web Development Lab', 'Lab 402', 3),

('Computer Science & Engineering', 5, 'WEDNESDAY', 1, '09:00:00', '10:00:00', 'CS504', 'Cloud Computing Architecture', 'Room 204', 3),
('Computer Science & Engineering', 5, 'WEDNESDAY', 2, '10:00:00', '11:00:00', 'CS503', 'Operating Systems & Concurrency', 'Room 204', 2),
('Computer Science & Engineering', 5, 'WEDNESDAY', 3, '11:15:00', '12:15:00', 'CS505', 'Software Engineering & Agile', 'Room 205', 2),

('Computer Science & Engineering', 5, 'THURSDAY', 1, '09:00:00', '10:00:00', 'CS501', 'Artificial Intelligence & Neural Nets', 'Lab 301', 2),
('Computer Science & Engineering', 5, 'THURSDAY', 2, '10:00:00', '11:00:00', 'CS502', 'Database Management Systems', 'Room 204', 3),
('Computer Science & Engineering', 5, 'THURSDAY', 3, '11:15:00', '13:15:00', 'CS507', 'AI & Machine Learning Capstone Lab', 'AI Center', 2),

('Computer Science & Engineering', 5, 'FRIDAY', 1, '09:00:00', '10:00:00', 'CS505', 'Software Engineering & Agile', 'Room 205', 2),
('Computer Science & Engineering', 5, 'FRIDAY', 2, '10:00:00', '11:00:00', 'CS504', 'Cloud Computing Architecture', 'Room 204', 3),
('Computer Science & Engineering', 5, 'FRIDAY', 3, '11:15:00', '12:15:00', 'CS503', 'Operating Systems & Concurrency', 'Room 204', 2);

-- Attendance Seed Data (For Student Alex Morgan - id: 4)
INSERT INTO attendance (student_id, subject_code, subject_name, attendance_date, status, marked_by, remarks) VALUES
(4, 'CS501', 'Artificial Intelligence & Neural Nets', '2026-09-01', 'PRESENT', 2, 'Active participation'),
(4, 'CS501', 'Artificial Intelligence & Neural Nets', '2026-09-08', 'PRESENT', 2, 'On time'),
(4, 'CS501', 'Artificial Intelligence & Neural Nets', '2026-09-15', 'PRESENT', 2, 'On time'),
(4, 'CS501', 'Artificial Intelligence & Neural Nets', '2026-09-22', 'ABSENT', 2, 'Medical leave'),
(4, 'CS502', 'Database Management Systems', '2026-09-02', 'PRESENT', 3, 'Lab completed'),
(4, 'CS502', 'Database Management Systems', '2026-09-09', 'PRESENT', 3, 'On time'),
(4, 'CS502', 'Database Management Systems', '2026-09-16', 'PRESENT', 3, 'On time'),
(4, 'CS502', 'Database Management Systems', '2026-09-23', 'PRESENT', 3, 'On time'),
(4, 'CS503', 'Operating Systems & Concurrency', '2026-09-03', 'PRESENT', 2, 'On time'),
(4, 'CS503', 'Operating Systems & Concurrency', '2026-09-10', 'ABSENT', 2, 'Unexcused'),
(4, 'CS503', 'Operating Systems & Concurrency', '2026-09-17', 'PRESENT', 2, 'On time'),
(4, 'CS503', 'Operating Systems & Concurrency', '2026-09-24', 'PRESENT', 2, 'On time'),
(4, 'CS504', 'Cloud Computing Architecture', '2026-09-04', 'PRESENT', 3, 'On time'),
(4, 'CS504', 'Cloud Computing Architecture', '2026-09-11', 'PRESENT', 3, 'On time'),
(4, 'CS504', 'Cloud Computing Architecture', '2026-09-18', 'PRESENT', 3, 'On time'),
(4, 'CS505', 'Software Engineering & Agile', '2026-09-05', 'PRESENT', 2, 'Sprint demo done');

-- Assignments Seed Data
INSERT INTO assignments (id, faculty_id, department, semester, subject_code, subject_name, title, description, max_marks, due_date) VALUES
(1, 2, 'Computer Science & Engineering', 5, 'CS501', 'Artificial Intelligence & Neural Nets', 'Neural Network Backpropagation Implementation', 'Implement a 3-layer neural network from scratch using Java/Python and train it on the MNIST handwritten digits dataset. Submit code and performance report.', 100, '2026-10-05 23:59:00'),
(2, 3, 'Computer Science & Engineering', 5, 'CS502', 'Database Management Systems', 'E-Commerce Schema & Complex SQL Queries', 'Design an optimized relational schema in 3NF for an enterprise e-commerce system with 15 SQL reporting queries including indexing analysis.', 50, '2026-10-10 23:59:00'),
(3, 2, 'Computer Science & Engineering', 5, 'CS503', 'Operating Systems & Concurrency', 'Multithreaded Producer-Consumer with Semaphores', 'Write a multithreaded simulation in Java demonstrating bounded-buffer problem resolution using Mutex and Counting Semaphores.', 50, '2026-10-18 23:59:00');

-- Assignment Submissions Seed Data
INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, status, marks_obtained, feedback, submitted_at) VALUES
(1, 4, 'Implemented 3-layer MLP with Sigmoid & ReLU activation. Accuracy reached 96.4% on test split. GitHub repository link included.', 'GRADED', 94, 'Excellent mathematical analysis and clean code structure.', '2026-09-25 14:30:00');

-- Events Seed Data
INSERT INTO events (title, category, description, event_date, location, organizer, banner_url, registration_link) VALUES
('CampusAI Annual Hackathon 2026', 'Hackathon', 'A 36-hour continuous innovation sprint solving real-world AI, Web3, and Sustainability challenges with $10,000 prize pool.', '2026-10-15 09:00:00', 'Campus Main Auditorium & Tech Hub', 'ACM Student Chapter', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', 'https://campusai.edu/hackathon2026'),
('National AI & Robotics Symposium', 'Symposium', 'Keynotes by leading AI researchers from DeepMind, MIT, and Stanford exploring Generative AI and Autonomous agents.', '2026-10-22 10:00:00', 'Einstein Convention Hall', 'Dept of Computer Science', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', 'https://campusai.edu/symposium'),
('Inter-College Sports Carnival "VIGOR 2026"', 'Sports', 'Annual athletics, football, cricket, basketball, and badminton championships across 30 participating universities.', '2026-11-02 08:00:00', 'University Sports Complex', 'Sports Council', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', 'https://campusai.edu/vigor2026');

-- Announcements Seed Data
INSERT INTO announcements (author_id, title, content, priority, target_role, department) VALUES
(1, 'Mid-Semester Examinations Schedule Released', 'The Mid-Semester Examination schedule for all 3rd, 5th, and 7th semester students has been uploaded to the examination portal. Exams commence from October 12th.', 'URGENT', 'STUDENT', 'ALL'),
(1, 'Campus AI Innovation Grant Applications Open', 'Faculty and student research groups are invited to apply for the annual $25,000 Innovation & Research seed grants. Deadline is October 30th.', 'HIGH', 'ALL', 'ALL'),
(2, 'Guest Lecture: Scalable Microservices Architecture', 'Industry lead from Amazon Web Services will be delivering an interactive session on Monday at 3:00 PM in Seminar Hall 2.', 'NORMAL', 'STUDENT', 'Computer Science & Engineering');

-- Complaints / Grievances Seed Data
INSERT INTO complaints (student_id, category, subject, description, status, admin_response) VALUES
(4, 'Infrastructure', 'Wi-Fi connection drop in CS Lab 301', 'The high-speed Wi-Fi router in CS Lab 301 has frequent disconnects during afternoon sessions.', 'IN_PROGRESS', 'Network team has been dispatched to replace the access point router switch.'),
(5, 'Library', 'Request for additional AI & Machine Learning text books', 'Kindly add more physical copies of Deep Learning by Ian Goodfellow in the reference section.', 'RESOLVED', '5 additional copies added to shelf B-14 in Central Library.');
