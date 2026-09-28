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

-- Knowledge Base / College Information for AI Bot (VSB Engineering College Karur)
INSERT INTO college_info (category, title, content, keywords) VALUES
('ABOUT', 'About V.S.B. Engineering College, Karur', 'V.S.B. Engineering College (VSBEC), Karur, established in 2002, is an Autonomous institution affiliated to Anna University, approved by AICTE New Delhi, accredited by NAAC with A Grade, and NBA accredited. Located on NH-67 Covai Road, Karur, Tamil Nadu.', 'about, vsb, vsbec, karur, history, accreditation, naac, nba, anna university, ranking, college info'),
('ADMISSION', 'Admissions & TNEA Counseling Code', 'Admissions for B.E. / B.Tech courses are conducted via Tamil Nadu Engineering Admissions (TNEA Counseling Code: 2622) and Management Quota. Eligibility requires minimum 50% in 10+2 with Physics, Chemistry, and Mathematics.', 'admission, tnea, counseling, code 2622, eligibility, cut off, btech, be, apply'),
('PLACEMENTS', 'Career Development Center (CDC) & Placements', 'VSB Engineering College has a stellar placement record with the highest CTC reaching INR 47 Lakhs per annum. Top recruiters include Amazon, Autodesk, TCS, Cognizant, Infosys, Wipro, Zoho, Hexaware, and Capgemini with 1000+ offers annually.', 'placement, cdc, package, 47 lpa, recruiters, amazon, tcs, infosys, zoho, jobs, salary, campus drive'),
('EVENTS', 'Symposiums & Technical Fests', 'VSB Engineering College hosts the prestigious KANAL National Level Technical Symposium, LIRO Line Follower Robotics challenge, ILLUMINATE Workshop in association with IIT Bombay, and DIGIVERSE XPOSE project expo.', 'events, symposium, kanal, liro, illuminate, digiverse, robotics, hackathon'),
('FEES', 'Fee Structure & Scholarships', 'Tuition fees adhere to Tamil Nadu Govt State Fee Committee norms. Merit scholarships and fee concessions are awarded to top TNEA rank holders and high CGPA achievers through the VSB Educational Trust.', 'fee, fees, tuition, scholarship, concession, government quota, management quota'),
('LIBRARY', 'Central Digital Library', 'VSB Central Library houses over 50,000 volumes, national and international journals, IEEE Xplore, DELNET, Springer, and NPTEL video lectures. Open from 8:30 AM to 7:00 PM on all working days.', 'library, books, journals, ieee, delnet, nptel, timing, borrow'),
('HOSTEL', 'Hostel & Transport Facilities', 'VSBEC provides separate, secure hostels for boys and girls with RO purified water, Wi-Fi, gym, and hygienic mess dining. The college operates 50+ buses covering Karur, Tiruchirappalli, Dindigul, Erode, and Namakkal routes.', 'hostel, bus, transport, route, mess, trichy, erode, dindigul, karur, accommodation'),
('DEPARTMENTS', 'Academic Departments & Courses', 'Departments: Computer Science & Engg (CSE), Artificial Intelligence & Data Science (AI&DS), Information Technology (IT), Electronics & Communication (ECE), Electrical & Electronics (EEE), Mechanical, and Civil Engineering.', 'departments, branches, cse, aids, it, ece, eee, mech, civil');

-- Timetable Seed Data (For CS 5th Semester - VSBEC)
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

-- Real Events Seed Data (VSB Engineering College, Karur)
INSERT INTO events (title, category, description, event_date, location, organizer, banner_url, registration_link) VALUES
('KANAL 2K26 - National Level Technical Symposium', 'Symposium', 'Flagship National Level Technical Symposium by CSE & IT featuring Paper Presentation, Code Sprint, Bug Hunt, Web Design, and AI Hack Challenge with cash awards.', '2026-10-18 09:00:00', 'VSB Main Auditorium & CSE Lab 4', 'Dept of CSE & IT, VSBEC Karur', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', 'https://vsbec.edu.in/kanal2k26'),
('LIRO 2K26 - Line Follower Robotics Competition', 'Robotics', 'Inter-college autonomous robotics and IoT line follower navigation challenge testing speed, sensor accuracy, and algorithmic path optimization.', '2026-10-13 09:30:00', 'Einstein Tech Block & ECE Robotics Lab', 'Dept of ECE & Robotics Club', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', 'https://vsbec.edu.in/liro2k26'),
('ILLUMINATE 2026 - E-Cell Entrepreneurship Summit', 'Workshop', 'Hands-on startup incubation, business modeling, and venture capital pitching workshop organized in association with E-Cell IIT Bombay.', '2026-10-14 10:00:00', 'VSB Convention Center', 'Entrepreneurship Development Cell (EDC)', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600', 'https://vsbec.edu.in/illuminate'),
('DIGIVERSE XPOSE 2026 - Annual Project & Cultural Expo', 'Cultural & Expo', 'Grand annual inter-department innovative engineering project expo, AI demonstrations, and cultural music & dance fiesta.', '2026-11-05 08:30:00', 'Central Open Air Amphitheatre', 'Student Affairs Council', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', 'https://vsbec.edu.in/digiverse');

-- Real Announcements Seed Data (VSB Engineering College, Karur)
INSERT INTO announcements (author_id, title, content, priority, target_role, department) VALUES
(1, 'Autonomous COE End-Semester Examinations Schedule Released', 'Controller of Examinations (COE) has released the End-Semester Examination timetable for all 3rd, 5th, and 7th semester B.E/B.Tech students. Exams commence on October 28th. Hall tickets are available on the student portal.', 'URGENT', 'STUDENT', 'ALL'),
(1, 'Campus Placement Drive 2026: Tier-1 IT & Product Companies (Autodesk, Zoho, TCS, Infosys)', 'Career Development Center (CDC) announces registration for upcoming on-campus recruitment drives. Highest package offered this season is INR 47 Lakhs. Mandatory pre-placement training starts Monday.', 'HIGH', 'ALL', 'ALL'),
(2, 'AICTE - IDEA Lab Hands-On Workshop on Generative AI & IoT', 'Department of CSE & AI&DS is organizing a 3-day hands-on workshop on Edge Computing and Large Language Models at the VSB AICTE IDEA Lab.', 'NORMAL', 'STUDENT', 'Computer Science & Engineering'),
(1, 'College Bus Transport & Route Timings - Karur, Trichy, Dindigul & Erode', 'Updated morning pick-up and evening drop schedules for all 50 college bus routes (covering Karur, Trichy, Dindigul, Erode, and Namakkal) have been posted.', 'NORMAL', 'ALL', 'ALL');

-- Complaints / Grievances Seed Data
INSERT INTO complaints (student_id, category, subject, description, status, admin_response) VALUES
(4, 'Infrastructure', 'Wi-Fi connection drop in CS Lab 301', 'The high-speed Wi-Fi router in CS Lab 301 has frequent disconnects during afternoon sessions.', 'IN_PROGRESS', 'Network team has been dispatched to replace the access point router switch.'),
(5, 'Library', 'Request for additional AI & Machine Learning text books', 'Kindly add more physical copies of Deep Learning by Ian Goodfellow in the reference section.', 'RESOLVED', '5 additional copies added to shelf B-14 in Central Library.');
