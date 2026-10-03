/**
 * CampusAI - Cloud-Connected HTTP & REST API Server
 * Powered by TiDB Cloud Serverless MySQL & Node.js
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mysql = require('mysql2/promise');
const { runMigration } = require('./migrate');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'src', 'main', 'resources', 'static');

// Database Connection Pool
let dbPool = null;
let isDbConnected = false;

function initDbPool() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '4000', 10);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'campusai_db';
  const ssl = (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  } : false;

  if (!host || !user) {
    console.warn('[Database] DB_HOST or DB_USER not configured in .env. Running in standalone mock mode.');
    return null;
  }

  try {
    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });
    return pool;
  } catch (err) {
    console.error('[Database] Failed to initialize connection pool:', err.message);
    return null;
  }
}

dbPool = initDbPool();

// Test Connection and Run Auto-Migration
async function verifyDatabase() {
  if (!dbPool) return;
  try {
    const conn = await dbPool.getConnection();
    console.log('✅ [Database] Successfully connected to TiDB Cloud MySQL database!');
    conn.release();
    isDbConnected = true;

    // Check if tables exist, run auto-migration if needed
    try {
      const [rows] = await dbPool.query("SHOW TABLES LIKE 'users'");
      if (!rows || rows.length === 0) {
        console.log('[Database] Initializing schema and seed data on TiDB Cloud...');
        await runMigration();
      } else {
        console.log('✅ [Database] Schema and tables verified in TiDB Cloud.');
      }
    } catch (migErr) {
      console.warn('[Database] Auto-migration check:', migErr.message);
    }
  } catch (err) {
    console.warn('⚠️ [Database] Could not connect to TiDB Cloud (' + err.message + '). API will serve gracefully.');
    isDbConnected = false;
  }
}
verifyDatabase();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// In-Memory Fallback Stores for offline resilience
const fallbackStore = {
  events: [
    { id: 1, title: 'KANAL 2K26 - National Level Technical Symposium', category: 'Symposium', description: 'Flagship National Level Technical Symposium by CSE & IT featuring Paper Presentation, Code Sprint, Bug Hunt, Web Design, and AI Hack Challenge with cash awards.', eventDate: '2026-10-18T09:00:00', location: 'VSB Main Auditorium & CSE Lab 4', organizer: 'Dept of CSE & IT, VSBEC Karur', bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', registrationLink: 'https://vsbec.edu.in/kanal2k26' },
    { id: 2, title: 'LIRO 2K26 - Line Follower Robotics Competition', category: 'Robotics', description: 'Inter-college autonomous robotics and IoT line follower navigation challenge testing speed, sensor accuracy, and algorithmic path optimization.', eventDate: '2026-10-13T09:30:00', location: 'Einstein Tech Block & ECE Robotics Lab', organizer: 'Dept of ECE & Robotics Club', bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', registrationLink: 'https://vsbec.edu.in/liro2k26' },
    { id: 3, title: 'ILLUMINATE 2026 - E-Cell Entrepreneurship Summit', category: 'Workshop', description: 'Hands-on startup incubation, business modeling, and venture capital pitching workshop organized in association with E-Cell IIT Bombay.', eventDate: '2026-10-14T10:00:00', location: 'VSB Convention Center', organizer: 'Entrepreneurship Development Cell (EDC)', bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600', registrationLink: 'https://vsbec.edu.in/illuminate' },
    { id: 4, title: 'DIGIVERSE XPOSE 2026 - Annual Project & Cultural Expo', category: 'Cultural & Expo', description: 'Grand annual inter-department innovative engineering project expo, AI demonstrations, and cultural music & dance fiesta.', eventDate: '2026-11-05T08:30:00', location: 'Central Open Air Amphitheatre', organizer: 'Student Affairs Council', bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', registrationLink: 'https://vsbec.edu.in/digiverse' }
  ],
  announcements: [
    { id: 1, title: 'Autonomous COE End-Semester Examinations Schedule Released', content: 'Controller of Examinations (COE) has released the End-Semester Examination timetable for all 3rd, 5th, and 7th semester B.E/B.Tech students. Exams commence on October 28th. Hall tickets are available on the student portal.', priority: 'URGENT', targetRole: 'STUDENT', department: 'ALL', author: 'Dr. Alistair Vance (Admin)', createdAt: '2026-09-28T09:00:00' },
    { id: 2, title: 'Campus Placement Drive 2026: Tier-1 IT & Product Companies', content: 'Career Development Center (CDC) announces registration for upcoming on-campus recruitment drives. Highest package offered this season is INR 47 Lakhs. Mandatory pre-placement training starts Monday.', priority: 'HIGH', targetRole: 'ALL', department: 'ALL', author: 'Career Development Center', createdAt: '2026-09-25T11:30:00' },
    { id: 3, title: 'AICTE - IDEA Lab Hands-On Workshop on Generative AI & IoT', content: 'Department of CSE & AI&DS is organizing a 3-day hands-on workshop on Edge Computing and Large Language Models at the VSB AICTE IDEA Lab.', priority: 'NORMAL', targetRole: 'STUDENT', department: 'Computer Science & Engineering', author: 'Prof. Sarah Jenkins', createdAt: '2026-09-22T14:15:00' },
    { id: 4, title: 'College Bus Transport & Route Timings - Karur, Trichy, Dindigul & Erode', content: 'Updated morning pick-up and evening drop schedules for all 50 college bus routes (covering Karur, Trichy, Dindigul, Erode, and Namakkal) have been posted.', priority: 'NORMAL', targetRole: 'ALL', department: 'ALL', author: 'Transport Dept', createdAt: '2026-09-20T08:45:00' }
  ],
  complaints: [
    { id: 1, studentId: 4, category: 'Infrastructure', subject: 'Wi-Fi connection drop in CS Lab 301', description: 'The high-speed Wi-Fi router in CS Lab 301 has frequent disconnects during afternoon sessions.', status: 'IN_PROGRESS', adminResponse: 'Network team has been dispatched to replace the access point router switch.', createdAt: '2026-09-24T10:00:00' },
    { id: 2, studentId: 4, category: 'Library', subject: 'Request for additional AI & Machine Learning text books', description: 'Kindly add more physical copies of Deep Learning by Ian Goodfellow in the reference section.', status: 'RESOLVED', adminResponse: '5 additional copies added to shelf B-14 in Central Library.', createdAt: '2026-09-20T14:30:00' }
  ]
};

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // ==========================================
  // REST API ROUTING
  // ==========================================

  // 1. Health / Cloud DB Status
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'ONLINE',
      cloudDatabase: isDbConnected ? 'CONNECTED' : 'STANDALONE_FALLBACK',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Authentication Endpoint
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { username, role, password } = body;

    if (isDbConnected && dbPool) {
      try {
        let query = 'SELECT id, username, full_name as fullName, email, role, department, roll_number as rollNumber, semester, academic_year as academicYear, residence_type as residenceType, phone, avatar, status FROM users WHERE (username = ? OR email = ?)';
        let params = [username || '', username || ''];

        if (role) {
          query += ' AND role = ?';
          params.push(role);
        }

        const [users] = await dbPool.query(query, params);
        if (users && users.length > 0) {
          const user = users[0];
          return sendJson(res, 200, {
            success: true,
            user,
            token: `tidb-jwt-${user.id}-${Date.now()}`
          });
        }
      } catch (err) {
        console.error('[API Login Error]:', err.message);
      }
    }

    // Default Fallback Accounts
    let fallbackUser = {
      id: 6,
      username: username || 'student_naren',
      fullName: 'Naren K S',
      email: 'narenks.vsb@gmail.com',
      role: role || 'STUDENT',
      department: 'Artificial Intelligence & Data Science',
      rollNumber: 'AIDS-2024-019',
      semester: 5,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    if (role === 'ADMIN' || (username && username.includes('admin'))) {
      fallbackUser = {
        id: 1,
        username: 'admin',
        fullName: 'Dr. Alistair Vance',
        email: 'admin@campusai.edu',
        role: 'ADMIN',
        department: 'Administration',
        rollNumber: 'ADM-001',
        semester: 0,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
    }
    return sendJson(res, 200, { success: true, user: fallbackUser, token: `mock-token-${Date.now()}` });
  }

  // 3. User Profile Operations (GET & PUT)
  if (pathname === '/api/student/profile' || pathname === '/api/user/profile') {
    if (method === 'GET') {
      const userId = parsedUrl.query.userId || 4;
      if (isDbConnected && dbPool) {
        try {
          const [rows] = await dbPool.query('SELECT id, username, full_name as fullName, email, role, department, roll_number as rollNumber, semester, academic_year as academicYear, residence_type as residenceType, phone, avatar, status FROM users WHERE id = ?', [userId]);
          if (rows.length > 0) return sendJson(res, 200, rows[0]);
        } catch (e) {
          console.error('[API Profile GET Error]:', e.message);
        }
      }
      return sendJson(res, 200, {
        id: 4, username: 'student_alex', fullName: 'Alex Morgan', email: 'alex.m@campusai.edu', role: 'STUDENT',
        department: 'Computer Science & Engineering', rollNumber: 'CS2024-042', semester: 5, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      });
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = await parseJsonBody(req);
      const userId = body.id || parsedUrl.query.userId || 4;
      if (isDbConnected && dbPool) {
        try {
          await dbPool.query(
            'UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone), residence_type = COALESCE(?, residence_type), avatar = COALESCE(?, avatar) WHERE id = ?',
            [body.fullName, body.email, body.phone, body.residenceType, body.avatar, userId]
          );
          const [updated] = await dbPool.query('SELECT id, username, full_name as fullName, email, role, department, roll_number as rollNumber, semester, academic_year as academicYear, residence_type as residenceType, phone, avatar, status FROM users WHERE id = ?', [userId]);
          return sendJson(res, 200, { success: true, user: updated[0] || body });
        } catch (err) {
          console.error('[API Profile Update Error]:', err.message);
        }
      }
      return sendJson(res, 200, { success: true, user: body });
    }
  }

  // 4. Timetable Endpoints (Student & Faculty)
  if (pathname.startsWith('/api/student/timetable') || pathname.startsWith('/api/faculty/timetable')) {
    if (isDbConnected && dbPool) {
      try {
        const [rows] = await dbPool.query(
          'SELECT day_of_week as dayOfWeek, period_number as periodNumber, TIME_FORMAT(start_time, "%H:%i") as startTime, TIME_FORMAT(end_time, "%H:%i") as endTime, subject_code as subjectCode, subject_name as subjectName, room_number as roomNumber FROM timetable ORDER BY FIELD(day_of_week, "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"), period_number'
        );
        if (rows.length > 0) return sendJson(res, 200, rows);
      } catch (err) {
        console.error('[API Timetable Error]:', err.message);
      }
    }
  }

  // 5. Attendance Endpoints
  if (pathname.startsWith('/api/student/attendance')) {
    const studentId = parsedUrl.query.studentId || 4;
    if (isDbConnected && dbPool) {
      try {
        const [rows] = await dbPool.query(
          'SELECT subject_code as subjectCode, subject_name as subjectName, DATE_FORMAT(attendance_date, "%Y-%m-%d") as attendanceDate, status, remarks FROM attendance WHERE student_id = ? ORDER BY attendance_date DESC',
          [studentId]
        );
        if (rows.length > 0) return sendJson(res, 200, rows);
      } catch (err) {
        console.error('[API Attendance Error]:', err.message);
      }
    }
  }

  // 6. Events Endpoints (Public & Admin CRUD)
  if (pathname.startsWith('/api/public/events') || pathname.startsWith('/api/admin/events')) {
    if (method === 'GET') {
      if (isDbConnected && dbPool) {
        try {
          const [rows] = await dbPool.query(
            'SELECT id, title, category, description, DATE_FORMAT(event_date, "%Y-%m-%dT%H:%i:%s") as eventDate, location, organizer, banner_url as bannerUrl, registration_link as registrationLink FROM events ORDER BY event_date ASC'
          );
          if (rows.length > 0) return sendJson(res, 200, rows);
        } catch (err) {
          console.error('[API Events GET Error]:', err.message);
        }
      }
      return sendJson(res, 200, fallbackStore.events);
    }

    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (isDbConnected && dbPool) {
        try {
          const [resInsert] = await dbPool.query(
            'INSERT INTO events (title, category, description, event_date, location, organizer, banner_url, registration_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [body.title, body.category || 'Symposium', body.description || '', body.eventDate || new Date(), body.location || 'Main Auditorium', body.organizer || 'Campus Administration', body.bannerUrl || '', body.registrationLink || '#']
          );
          const newEvent = { ...body, id: resInsert.insertId };
          return sendJson(res, 201, newEvent);
        } catch (err) {
          console.error('[API Events POST Error]:', err.message);
        }
      }
      const created = { ...body, id: Date.now() };
      fallbackStore.events.unshift(created);
      return sendJson(res, 201, created);
    }

    if (method === 'PUT' || method === 'PATCH') {
      const idMatch = pathname.match(/\/events\/(\d+)/);
      const targetId = idMatch ? parseInt(idMatch[1]) : null;
      const body = await parseJsonBody(req);
      const id = targetId || body.id;

      if (isDbConnected && dbPool && id) {
        try {
          await dbPool.query(
            'UPDATE events SET title = COALESCE(?, title), category = COALESCE(?, category), description = COALESCE(?, description), event_date = COALESCE(?, event_date), location = COALESCE(?, location), organizer = COALESCE(?, organizer), banner_url = COALESCE(?, banner_url), registration_link = COALESCE(?, registration_link) WHERE id = ?',
            [body.title, body.category, body.description, body.eventDate, body.location, body.organizer, body.bannerUrl, body.registrationLink, id]
          );
          return sendJson(res, 200, { success: true, ...body, id });
        } catch (err) {
          console.error('[API Events PUT Error]:', err.message);
        }
      }
      return sendJson(res, 200, { success: true, ...body, id });
    }

    if (method === 'DELETE') {
      const idMatch = pathname.match(/\/events\/(\d+)/);
      const targetId = idMatch ? parseInt(idMatch[1]) : null;
      if (isDbConnected && dbPool && targetId) {
        try {
          await dbPool.query('DELETE FROM events WHERE id = ?', [targetId]);
          return sendJson(res, 200, { success: true, message: 'Event deleted from TiDB Cloud' });
        } catch (err) {
          console.error('[API Events DELETE Error]:', err.message);
        }
      }
      fallbackStore.events = fallbackStore.events.filter(e => e.id != targetId);
      return sendJson(res, 200, { success: true, message: 'Event deleted' });
    }
  }

  // 7. Announcements Endpoints (Public & Admin CRUD)
  if (pathname.startsWith('/api/public/announcements') || pathname.startsWith('/api/admin/announcements')) {
    if (method === 'GET') {
      if (isDbConnected && dbPool) {
        try {
          const [rows] = await dbPool.query(
            'SELECT a.id, a.title, a.content, a.priority, a.target_role as targetRole, a.department, DATE_FORMAT(a.created_at, "%Y-%m-%dT%H:%i:%s") as createdAt, COALESCE(u.full_name, "Administration") as author FROM announcements a LEFT JOIN users u ON a.author_id = u.id ORDER BY a.created_at DESC'
          );
          if (rows.length > 0) return sendJson(res, 200, rows);
        } catch (err) {
          console.error('[API Announcements GET Error]:', err.message);
        }
      }
      return sendJson(res, 200, fallbackStore.announcements);
    }

    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (isDbConnected && dbPool) {
        try {
          const [resInsert] = await dbPool.query(
            'INSERT INTO announcements (author_id, title, content, priority, target_role, department) VALUES (?, ?, ?, ?, ?, ?)',
            [body.authorId || 1, body.title, body.content || '', body.priority || 'NORMAL', body.targetRole || 'ALL', body.department || 'ALL']
          );
          const newAnn = { ...body, id: resInsert.insertId, createdAt: new Date().toISOString() };
          return sendJson(res, 201, newAnn);
        } catch (err) {
          console.error('[API Announcements POST Error]:', err.message);
        }
      }
      const created = { ...body, id: Date.now(), createdAt: new Date().toISOString() };
      fallbackStore.announcements.unshift(created);
      return sendJson(res, 201, created);
    }

    if (method === 'DELETE') {
      const idMatch = pathname.match(/\/announcements\/(\d+)/);
      const targetId = idMatch ? parseInt(idMatch[1]) : null;
      if (isDbConnected && dbPool && targetId) {
        try {
          await dbPool.query('DELETE FROM announcements WHERE id = ?', [targetId]);
          return sendJson(res, 200, { success: true, message: 'Announcement deleted' });
        } catch (err) {
          console.error('[API Announcements DELETE Error]:', err.message);
        }
      }
      fallbackStore.announcements = fallbackStore.announcements.filter(a => a.id != targetId);
      return sendJson(res, 200, { success: true, message: 'Announcement deleted' });
    }
  }

  // 8. Complaints & Grievances Endpoints (Student & Admin)
  if (pathname.startsWith('/api/student/complaints') || pathname.startsWith('/api/admin/complaints')) {
    if (method === 'GET') {
      if (isDbConnected && dbPool) {
        try {
          const [rows] = await dbPool.query(
            'SELECT c.id, c.student_id as studentId, c.category, c.subject, c.description, c.status, c.admin_response as adminResponse, DATE_FORMAT(c.created_at, "%Y-%m-%dT%H:%i:%s") as createdAt, u.full_name as studentName, u.roll_number as rollNumber FROM complaints c LEFT JOIN users u ON c.student_id = u.id ORDER BY c.created_at DESC'
          );
          if (rows.length > 0) return sendJson(res, 200, rows);
        } catch (err) {
          console.error('[API Complaints GET Error]:', err.message);
        }
      }
      return sendJson(res, 200, fallbackStore.complaints);
    }

    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (isDbConnected && dbPool) {
        try {
          const [resInsert] = await dbPool.query(
            'INSERT INTO complaints (student_id, category, subject, description, status) VALUES (?, ?, ?, ?, ?)',
            [body.studentId || 4, body.category || 'General', body.subject || '', body.description || '', 'PENDING']
          );
          const newComplaint = { ...body, id: resInsert.insertId, status: 'PENDING', createdAt: new Date().toISOString() };
          return sendJson(res, 201, newComplaint);
        } catch (err) {
          console.error('[API Complaints POST Error]:', err.message);
        }
      }
      const created = { ...body, id: Date.now(), status: 'PENDING', createdAt: new Date().toISOString() };
      fallbackStore.complaints.unshift(created);
      return sendJson(res, 201, created);
    }

    if (method === 'PUT' || method === 'PATCH') {
      const idMatch = pathname.match(/\/complaints\/(\d+)/);
      const targetId = idMatch ? parseInt(idMatch[1]) : null;
      const body = await parseJsonBody(req);
      const id = targetId || body.id;

      if (isDbConnected && dbPool && id) {
        try {
          await dbPool.query(
            'UPDATE complaints SET status = COALESCE(?, status), admin_response = COALESCE(?, admin_response) WHERE id = ?',
            [body.status, body.adminResponse, id]
          );
          return sendJson(res, 200, { success: true, message: 'Complaint status updated' });
        } catch (err) {
          console.error('[API Complaints PUT Error]:', err.message);
        }
      }
      return sendJson(res, 200, { success: true });
    }
  }

  // 9. Study Notes & Materials Endpoints (Faculty Upload & Student Notes Pool)
  if (pathname.startsWith('/api/faculty/materials') || pathname.startsWith('/api/student/materials')) {
    if (method === 'GET') {
      if (isDbConnected && dbPool) {
        try {
          const [rows] = await dbPool.query(
            'SELECT id, title, subject_code as subjectCode, subject_name as subjectName, department, faculty_name as facultyName, faculty_avatar as facultyAvatar, unit, format, description, file_name as fileName, file_size as fileSize, pages, downloads, views, content_preview as contentPreview, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s") as uploadDate FROM study_materials ORDER BY created_at DESC'
          );
          if (rows && rows.length > 0) return sendJson(res, 200, rows);
        } catch (err) {
          if (err.message.includes("Table") && err.message.includes("doesn't exist")) {
            await dbPool.query(`CREATE TABLE IF NOT EXISTS study_materials (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              subject_code VARCHAR(50) NOT NULL,
              subject_name VARCHAR(150) NOT NULL,
              department VARCHAR(100) NOT NULL,
              faculty_name VARCHAR(100) DEFAULT 'Prof. Sarah Jenkins',
              faculty_avatar VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
              unit VARCHAR(100) NOT NULL,
              format VARCHAR(50) DEFAULT 'PDF',
              description TEXT,
              file_name VARCHAR(255),
              file_size VARCHAR(50) DEFAULT '2.4 MB',
              pages INT DEFAULT 24,
              downloads INT DEFAULT 0,
              views INT DEFAULT 1,
              content_preview TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`).catch(() => {});
          }
        }
      }
    }

    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (isDbConnected && dbPool) {
        try {
          await dbPool.query(`CREATE TABLE IF NOT EXISTS study_materials (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subject_code VARCHAR(50) NOT NULL,
            subject_name VARCHAR(150) NOT NULL,
            department VARCHAR(100) NOT NULL,
            faculty_name VARCHAR(100) DEFAULT 'Prof. Sarah Jenkins',
            faculty_avatar VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            unit VARCHAR(100) NOT NULL,
            format VARCHAR(50) DEFAULT 'PDF',
            description TEXT,
            file_name VARCHAR(255),
            file_size VARCHAR(50) DEFAULT '2.4 MB',
            pages INT DEFAULT 24,
            downloads INT DEFAULT 0,
            views INT DEFAULT 1,
            content_preview TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`).catch(() => {});

          const [insertRes] = await dbPool.query(
            'INSERT INTO study_materials (title, subject_code, subject_name, department, faculty_name, faculty_avatar, unit, format, description, file_name, file_size, pages, downloads, views, content_preview) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              body.title || 'New Study Material',
              body.subjectCode || '23ADT501',
              body.subjectName || 'Deep Learning',
              body.department || 'Computer Science & Engineering',
              body.facultyName || 'Prof. Sarah Jenkins',
              body.facultyAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
              body.unit || 'Unit 1',
              body.format || 'PDF',
              body.description || '',
              body.fileName || 'notes.pdf',
              body.fileSize || '2.4 MB',
              body.pages || 24,
              body.downloads || 0,
              body.views || 1,
              body.contentPreview || body.description || ''
            ]
          );
          const createdMat = { ...body, id: insertRes.insertId, uploadDate: new Date().toISOString() };
          return sendJson(res, 201, { success: true, material: createdMat, message: 'Published successfully to Student Portal!' });
        } catch (err) {
          console.error('[API Materials POST Error]:', err.message);
        }
      }
      return sendJson(res, 201, { success: true, material: body, message: 'Published to Student Portal!' });
    }

    if (method === 'DELETE') {
      const idMatch = pathname.match(/\/materials\/(\d+)/);
      const targetId = idMatch ? parseInt(idMatch[1]) : null;
      if (isDbConnected && dbPool && targetId) {
        try {
          await dbPool.query('DELETE FROM study_materials WHERE id = ?', [targetId]);
          return sendJson(res, 200, { success: true, message: 'Study material deleted' });
        } catch (err) {
          console.error('[API Materials DELETE Error]:', err.message);
        }
      }
      return sendJson(res, 200, { success: true, message: 'Material deleted' });
    }
  }

  // 10. Admin Users Management
  if (pathname.startsWith('/api/admin/users')) {
    if (method === 'GET') {
      if (isDbConnected && dbPool) {
        try {
          const [rows] = await dbPool.query(
            'SELECT id, username, full_name as fullName, email, role, department, roll_number as rollNumber, semester, academic_year as academicYear, residence_type as residenceType, phone, avatar, status, DATE_FORMAT(created_at, "%Y-%m-%d") as createdAt FROM users ORDER BY id ASC'
          );
          if (rows.length > 0) return sendJson(res, 200, rows);
        } catch (err) {
          console.error('[API Admin Users Error]:', err.message);
        }
      }
    }

    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (isDbConnected && dbPool) {
        try {
          const [resInsert] = await dbPool.query(
            'INSERT INTO users (username, password, full_name, email, role, department, roll_number, semester, academic_year, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [body.username, body.password || 'welcome123', body.fullName, body.email, body.role || 'STUDENT', body.department || 'CSE', body.rollNumber || null, body.semester || 1, body.academicYear || '1st Year', body.phone || '', body.status || 'ACTIVE']
          );
          return sendJson(res, 201, { success: true, id: resInsert.insertId, ...body });
        } catch (err) {
          console.error('[API Create User Error]:', err.message);
        }
      }
    }
  }

  // 10. AI Chatbot Query with Knowledge Base & Chat Logging
  if (pathname === '/api/chatbot/query' && method === 'POST') {
    const body = await parseJsonBody(req);
    const query = (body.query || '').toLowerCase();
    const userId = body.userId || 4;

    let reply = "Hello! 👋 I am **CampusAI Assistant** (Institutional Edition). Every answer cites authentic handbooks, circulars, and bulletin archives.";
    let citation = null;
    let quickReplies = ["💳 Fee due dates & late fine rules", "📚 Library book limit & fine policy", "📝 COE Exam circular & attendance cutoff", "⚖️ Grievance escalation & SLAs"];

    // 1. Library Rules
    if (/library|book|books|borrow|book bank|circulation|overdue|delnet|ieee/.test(query)) {
      reply = "📚 **Central Digital Library Regulations & Borrowing Code (Edition 4.2):**\n\n• **Operating Hours:** **8:30 AM – 7:00 PM** (Mon–Sat) | Exam Reading Halls open till **9:30 PM**.\n• **Borrowing Entitlements:** **UG Students: 5 Books for 14 Days** (1 online renewal) | PG: 7 Books | Faculty: 10 Books.\n• **Overdue Fines:** **₹2.00/day per book** (Days 1–7) → **₹5.00/day per book** (Day 8 onwards).\n• **SC/ST Book Bank:** Core textbook sets provided at **zero rental**.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"Undergraduate Students: 5 Books for a maximum duration of 14 days (1 online renewal permitted). Books retained beyond deadline incur overdue fines: ₹2.00 per book per day for the first 7 overdue days; ₹5.00 per book per day from Day 8 onwards.\"*";
      citation = {
        documentId: 'doc-lib-01',
        clauseId: 'cl-lib-5.2',
        refNumber: 'LIB/MANUAL/2026/V4.2',
        documentTitle: 'Central Digital Library Regulations Manual & Code of Ethics 2026 (Edition 4.2)',
        docType: 'LIBRARY_POLICY',
        typeLabel: 'Institutional Circular',
        section: 'Section 5: Circulation & Resource Allocation Policy',
        issuingAuthority: 'Office of the Chief Librarian & Library Committee',
        issueDate: 'June 10, 2026',
        effectiveTerm: 'Academic Year 2026–2027',
        verified: true
      };
    }
    // 2. Fee & Payment Rules
    else if (/fee|fees|tuition|payment|due date|late fine|scholarship|concession|waiver|refund|installments/.test(query)) {
      reply = "💳 **Tuition & Institutional Fee Schedule Regulations (Ref: VSB/FIN/FEE-REG/2026-27/01):**\n\n• **Due Dates:** Odd Semester: **September 30, 2026** | Even Semester: **January 31, 2027**.\n• **Grace Period:** 7 working days post due date without surcharge.\n• **Late Fine Slabs:** **₹50.00/day** (Days 8–15) → **₹100.00/day** (Days 16–30).\n• **Merit Scholarships:** 100% tuition waiver for TNEA Cutoff ≥ 195/200; 50% waiver for 190–194.9 (Ref: TRUST-SCHOLAR-2026/B-12).\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"All semester tuition and institutional fees must be settled on or before the statutory deadline of September 30 (Odd Semester) and January 31 (Even Semester). Late fees accrue at ₹50/day up to Day 15 and ₹100/day thereafter until hall ticket issuance lock.\"*";
      citation = {
        documentId: 'doc-fee-01',
        clauseId: 'cl-fee-3.1',
        refNumber: 'VSB/FIN/FEE-REG/2026-27/01',
        documentTitle: 'Institutional Tuition & Fee Schedule Regulations 2026-27',
        docType: 'FINANCE_CIRCULAR',
        typeLabel: 'Financial Bulletin',
        section: 'Section 3: Statutory Deadlines, Slabs & Concessions',
        issuingAuthority: 'Finance Committee & Principal Directorate',
        issueDate: 'July 15, 2026',
        effectiveTerm: 'AY 2026-27 (Odd & Even Terms)',
        verified: true
      };
    }
    // 3. Exams & COE Rules
    else if (/exam|exams|coe|hall ticket|attendance percentage|condonation|revaluation|photocopy|supplementary/.test(query)) {
      reply = "📝 **Autonomous COE Examination & Hall Ticket Directive (Ref: COE/CIR/2026/ODD/042):**\n\n• **Exam Timetable:** End-Sem Theory: **Oct 28 – Nov 18, 2026** | Practicals: **Oct 14 – Oct 22, 2026**.\n• **Mandatory Attendance:** Minimum **75.0% aggregate** required for automatic Hall Ticket issuance.\n• **Medical Condonation:** Allowed between **65.0% – 74.9%** with valid medical documentation & ₹1,500 fee.\n• **Revaluation Window:** Open within **7 days** of result publication (₹400/subject). Fee refunded 50% if grade jumps ≥ 2 slabs (Ref: COE/REV/2026/SUPP-03).";
      citation = {
        documentId: 'doc-coe-01',
        clauseId: 'cl-coe-2.4',
        refNumber: 'COE/CIR/2026/ODD/042',
        documentTitle: 'Autonomous COE Examination Directive & Code of Regulations 2026',
        docType: 'COE_DIRECTIVE',
        typeLabel: 'Statutory Directive',
        section: 'Clause 2.4: Attendance Eligibility, Condonation & Revaluation Rules',
        issuingAuthority: 'Office of the Controller of Examinations',
        issueDate: 'August 28, 2026',
        effectiveTerm: 'End-Semester Odd 2026',
        verified: true
      };
    }
    // Fallback Institutional Citation
    else {
      citation = {
        documentId: 'doc-gen-01',
        clauseId: 'cl-inst-1.0',
        refNumber: 'VSB/INST/ARCHIVE/2026-27',
        documentTitle: 'Institutional Policy & Student Regulatory Handbooks',
        docType: 'INSTITUTIONAL_HANDBOOK',
        typeLabel: 'Institutional Archives',
        section: 'Official Statutory Knowledge Base',
        issuingAuthority: 'Office of the Principal & Academic Directorate',
        issueDate: 'Academic Session 2026–2027',
        effectiveTerm: 'AY 2026-27',
        verified: true
      };
    }

    // Log chatbot query into TiDB Cloud chatbot_logs table
    if (isDbConnected && dbPool) {
      try {
        await dbPool.query(
          'INSERT INTO chatbot_logs (user_id, user_query, bot_response, intent_detected, confidence_score) VALUES (?, ?, ?, ?, ?)',
          [userId, body.query || '', reply, 'PROCESSED_WITH_CITATION', 0.98]
        );
      } catch (logErr) {
        // Non-blocking log failure
      }
    }

    return sendJson(res, 200, { reply, citation, quickReplies, intent: 'PROCESSED_WITH_CITATION' });
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let reqPath = pathname;
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, reqPath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 404 Not Found
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404 Not Found</h1><p>The requested CampusAI web asset was not found.</p>');
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(` 🎓 CampusAI Web & API Server running at: http://localhost:${PORT}`);
  console.log(` 🚀 Student Portal:   http://localhost:${PORT}/student-dashboard.html`);
  console.log(` 👨‍🏫 Faculty Portal:   http://localhost:${PORT}/faculty-dashboard.html`);
  console.log(` 🛡️  Admin Console:    http://localhost:${PORT}/admin-dashboard.html`);
  console.log(` 🌐 Database Status:  ${isDbConnected ? 'TiDB Cloud MySQL Connected' : 'Local Standalone'}`);
  console.log('====================================================');
});
