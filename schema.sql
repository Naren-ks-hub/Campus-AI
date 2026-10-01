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
    academic_year VARCHAR(50) DEFAULT '3rd Year',
    residence_type VARCHAR(50) DEFAULT 'Hostel', -- 'Hostel' or 'Dayscholar'
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
INSERT INTO users (id, username, password, full_name, email, role, department, roll_number, semester, academic_year, phone, avatar, status, created_at) VALUES
(1, 'admin', 'admin123', 'Dr. Alistair Vance', 'admin@campusai.edu', 'ADMIN', 'Administration', 'ADM-001', 0, 'Faculty', '+91 98424-10001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ACTIVE', '2026-08-01 09:00:00'),
(2, 'faculty_smith', 'faculty123', 'Prof. Sarah Jenkins', 's.jenkins@campusai.edu', 'FACULTY', 'Computer Science & Engineering', 'FAC-CS-101', 0, 'Faculty', '+91 98424-20001', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'ACTIVE', '2026-08-05 10:30:00'),
(3, 'faculty_rao', 'faculty123', 'Dr. Ramesh Rao', 'r.rao@campusai.edu', 'FACULTY', 'Computer Science & Engineering', 'FAC-CS-102', 0, 'Faculty', '+91 98424-20002', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'ACTIVE', '2026-08-10 11:15:00'),
(4, 'student_alex', 'student123', 'Alex Morgan', 'alex.m@campusai.edu', 'STUDENT', 'Computer Science & Engineering', 'CS2024-042', 5, '3rd Year', '+91 98424-30001', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'ACTIVE', '2026-09-01 09:15:00'),
(5, 'student_priya', 'student123', 'Priya Sharma', 'priya.s@campusai.edu', 'STUDENT', 'Computer Science & Engineering', 'CS2024-043', 5, '3rd Year', '+91 98424-30002', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'ACTIVE', '2026-09-02 10:45:00'),
(6, 'student_naren', 'student123', 'Naren K S', 'narenks.vsb@gmail.com', 'STUDENT', 'Artificial Intelligence & Data Science', 'AIDS-2024-019', 5, '3rd Year', '+91 94432-51201', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'ACTIVE', '2026-09-05 14:20:00'),
(7, 'student_aarav', 'student123', 'Aarav Patel', 'aarav.p@campusai.edu', 'STUDENT', 'Artificial Intelligence & Data Science', 'AIDS-2024-020', 3, '2nd Year', '+91 94432-51202', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ACTIVE', '2026-09-08 11:30:00'),
(8, 'student_sneha', 'student123', 'Sneha Reddy', 'sneha.r@campusai.edu', 'STUDENT', 'Information Technology', 'IT2024-088', 5, '3rd Year', '+91 97890-44101', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ACTIVE', '2026-09-10 16:00:00'),
(9, 'student_karthik', 'student123', 'Karthik Raja', 'karthik.r@campusai.edu', 'STUDENT', 'Information Technology', 'IT2024-089', 1, '1st Year', '+91 97890-44102', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'ACTIVE', '2026-09-12 09:30:00'),
(10, 'student_divya', 'student123', 'Divya Sundaram', 'divya.s@campusai.edu', 'STUDENT', 'Electronics & Communication Engineering', 'ECE-2024-051', 5, '3rd Year', '+91 98401-77210', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'ACTIVE', '2026-09-15 13:10:00'),
(11, 'student_rahul', 'student123', 'Rahul Verma', 'rahul.v@campusai.edu', 'STUDENT', 'Electronics & Communication Engineering', 'ECE-2024-052', 7, '4th Year', '+91 98401-77211', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'ACTIVE', '2026-09-18 15:45:00'),
(12, 'student_ananya', 'student123', 'Ananya Iyer', 'ananya.i@campusai.edu', 'STUDENT', 'Electrical & Electronics Engineering', 'EEE-2024-014', 3, '2nd Year', '+91 99402-33100', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'ACTIVE', '2026-09-20 10:00:00'),
(13, 'student_vikram', 'student123', 'Vikram Seth', 'vikram.s@campusai.edu', 'STUDENT', 'Mechanical Engineering', 'MECH-2024-033', 5, '3rd Year', '+91 96001-99880', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'ACTIVE', '2026-09-22 11:20:00'),
(14, 'student_meera', 'student123', 'Meera Krishnan', 'meera.k@campusai.edu', 'STUDENT', 'Civil Engineering', 'CIVIL-2024-027', 1, '1st Year', '+91 94441-66770', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ACTIVE', '2026-09-25 14:00:00'),
(15, 'student_rohan', 'student123', 'Rohan Das', 'rohan.d@campusai.edu', 'STUDENT', 'Computer Science & Engineering', 'CS2024-044', 3, '2nd Year', '+91 98424-30003', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'INACTIVE', '2026-08-20 09:00:00')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Knowledge Base / College Information for AI Bot (VSB Engineering College Karur)
INSERT INTO college_info (category, title, content, keywords) VALUES
('ABOUT', 'About V.S.B. Engineering College, Karur', 'V.S.B. Engineering College (VSBEC), Karur, established in 2002, is an Autonomous institution affiliated to Anna University, approved by AICTE New Delhi, accredited by NAAC with A Grade, and NBA accredited. Located on NH-67 Covai Road, Karur, Tamil Nadu.', 'about, vsb, vsbec, karur, history, accreditation, naac, nba, anna university, ranking, college info'),
('ADMISSION', 'Admissions & TNEA Counseling Code', 'Admissions for B.E. / B.Tech courses are conducted via Tamil Nadu Engineering Admissions (TNEA Counseling Code: 2622) and Management Quota. Eligibility requires minimum 50% in 10+2 with Physics, Chemistry, and Mathematics.', 'admission, tnea, counseling, code 2622, eligibility, cut off, btech, be, apply'),
('FEES', 'Institutional Tuition & Fee Schedule Regulations (Ref: VSB/FIN/FEE-REG/2026-27/01)', 'Odd Semester fee due date: Sept 30, 2026. Even Semester: Jan 31, 2027. Grace period: 7 working days. Late fine: ₹50/day (Days 8-15), ₹100/day (Days 16-30). Govt quota: ₹55,000/sem, Management: ₹85,000/sem. Merit scholarships: 100% waiver for TNEA cutoff >= 195/200; 50% waiver for 190-194.9 (Ref: TRUST-SCHOLAR-2026/B-12).', 'fee, fees, tuition, payment, due date, late fine, scholarship, concession, waiver, refund, installments'),
('LIBRARY', 'Central Digital Library Regulations Manual (Ref: LIB/MANUAL/2026/V4.2)', 'Hours: 8:30 AM - 7:00 PM (Exam reading halls open till 9:30 PM). Borrowing quotas: UG: 5 books for 14 days; PG: 7 books for 21 days; Faculty: 10 books. Overdue fine: ₹2.00/day (Days 1-7), ₹5.00/day (Day 8+). Free Book Bank for SC/ST students. 24/7 off-campus IEEE Xplore, DELNET, and NPTEL access.', 'library, books, borrow, overdue, fine, timing, book bank, ieee, delnet, nptel'),
('EXAMS', 'Autonomous COE Examination & Hall Ticket Directive (Ref: COE/CIR/2026/ODD/042)', 'End-Sem Theory Exams commence Oct 28, 2026. Practicals: Oct 14-22. Mandatory 75% aggregate attendance required for hall ticket generation. Medical condonation (65.0%-74.9%) permitted with hospital records and ₹1,500 fee. Revaluation fee: ₹400/subject with 50% refund if grade upgrades by 2 slabs (Ref: COE/REV/2026/SUPP-03).', 'exam, exams, coe, hall ticket, attendance percentage, condonation, revaluation, photocopy, supplementary'),
('GRIEVANCE', 'Institutional Grievance Redressal Mechanism & Student Charter (Ref: VSB/GRC/POLICY/2026/01)', 'Four-Tier Escalation Hierarchy: Level 1 Mentor (SLA 24-48h) -> Level 2 HoD (SLA 3 days) -> Level 3 Apex GRC & Principal (SLA 7 days) -> Level 4 Anna University Ombudsman. Anti-Ragging Helpline: 1800-180-5522 (Toll-Free). ICC POSH Cell inquiries resolved within 15 days (Ref: INST/CIR/ICC-AR/2026/007).', 'grievance, complaint, ragging, anti-ragging, icc, posh, escalation, sla, redressal, ombudsman'),
('PLACEMENTS', 'Career Development Center (CDC) & Placements (Ref: CDC/POLICY/2026/P-01)', 'Highest annual package: INR 47 Lakhs per annum (Autodesk & Amazon). Top recruiters: Amazon, Autodesk, TCS, Cognizant, Infosys, Zoho, Wipro, Capgemini, Hexaware with 1000+ offers annually.', 'placement, cdc, package, 47 lpa, recruiters, amazon, tcs, infosys, zoho, jobs, salary, campus drive'),
('HOSTEL', 'Hostel & Transport Facilities (Ref: TRANS/MANUAL/2026/R-50)', 'Separate secure hostels for boys and girls with RO water, Wi-Fi, and mess dining. 50+ college buses connect Karur, Tiruchirappalli, Dindigul, Erode, and Namakkal, departing campus daily at 4:45 PM.', 'hostel, bus, transport, route, mess, trichy, erode, dindigul, karur, accommodation'),
('DEPARTMENTS', 'Academic Departments & Courses', 'Departments: Computer Science & Engg (CSE), Artificial Intelligence & Data Science (AI&DS), Information Technology (IT), Electronics & Communication (ECE), Electrical & Electronics (EEE), Mechanical, and Civil Engineering.', 'departments, branches, cse, aids, it, ece, eee, mech, civil');

-- Timetable Seed Data (For Artificial Intelligence and Data Science - 5th Semester 'B' - VSBEC)
INSERT INTO timetable (department, semester, day_of_week, period_number, start_time, end_time, subject_code, subject_name, room_number, faculty_id) VALUES
('Artificial Intelligence & Data Science', 5, 'MONDAY', 1, '09:15:00', '10:00:00', 'AP', 'Aptitude', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 2, '10:00:00', '10:45:00', 'AP', 'Aptitude', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 3, '11:00:00', '11:45:00', 'AP', 'Aptitude', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 4, '11:45:00', '12:30:00', 'AP', 'Aptitude', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 5, '13:20:00', '14:05:00', '23ADT501', 'Deep Learning Lab', 'AI Research Lab', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 6, '14:05:00', '14:50:00', '23ADT501', 'Deep Learning Lab', 'AI Research Lab', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 7, '15:05:00', '15:50:00', '23ADT501', 'Deep Learning Lab', 'AI Research Lab', 2),
('Artificial Intelligence & Data Science', 5, 'MONDAY', 8, '15:50:00', '16:30:00', '23ADT501', 'Deep Learning Lab', 'AI Research Lab', 2),

('Artificial Intelligence & Data Science', 5, 'TUESDAY', 1, '09:15:00', '10:00:00', '23CSE005', 'Business Analytics', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 2, '10:00:00', '10:45:00', '23CBT502', 'Data and Information Security', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 3, '11:00:00', '11:45:00', '23CSE011', 'Cloud Service Management', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 4, '11:45:00', '12:30:00', '23ADT501', 'Deep Learning', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 5, '13:20:00', '14:05:00', 'WD', 'Web Development', 'Web Dev Lab', 2),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 6, '14:05:00', '14:50:00', 'WD', 'Web Development', 'Web Dev Lab', 2),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 7, '15:05:00', '15:50:00', 'WD', 'Web Development', 'Web Dev Lab', 2),
('Artificial Intelligence & Data Science', 5, 'TUESDAY', 8, '15:50:00', '16:30:00', 'WD', 'Web Development', 'Web Dev Lab', 2),

('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 1, '09:15:00', '10:00:00', '23CBT502', 'Data and Information Security', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 2, '10:00:00', '10:45:00', '23ADT501', 'Deep Learning', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 3, '11:00:00', '11:45:00', 'COMM', 'Communication Training', 'Language Lab', 3),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 4, '11:45:00', '12:30:00', 'COMM', 'Communication Training', 'Language Lab', 3),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 5, '13:20:00', '14:05:00', '23CSE011', 'Cloud Service Management', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 6, '14:05:00', '14:50:00', '23CST504', 'Distributed Computing', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 7, '15:05:00', '15:50:00', '23CSE005', 'Business Analytics Lab', 'Analytics Lab', 3),
('Artificial Intelligence & Data Science', 5, 'WEDNESDAY', 8, '15:50:00', '16:30:00', '23CSE005', 'Business Analytics Lab', 'Analytics Lab', 3),

('Artificial Intelligence & Data Science', 5, 'THURSDAY', 1, '09:15:00', '10:00:00', '23ADT501', 'Deep Learning', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 2, '10:00:00', '10:45:00', '23CST504', 'Distributed Computing', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 3, '11:00:00', '11:45:00', '23CSE005', 'Business Analytics', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 4, '11:45:00', '12:30:00', '23ADT502', 'Big Data Analytics', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 5, '13:20:00', '14:05:00', 'ADS', 'Advanced Data Structure and Algorithm', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 6, '14:05:00', '14:50:00', 'ADS', 'Advanced Data Structure and Algorithm', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 7, '15:05:00', '15:50:00', 'ADS', 'Advanced Data Structure and Algorithm', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'THURSDAY', 8, '15:50:00', '16:30:00', 'ADS', 'Advanced Data Structure and Algorithm', 'MB III A-202', 2),

('Artificial Intelligence & Data Science', 5, 'FRIDAY', 1, '09:15:00', '10:00:00', 'COMM', 'Communication Training', 'Language Lab', 3),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 2, '10:00:00', '10:45:00', 'COMM', 'Communication Training', 'Language Lab', 3),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 3, '11:00:00', '11:45:00', '23ADT501', 'Deep Learning', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 4, '11:45:00', '12:30:00', '23CST504', 'Distributed Computing', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 5, '13:20:00', '14:05:00', '23ADT502', 'Big Data Analytics Lab', 'Big Data Lab', 3),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 6, '14:05:00', '14:50:00', '23ADT502', 'Big Data Analytics Lab', 'Big Data Lab', 3),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 7, '15:05:00', '15:50:00', '23CSE005', 'Business Analytics', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'FRIDAY', 8, '15:50:00', '16:30:00', '23CBT502', 'Data and Information Security', 'MB III A-202', 2),

