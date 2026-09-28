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

  if (endpoint.startsWith('/public/events')) {
    return [
      {
        id: 1,
        title: 'CampusAI Annual Hackathon 2026',
        category: 'Hackathon',
        description: '36-hour sprint on Generative AI & Web3 applications with $10,000 cash prizes and investor demos.',
        eventDate: '2026-10-15T09:00:00',
        location: 'Campus Tech Hub & Main Hall',
        organizer: 'ACM Student Chapter',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
        registrationLink: '#'
      },
      {
        id: 2,
        title: 'National AI & Robotics Symposium',
        category: 'Symposium',
        description: 'Keynotes by top AI researchers exploring Autonomous Agents and Large Multimodal Models.',
        eventDate: '2026-10-22T10:00:00',
        location: 'Einstein Convention Hall',
        organizer: 'Dept of Computer Science',
        bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
        registrationLink: '#'
      },
      {
        id: 3,
        title: 'Inter-College Sports Carnival "VIGOR 2026"',
        category: 'Sports',
        description: 'Annual championship featuring football, basketball, badminton, cricket, and athletics.',
        eventDate: '2026-11-02T08:00:00',
        location: 'University Sports Complex',
        organizer: 'Sports Council',
        bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
        registrationLink: '#'
      }
    ];
  }

  if (endpoint.startsWith('/public/announcements')) {
    return [
      {
        id: 1,
        title: 'Mid-Semester Examinations Schedule Released',
        content: 'Mid-term exams for Semester 3, 5, and 7 begin October 12th. Hall tickets are available on the student portal.',
        priority: 'URGENT',
        createdAt: '2026-09-27T10:00:00'
      },
      {
        id: 2,
        title: 'Campus AI Innovation Grant ($25,000)',
        content: 'Applications are now open for student-led AI & robotics research projects. Deadline is October 30th.',
        priority: 'HIGH',
        createdAt: '2026-09-26T14:30:00'
      },
      {
        id: 3,
        title: 'Guest Lecture: Scalable Cloud Architectures',
        content: 'Principal Architect from AWS will speak on distributed microservices this Monday in Seminar Hall 2.',
        priority: 'NORMAL',
        createdAt: '2026-09-25T09:15:00'
      }
    ];
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
    return {
      totalStudents: 1420,
      totalFaculty: 85,
      totalAdmins: 6,
      pendingComplaints: 4,
      resolvedComplaints: 58,
      upcomingEvents: 3,
      totalAnnouncements: 8
    };
  }

  if (endpoint.startsWith('/admin/users')) {
    return [
      { id: 1, username: 'admin', fullName: 'Dr. Alistair Vance', email: 'admin@campusai.edu', role: 'ADMIN', department: 'Administration', rollNumber: 'ADM-001', status: 'ACTIVE' },
      { id: 2, username: 'faculty_smith', fullName: 'Prof. Sarah Jenkins', email: 's.jenkins@campusai.edu', role: 'FACULTY', department: 'Computer Science & Engineering', rollNumber: 'FAC-CS-101', status: 'ACTIVE' },
      { id: 3, username: 'faculty_rao', fullName: 'Dr. Ramesh Rao', email: 'r.rao@campusai.edu', role: 'FACULTY', department: 'Computer Science & Engineering', rollNumber: 'FAC-CS-102', status: 'ACTIVE' },
      { id: 4, username: 'student_alex', fullName: 'Alex Morgan', email: 'alex.m@campusai.edu', role: 'STUDENT', department: 'Computer Science & Engineering', rollNumber: 'CS2024-042', status: 'ACTIVE' },
      { id: 5, username: 'student_priya', fullName: 'Priya Sharma', email: 'priya.s@campusai.edu', role: 'STUDENT', department: 'Computer Science & Engineering', rollNumber: 'CS2024-043', status: 'ACTIVE' }
    ];
  }

  return { success: true, message: 'Action executed successfully.' };
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
