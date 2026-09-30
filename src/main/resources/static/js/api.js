/**
 * CampusAI - Central API & State Management
 */

const API_BASE = window.location.origin.includes('http') && !window.location.origin.includes('file')
  ? `${window.location.origin}/api`
  : 'http://localhost:8080/api';

// Current active session
const AuthState = {
  getUser() {
    const u = localStorage.getItem('campusai_user');
    if (u) {
      try { return JSON.parse(u); } catch(e){}
    }
    // Default fallback demo user (Student: Alex Morgan)
    return {
      id: 4,
      username: 'student_alex',
      fullName: 'Alex Morgan',
      email: 'alex.m@campusai.edu',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS2024-042',
      semester: 5,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    };
  },
  setUser(user) {
    localStorage.setItem('campusai_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('campusai_user');
    localStorage.removeItem('campusai_token');
    window.location.href = 'login.html';
  }
};

// ==========================================
// Theme Management (Dark & Light Mode Switch)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('campusai_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  updateThemeButtons(savedTheme);
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  const theme = isLight ? 'light' : 'dark';
  localStorage.setItem('campusai_theme', theme);
  updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon) {
      if (theme === 'light') {
        icon.className = 'fa-solid fa-moon';
        btn.setAttribute('title', 'Switch to Dark Mode');
      } else {
        icon.className = 'fa-solid fa-sun';
        btn.setAttribute('title', 'Switch to Light Mode');
      }
    }
  });
}

// Auto-run theme initialization as early as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Central API Request helper with graceful mock fallback
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('campusai_token') || ''}`
      }
    };
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[CampusAI API] Real backend endpoint ${endpoint} unavailable, serving smart local data fallback.`, err);
    return getLocalFallbackData(endpoint, method, data);
  }
}