('Artificial Intelligence & Data Science', 5, 'SATURDAY', 1, '09:15:00', '10:00:00', '23CBT502', 'Data and Information Security', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 2, '10:00:00', '10:45:00', '23ADT502', 'Big Data Analytics', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 3, '11:00:00', '11:45:00', '23CSE011', 'Cloud Service Management', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 4, '11:45:00', '12:30:00', '23CST504', 'Distributed Computing', 'MB III A-202', 2),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 5, '13:20:00', '14:05:00', '23CSE011', 'Cloud Service Management Lab', 'Cloud Computing Lab', 3),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 6, '14:05:00', '14:50:00', '23CSE011', 'Cloud Service Management Lab', 'Cloud Computing Lab', 3),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 7, '15:05:00', '15:50:00', '23CSE005', 'Business Analytics', 'MB III A-202', 3),
('Artificial Intelligence & Data Science', 5, 'SATURDAY', 8, '15:50:00', '16:30:00', '23ADT502', 'Big Data Analytics', 'MB III A-202', 3);

-- Attendance Seed Data (For Student Alex Morgan - id: 4)
INSERT INTO attendance (student_id, subject_code, subject_name, attendance_date, status, marked_by, remarks) VALUES
(4, '23ADT501', 'Deep Learning', '2026-09-01', 'PRESENT', 2, 'Active participation'),
(4, '23ADT501', 'Deep Learning', '2026-09-08', 'PRESENT', 2, 'On time'),
(4, '23ADT501', 'Deep Learning', '2026-09-15', 'PRESENT', 2, 'On time'),
(4, '23ADT501', 'Deep Learning', '2026-09-22', 'ABSENT', 2, 'Medical leave'),
(4, '23CSE011', 'Cloud Service Management', '2026-09-02', 'PRESENT', 3, 'Lab completed'),
(4, '23CSE011', 'Cloud Service Management', '2026-09-09', 'PRESENT', 3, 'On time'),
(4, '23CSE011', 'Cloud Service Management', '2026-09-16', 'PRESENT', 3, 'On time'),
(4, '23CSE011', 'Cloud Service Management', '2026-09-23', 'PRESENT', 3, 'On time'),
(4, '23CBT502', 'Data and Information Security', '2026-09-03', 'PRESENT', 2, 'On time'),
(4, '23CBT502', 'Data and Information Security', '2026-09-10', 'ABSENT', 2, 'Unexcused'),
(4, '23CBT502', 'Data and Information Security', '2026-09-17', 'PRESENT', 2, 'On time'),
(4, '23CBT502', 'Data and Information Security', '2026-09-24', 'PRESENT', 2, 'On time'),
(4, '23CST504', 'Distributed Computing', '2026-09-04', 'PRESENT', 3, 'On time'),
(4, '23CST504', 'Distributed Computing', '2026-09-11', 'PRESENT', 3, 'On time'),
(4, '23ADT502', 'Big Data Analytics', '2026-09-18', 'PRESENT', 3, 'On time'),
(4, '23CSE005', 'Business Analytics', '2026-09-19', 'PRESENT', 2, 'Case study presentation');

-- Assignments Seed Data
INSERT INTO assignments (id, faculty_id, department, semester, subject_code, subject_name, title, description, max_marks, due_date) VALUES
(1, 2, 'Artificial Intelligence & Data Science', 5, '23ADT501', 'Deep Learning', 'Deep Learning Convolutional & ResNet Architecture Implementation', 'Implement a ResNet-style convolutional neural network from scratch using PyTorch/TensorFlow and train on CIFAR-10 dataset.', 100, '2026-10-05 23:59:00'),
(2, 3, 'Artificial Intelligence & Data Science', 5, '23CSE011', 'Cloud Service Management', 'Cloud Infrastructure Provisioning with Terraform & Kubernetes', 'Design and deploy a containerized microservices cluster with automated horizontal pod autoscaling on AWS/GCP.', 50, '2026-10-10 23:59:00'),
(3, 2, 'Artificial Intelligence & Data Science', 5, '23CBT502', 'Data and Information Security', 'Elliptic Curve Cryptography & Multi-Factor Auth Protocol', 'Build a secure handshake simulation with AES-256 GCM encryption and digital signature verification.', 50, '2026-10-18 23:59:00'),
(4, 3, 'Artificial Intelligence & Data Science', 5, '23ADT502', 'Big Data Analytics', 'Distributed Log Analytics with Apache PySpark & Hadoop HDFS', 'Process 10GB streaming clickstream logs and generate real-time metrics with Spark SQL and sliding window aggregations.', 50, '2026-10-24 23:59:00');

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