// Local mock database fallback so everything works in browser out-of-the-box
function getLocalFallbackData(endpoint, method, data) {
  const currentUser = AuthState.getUser();

  if (endpoint.startsWith('/auth/login')) {
    const { username, role } = data || {};
    let matchedUser = {
      id: 4,
      username: username || 'student_alex',
      fullName: 'Alex Morgan',
      email: 'alex.m@campusai.edu',
      role: role || 'STUDENT',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS2024-042',
      semester: 5,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    };
    if (role === 'FACULTY' || (username && username.includes('faculty'))) {
      matchedUser = {
        id: 2,
        username: 'faculty_smith',
        fullName: 'Prof. Sarah Jenkins',
        email: 's.jenkins@campusai.edu',
        role: 'FACULTY',
        department: 'Computer Science & Engineering',
        rollNumber: 'FAC-CS-101',
        semester: 0,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      };
    } else if (role === 'ADMIN' || (username && username.includes('admin'))) {
      matchedUser = {
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
    return { success: true, user: matchedUser, token: 'demo-token-' + Date.now() };
  }

  if (endpoint.startsWith('/student/dashboard-stats')) {
    return {
      student: currentUser,
      totalClasses: 24,
      presentClasses: 21,
      attendancePercent: 87.5,
      totalAssignments: 3,
      pendingAssignments: 2,
      submittedAssignments: 1,
      totalComplaints: 2
    };
  }

  if (endpoint.startsWith('/student/attendance')) {
    return [
      { subjectCode: 'CS501', subjectName: 'Artificial Intelligence & Neural Nets', attendanceDate: '2026-09-22', status: 'PRESENT', remarks: 'Active engagement' },
      { subjectCode: 'CS501', subjectName: 'Artificial Intelligence & Neural Nets', attendanceDate: '2026-09-15', status: 'PRESENT', remarks: 'On time' },
      { subjectCode: 'CS501', subjectName: 'Artificial Intelligence & Neural Nets', attendanceDate: '2026-09-08', status: 'ABSENT', remarks: 'Medical leave' },
      { subjectCode: 'CS502', subjectName: 'Database Management Systems', attendanceDate: '2026-09-23', status: 'PRESENT', remarks: 'Lab complete' },
      { subjectCode: 'CS502', subjectName: 'Database Management Systems', attendanceDate: '2026-09-16', status: 'PRESENT', remarks: 'On time' },
      { subjectCode: 'CS503', subjectName: 'Operating Systems & Concurrency', attendanceDate: '2026-09-24', status: 'PRESENT', remarks: 'On time' },
      { subjectCode: 'CS503', subjectName: 'Operating Systems & Concurrency', attendanceDate: '2026-09-10', status: 'ABSENT', remarks: 'Unexcused' },
      { subjectCode: 'CS504', subjectName: 'Cloud Computing Architecture', attendanceDate: '2026-09-25', status: 'PRESENT', remarks: 'On time' }
    ];
  }

  if (endpoint.startsWith('/student/timetable') || endpoint.startsWith('/faculty/timetable')) {
    return [
      { dayOfWeek: 'MONDAY', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS501', subjectName: 'Artificial Intelligence & Neural Nets', roomNumber: 'Lab 301' },
      { dayOfWeek: 'MONDAY', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS502', subjectName: 'Database Management Systems', roomNumber: 'Room 204' },
      { dayOfWeek: 'MONDAY', periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectCode: 'CS503', subjectName: 'Operating Systems & Concurrency', roomNumber: 'Room 204' },
      { dayOfWeek: 'MONDAY', periodNumber: 4, startTime: '13:00', endTime: '14:30', subjectCode: 'CS504', subjectName: 'Cloud Computing Architecture', roomNumber: 'Lab 102' },
      { dayOfWeek: 'TUESDAY', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS502', subjectName: 'Database Management Systems', roomNumber: 'Room 204' },
      { dayOfWeek: 'TUESDAY', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS505', subjectName: 'Software Engineering & Agile', roomNumber: 'Room 205' },
      { dayOfWeek: 'TUESDAY', periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectCode: 'CS501', subjectName: 'Artificial Intelligence & Neural Nets', roomNumber: 'Lab 301' },
      { dayOfWeek: 'TUESDAY', periodNumber: 4, startTime: '13:00', endTime: '15:00', subjectCode: 'CS506', subjectName: 'Full-Stack Java Web Lab', roomNumber: 'Lab 402' },
      { dayOfWeek: 'WEDNESDAY', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS504', subjectName: 'Cloud Computing Architecture', roomNumber: 'Room 204' },
      { dayOfWeek: 'WEDNESDAY', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS503', subjectName: 'Operating Systems & Concurrency', roomNumber: 'Room 204' },
      { dayOfWeek: 'WEDNESDAY', periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectCode: 'CS505', subjectName: 'Software Engineering & Agile', roomNumber: 'Room 205' },
      { dayOfWeek: 'THURSDAY', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS501', subjectName: 'Artificial Intelligence & Neural Nets', roomNumber: 'Lab 301' },
      { dayOfWeek: 'THURSDAY', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS502', subjectName: 'Database Management Systems', roomNumber: 'Room 204' },
      { dayOfWeek: 'THURSDAY', periodNumber: 3, startTime: '11:15', endTime: '13:15', subjectCode: 'CS507', subjectName: 'AI Capstone Project', roomNumber: 'AI Center' },
      { dayOfWeek: 'FRIDAY', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS505', subjectName: 'Software Engineering & Agile', roomNumber: 'Room 205' },
      { dayOfWeek: 'FRIDAY', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS504', subjectName: 'Cloud Computing Architecture', roomNumber: 'Room 204' },
      { dayOfWeek: 'FRIDAY', periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectCode: 'CS503', subjectName: 'Operating Systems & Concurrency', roomNumber: 'Room 204' }
    ];
  }

  if (endpoint.startsWith('/student/assignments') || endpoint.startsWith('/faculty/assignments')) {
    return [
      {
        assignment: {
          id: 1,
          title: 'Neural Network Backpropagation Implementation',
          subjectCode: 'CS501',
          subjectName: 'Artificial Intelligence & Neural Nets',
          description: 'Implement a 3-layer neural network from scratch in Java or Python and train on MNIST dataset. Submit code and accuracy chart.',
          maxMarks: 100,
          dueDate: '2026-10-05T23:59:00'
        },
        submission: {
          id: 1,
          status: 'GRADED',
          marksObtained: 94,
          feedback: 'Outstanding mathematical derivation and accurate loss curves.'
        }
      },
      {
        assignment: {
          id: 2,
          title: 'Enterprise E-Commerce Relational Schema & Queries',
          subjectCode: 'CS502',
          subjectName: 'Database Management Systems',
          description: 'Design normalized schema in 3NF and write 15 complex analytical queries with indexing performance benchmarks.',
          maxMarks: 50,
          dueDate: '2026-10-10T23:59:00'
        },
        submission: null
      },
      {
        assignment: {
          id: 3,
          title: 'Multithreaded Producer-Consumer Simulator',
          subjectCode: 'CS503',
          subjectName: 'Operating Systems & Concurrency',
          description: 'Build a concurrent buffer simulation with mutex locks, semaphores, and starvation prevention.',
          maxMarks: 50,
          dueDate: '2026-10-18T23:59:00'
        },
        submission: null
      }
    ];
  }

  if (endpoint.startsWith('/admin/events') && method === 'DELETE') {
    const idMatch = endpoint.match(/\/admin\/events\/(\d+)/);
    const targetId = idMatch ? parseInt(idMatch[1]) : (body && body.id);
    let events = [];
    try {
      events = JSON.parse(localStorage.getItem('campusai_events_data')) || [];
    } catch(e) { events = []; }
    events = events.filter(ev => ev.id != targetId);
    localStorage.setItem('campusai_events_data', JSON.stringify(events));
    return { success: true, message: 'Event deleted successfully' };
  }

  if (endpoint.startsWith('/admin/events') && (method === 'PUT' || method === 'PATCH')) {
    const idMatch = endpoint.match(/\/admin\/events\/(\d+)/);
    const targetId = idMatch ? parseInt(idMatch[1]) : (body && body.id);
    let events = [];
    try {
      events = JSON.parse(localStorage.getItem('campusai_events_data')) || [];
    } catch(e) { events = []; }
    const idx = events.findIndex(ev => ev.id == targetId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...body };
      localStorage.setItem('campusai_events_data', JSON.stringify(events));
      return events[idx];
    }
    return body;
  }

  if (endpoint.startsWith('/admin/events') && method === 'POST') {
    let events = [];
    try {
      events = JSON.parse(localStorage.getItem('campusai_events_data')) || [];
    } catch(e) { events = []; }
    if (!events.length) {
      events = [
        { id: 1, title: 'KANAL 2K26 - National Level Technical Symposium', category: 'Symposium', description: 'Flagship National Level Technical Symposium by CSE & IT featuring Paper Presentation, Code Sprint, Bug Hunt, Web Design, and AI Hack Challenge with cash awards.', eventDate: '2026-10-18T09:00:00', location: 'VSB Main Auditorium & CSE Lab 4', organizer: 'Dept of CSE & IT, VSBEC Karur', bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', registrationLink: 'https://vsbec.edu.in/kanal2k26' },
        { id: 2, title: 'LIRO 2K26 - Line Follower Robotics Competition', category: 'Robotics', description: 'Inter-college autonomous robotics and IoT line follower navigation challenge testing speed, sensor accuracy, and algorithmic path optimization.', eventDate: '2026-10-13T09:30:00', location: 'Einstein Tech Block & ECE Robotics Lab', organizer: 'Dept of ECE & Robotics Club', bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', registrationLink: 'https://vsbec.edu.in/liro2k26' },
        { id: 3, title: 'ILLUMINATE 2026 - E-Cell Entrepreneurship Summit', category: 'Workshop', description: 'Hands-on startup incubation, business modeling, and venture capital pitching workshop organized in association with E-Cell IIT Bombay.', eventDate: '2026-10-14T10:00:00', location: 'VSB Convention Center', organizer: 'Entrepreneurship Development Cell (EDC)', bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600', registrationLink: 'https://vsbec.edu.in/illuminate' },
        { id: 4, title: 'DIGIVERSE XPOSE 2026 - Annual Project & Cultural Expo', category: 'Cultural & Expo', description: 'Grand annual inter-department innovative engineering project expo, AI demonstrations, and cultural music & dance fiesta.', eventDate: '2026-11-05T08:30:00', location: 'Central Open Air Amphitheatre', organizer: 'Student Affairs Council', bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', registrationLink: 'https://vsbec.edu.in/digiverse' }
      ];
    }
    const createdEvent = {
      id: Date.now(),
      title: body.title || 'New Campus Event',
      category: body.category || 'Symposium',
      description: body.description || '',
      eventDate: body.eventDate || new Date().toISOString(),
      location: body.location || 'Campus Main Auditorium',
      organizer: body.organizer || 'Campus Administration',
      bannerUrl: body.bannerUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
      registrationLink: body.registrationLink || '#'
    };
    events.unshift(createdEvent);
    localStorage.setItem('campusai_events_data', JSON.stringify(events));
    return createdEvent;
  }

  if (endpoint.startsWith('/public/events') || endpoint.startsWith('/admin/events')) {
    try {
      const stored = localStorage.getItem('campusai_events_data');
      if (stored) return JSON.parse(stored);
    } catch(e) {}

    const defaultEvents = [
      {
        id: 1,
        title: 'KANAL 2K26 - National Level Technical Symposium',
        category: 'Symposium',
        description: 'Flagship National Level Technical Symposium by CSE & IT featuring Paper Presentation, Code Sprint, Bug Hunt, Web Design, and AI Hack Challenge with cash awards.',
        eventDate: '2026-10-18T09:00:00',
        location: 'VSB Main Auditorium & CSE Lab 4',
        organizer: 'Dept of CSE & IT, VSBEC Karur',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
        registrationLink: 'https://vsbec.edu.in/kanal2k26'
      },
      {
        id: 2,
        title: 'LIRO 2K26 - Line Follower Robotics Competition',
        category: 'Robotics',
        description: 'Inter-college autonomous robotics and IoT line follower navigation challenge testing speed, sensor accuracy, and algorithmic path optimization.',
        eventDate: '2026-10-13T09:30:00',
        location: 'Einstein Tech Block & ECE Robotics Lab',
        organizer: 'Dept of ECE & Robotics Club',
        bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
        registrationLink: 'https://vsbec.edu.in/liro2k26'
      },
      {
        id: 3,
        title: 'ILLUMINATE 2026 - E-Cell Entrepreneurship Summit',
        category: 'Workshop',
        description: 'Hands-on startup incubation, business modeling, and venture capital pitching workshop organized in association with E-Cell IIT Bombay.',
        eventDate: '2026-10-14T10:00:00',
        location: 'VSB Convention Center',
        organizer: 'Entrepreneurship Development Cell (EDC)',
        bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600',
        registrationLink: 'https://vsbec.edu.in/illuminate'
      },
      {
        id: 4,
        title: 'DIGIVERSE XPOSE 2026 - Annual Project & Cultural Expo',
        category: 'Cultural & Expo',
        description: 'Grand annual inter-department innovative engineering project expo, AI demonstrations, and cultural music & dance fiesta.',
        eventDate: '2026-11-05T08:30:00',
        location: 'Central Open Air Amphitheatre',
        organizer: 'Student Affairs Council',
        bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
        registrationLink: 'https://vsbec.edu.in/digiverse'
      }
    ];
    localStorage.setItem('campusai_events_data', JSON.stringify(defaultEvents));
    return defaultEvents;
  }

  if (endpoint.startsWith('/admin/announcements') && method === 'POST') {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('campusai_announcements_data')) || [];
    } catch(e) { list = []; }
    if (!list.length) {
      list = [
        { id: 1, title: 'Autonomous COE End-Semester Examinations Schedule Released', content: 'Controller of Examinations (COE) has released the End-Semester Examination timetable for all 3rd, 5th, and 7th semester B.E/B.Tech students. Exams commence on October 28th. Hall tickets are available on the student portal.', priority: 'URGENT', createdAt: '2026-09-28T09:00:00' },
        { id: 2, title: 'Campus Placement Drive 2026: Tier-1 IT & Product Companies (Autodesk, Zoho, TCS, Infosys)', content: 'Career Development Center (CDC) announces registration for upcoming on-campus recruitment drives. Highest package offered this season is INR 47 Lakhs. Mandatory pre-placement training starts Monday.', priority: 'HIGH', createdAt: '2026-09-27T14:30:00' },
        { id: 3, title: 'AICTE - IDEA Lab Hands-On Workshop on Generative AI & IoT', content: 'Department of CSE & AI&DS is organizing a 3-day hands-on workshop on Edge Computing and Large Language Models at the VSB AICTE IDEA Lab.', priority: 'NORMAL', createdAt: '2026-09-26T11:15:00' },
        { id: 4, title: 'College Bus Transport & Route Timings - Karur, Trichy, Dindigul & Erode', content: 'Updated morning pick-up and evening drop schedules for all 50 college bus routes (covering Karur, Trichy, Dindigul, Erode, and Namakkal) have been posted.', priority: 'NORMAL', createdAt: '2026-09-25T10:00:00' }
      ];
    }
    const newAnnounce = {
      id: Date.now(),
      title: body.title || 'Official Campus Bulletin',
      content: body.content || '',
      priority: body.priority || 'NORMAL',
      targetRole: body.targetRole || 'ALL',
      createdAt: new Date().toISOString()
    };
    list.unshift(newAnnounce);
    localStorage.setItem('campusai_announcements_data', JSON.stringify(list));
    return newAnnounce;
  }

  if (endpoint.startsWith('/public/announcements') || endpoint.startsWith('/admin/announcements')) {
    try {
      const stored = localStorage.getItem('campusai_announcements_data');
      if (stored) return JSON.parse(stored);
    } catch(e) {}

    const defaultAnnouncements = [
      {
        id: 1,
        title: 'Autonomous COE End-Semester Examinations Schedule Released',
        content: 'Controller of Examinations (COE) has released the End-Semester Examination timetable for all 3rd, 5th, and 7th semester B.E/B.Tech students. Exams commence on October 28th. Hall tickets are available on the student portal.',
        priority: 'URGENT',
        createdAt: '2026-09-28T09:00:00'
      },
      {
        id: 2,
        title: 'Campus Placement Drive 2026: Tier-1 IT & Product Companies (Autodesk, Zoho, TCS, Infosys)',
        content: 'Career Development Center (CDC) announces registration for upcoming on-campus recruitment drives. Highest package offered this season is INR 47 Lakhs. Mandatory pre-placement training starts Monday.',
        priority: 'HIGH',
        createdAt: '2026-09-27T14:30:00'
      },
      {
        id: 3,
        title: 'AICTE - IDEA Lab Hands-On Workshop on Generative AI & IoT',
        content: 'Department of CSE & AI&DS is organizing a 3-day hands-on workshop on Edge Computing and Large Language Models at the VSB AICTE IDEA Lab.',
        priority: 'NORMAL',
        createdAt: '2026-09-26T11:15:00'
      },
      {
        id: 4,
        title: 'College Bus Transport & Route Timings - Karur, Trichy, Dindigul & Erode',
        content: 'Updated morning pick-up and evening drop schedules for all 50 college bus routes (covering Karur, Trichy, Dindigul, Erode, and Namakkal) have been posted.',
        priority: 'NORMAL',
        createdAt: '2026-09-25T10:00:00'
      }
    ];
    localStorage.setItem('campusai_announcements_data', JSON.stringify(defaultAnnouncements));
    return defaultAnnouncements;
  }

  if (endpoint.startsWith('/student/complaints')) {
    return [
      {
        id: 101,
        category: 'Infrastructure',
        subject: 'Wi-Fi connection drop in CS Lab 301',
        description: 'The high-speed Wi-Fi router in CS Lab 301 has frequent disconnects during afternoon sessions.',
        status: 'IN_PROGRESS',
        adminResponse: 'Network team has replaced the router switch. Testing signal stability.',
        createdAt: '2026-09-24T11:20:00'
      },
      {
        id: 102,
        category: 'Library',
        subject: 'Request for additional AI & Machine Learning text books',
        description: 'Kindly add more physical copies of Deep Learning by Ian Goodfellow in the reference section.',
        status: 'RESOLVED',
        adminResponse: '5 additional copies added to shelf B-14 in Central Library.',
        createdAt: '2026-09-18T16:00:00'
      }
    ];
  }

  if (endpoint.startsWith('/admin/analytics')) {
    const students = getStoredStudentsList();
    const activeCount = students.filter(s => s.status === 'Active').length;
    const depts = new Set(students.map(s => s.department).filter(Boolean));
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newRegs = students.filter(s => new Date(s.registrationDate) >= thirtyDaysAgo).length;

    return {
      totalStudents: students.length,
      activeStudents: activeCount,
      totalDepartments: depts.size,
      newRegistrations: newRegs,
      totalFaculty: 85,
      totalAdmins: 6,
      pendingComplaints: 4,
      resolvedComplaints: 58,
      upcomingEvents: 3,
      totalAnnouncements: 8
    };
  }

  if (endpoint.startsWith('/admin/students/stats')) {
    const students = getStoredStudentsList();
    const deptMap = {};
    students.forEach(s => {
      const dept = s.department || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return {
      total: students.length,
      active: students.filter(s => s.status === 'Active').length,
      inactive: students.filter(s => s.status === 'Inactive').length,
      departments: Object.entries(deptMap).map(([name, count]) => ({ name, count }))
    };
  }

  if (endpoint.startsWith('/admin/students')) {
    let students = getStoredStudentsList();

    if (method === 'POST' && data) {
      const newStudent = {
        id: data.id || Date.now(),
        studentId: data.studentId || data.rollNumber || `CS2026-${Math.floor(100 + Math.random() * 900)}`,
        name: data.name || data.fullName || 'New Student',
        email: data.email || 'student@campusai.edu',
        department: data.department || 'Computer Science & Engineering',
        year: data.year || '1st Year',
        phone: data.phone || '+91 98424-00000',
        registrationDate: data.registrationDate || new Date().toISOString(),
        status: data.status || 'Active',
        residenceType: data.residenceType || 'Dayscholar'
      };
      students.unshift(newStudent);
      saveStoredStudentsList(students);
      return { success: true, student: newStudent, message: 'Student registered successfully' };
    }

    if (method === 'PUT' && data) {
      const targetId = data.studentId || data.id;
      students = students.map(s => {
        if (s.studentId === targetId || s.id == targetId) {
          return { ...s, ...data };
        }
        return s;
      });
      saveStoredStudentsList(students);
      return { success: true, message: 'Student updated successfully' };
    }

    if (method === 'DELETE') {
      const urlParts = endpoint.split('/');
      const delId = urlParts[urlParts.length - 1];
      students = students.filter(s => s.studentId !== delId && s.id != delId);
      saveStoredStudentsList(students);
      return { success: true, message: 'Student removed successfully' };
    }

    return students;
  }

  if (endpoint.startsWith('/admin/users')) {
    const students = getStoredStudentsList();
    const baseStaff = [
      { id: 1, username: 'admin', fullName: 'Dr. Alistair Vance', email: 'admin@campusai.edu', role: 'ADMIN', department: 'Administration', rollNumber: 'ADM-001', status: 'ACTIVE' },
      { id: 2, username: 'faculty_smith', fullName: 'Prof. Sarah Jenkins', email: 's.jenkins@campusai.edu', role: 'FACULTY', department: 'Computer Science & Engineering', rollNumber: 'FAC-CS-101', status: 'ACTIVE' },
      { id: 3, username: 'faculty_rao', fullName: 'Dr. Ramesh Rao', email: 'r.rao@campusai.edu', role: 'FACULTY', department: 'Computer Science & Engineering', rollNumber: 'FAC-CS-102', status: 'ACTIVE' }
    ];
    const studentUsers = students.slice(0, 10).map(s => ({
      id: s.id,
      username: (s.email.split('@')[0] || s.name.toLowerCase().replace(/\s+/g, '_')),
      fullName: s.name,
      email: s.email,
      role: 'STUDENT',
      department: s.department,
      rollNumber: s.studentId,
      status: s.status.toUpperCase()
    }));
    return [...baseStaff, ...studentUsers];
  }

  return { success: true, message: 'Action executed successfully.' };
}

// Student Data Storage Helpers
function getStoredStudentsList() {
  try {
    const stored = localStorage.getItem('campusai_registered_students_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored students:', e);
  }

  const defaultStudents = [
    {
      id: 4,
      studentId: 'CS2024-042',
      name: 'Alex Morgan',
      email: 'alex.m@campusai.edu',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      phone: '+91 98424-30001',
      registrationDate: '2026-09-01T09:15:00',
      status: 'Active',
      residenceType: 'Hostel'
    },
    {
      id: 5,
      studentId: 'CS2024-043',
      name: 'Priya Sharma',
      email: 'priya.s@campusai.edu',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      phone: '+91 98424-30002',
      registrationDate: '2026-09-02T10:45:00',
      status: 'Active',
      residenceType: 'Dayscholar'
    },
    {
      id: 6,
      studentId: 'AIDS-2024-019',
      name: 'Naren K S',
      email: 'narenks.vsb@gmail.com',
      department: 'Artificial Intelligence & Data Science',
      year: '3rd Year',
      phone: '+91 94432-51201',
      registrationDate: '2026-09-05T14:20:00',
      status: 'Active',
      residenceType: 'Hostel'
    },
    {
      id: 7,
      studentId: 'AIDS-2024-020',
      name: 'Aarav Patel',
      email: 'aarav.p@campusai.edu',
      department: 'Artificial Intelligence & Data Science',
      year: '2nd Year',
      phone: '+91 94432-51202',
      registrationDate: '2026-09-08T11:30:00',
      status: 'Active',
      residenceType: 'Dayscholar'
    },
    {
      id: 8,
      studentId: 'IT2024-088',
      name: 'Sneha Reddy',
      email: 'sneha.r@campusai.edu',
      department: 'Information Technology',
      year: '3rd Year',
      phone: '+91 97890-44101',
      registrationDate: '2026-09-10T16:00:00',
      status: 'Active',
      residenceType: 'Hostel'
    },
    {
      id: 9,
      studentId: 'IT2024-089',
      name: 'Karthik Raja',
      email: 'karthik.r@campusai.edu',
      department: 'Information Technology',
      year: '1st Year',
      phone: '+91 97890-44102',
      registrationDate: '2026-09-12T09:30:00',
      status: 'Active',
      residenceType: 'Dayscholar'
    },
    {
      id: 10,
      studentId: 'ECE-2024-051',
      name: 'Divya Sundaram',
      email: 'divya.s@campusai.edu',
      department: 'Electronics & Communication Engineering',
      year: '3rd Year',
      phone: '+91 98401-77210',
      registrationDate: '2026-09-15T13:10:00',
      status: 'Active',
      residenceType: 'Hostel'
    },
    {
      id: 11,
      studentId: 'ECE-2024-052',
      name: 'Rahul Verma',
      email: 'rahul.v@campusai.edu',
      department: 'Electronics & Communication Engineering',
      year: '4th Year',
      phone: '+91 98401-77211',
      registrationDate: '2026-09-18T15:45:00',
      status: 'Active',
      residenceType: 'Dayscholar'
    },
    {
      id: 12,
      studentId: 'EEE-2024-014',
      name: 'Ananya Iyer',
      email: 'ananya.i@campusai.edu',
      department: 'Electrical & Electronics Engineering',
      year: '2nd Year',
      phone: '+91 99402-33100',
      registrationDate: '2026-09-20T10:00:00',
      status: 'Active',
      residenceType: 'Hostel'
    },
    {
      id: 13,
      studentId: 'MECH-2024-033',
      name: 'Vikram Seth',
      email: 'vikram.s@campusai.edu',
      department: 'Mechanical Engineering',
      year: '3rd Year',
      phone: '+91 96001-99880',
      registrationDate: '2026-09-22T11:20:00',
      status: 'Active',
      residenceType: 'Dayscholar'
    },
    {
      id: 14,
      studentId: 'CIVIL-2024-027',
      name: 'Meera Krishnan',
      email: 'meera.k@campusai.edu',
      department: 'Civil Engineering',
      year: '1st Year',
      phone: '+91 94441-66770',
      registrationDate: '2026-09-25T14:00:00',
      status: 'Active',
      residenceType: 'Hostel'
    },
    {
      id: 15,
      studentId: 'CS2024-044',
      name: 'Rohan Das',
      email: 'rohan.d@campusai.edu',
      department: 'Computer Science & Engineering',
      year: '2nd Year',
      phone: '+91 98424-30003',
      registrationDate: '2026-08-20T09:00:00',
      status: 'Inactive',
      residenceType: 'Dayscholar'
    }
  ];

  localStorage.setItem('campusai_registered_students_data', JSON.stringify(defaultStudents));
  return defaultStudents;
}

function saveStoredStudentsList(list) {
  localStorage.setItem('campusai_registered_students_data', JSON.stringify(list));
}

// Global helper to register a student and save across the entire app
function registerNewStudentEntry(student) {
  const list = getStoredStudentsList();
  // Check if roll number or email already exists
  const existingIndex = list.findIndex(s => 
    (student.studentId && s.studentId === student.studentId) || 
    (student.rollNumber && s.studentId === student.rollNumber) ||
    (student.email && s.email.toLowerCase() === student.email.toLowerCase())
  );

  const studentObj = {
    id: student.id || Date.now(),
    studentId: student.studentId || student.rollNumber || ('CS2026-' + Math.floor(100 + Math.random() * 900)),
    name: student.name || student.fullName || 'Student User',
    email: student.email || 'student@campusai.edu',
    department: student.department || 'Computer Science & Engineering',
    year: student.year || '3rd Year',
    phone: student.phone || '+91 98424-' + Math.floor(10000 + Math.random() * 90000),
    registrationDate: student.registrationDate || new Date().toISOString(),
    status: student.status || 'Active',
    residenceType: student.residenceType || 'Dayscholar'
  };

  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...studentObj };
  } else {
    list.unshift(studentObj);
  }

  saveStoredStudentsList(list);
  return studentObj;
}

// Show interactive toast
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
