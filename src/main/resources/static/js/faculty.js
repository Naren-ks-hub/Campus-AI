/**
 * CampusAI - Faculty Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = AuthState.getUser();
  updateProfileHeader(user);
  setupTabs();

  await loadFacultyOverview();
  await loadAttendanceClassList();
  await loadFacultyAssignments();
  await loadFacultyTimetable();
  await loadFacultyMaterials();

  setupNewAssignmentForm();
  setupBroadcastForm();
  setupMaterialUploadForm();
  setupEditMaterialForm();
  setupMaterialFilters();

  // Initialize Unread Notification Tracker
  if (typeof UnreadTracker !== 'undefined') {
    UnreadTracker.init('FACULTY');
  }
});

function updateProfileHeader(user) {
  if (!user) return;
  const nameEl = document.getElementById('faculty-name');
  const deptEl = document.getElementById('faculty-dept');
  const avatarEl = document.getElementById('faculty-avatar');

  if (nameEl) nameEl.textContent = user.fullName || 'Prof. Sarah Jenkins';
  if (deptEl) deptEl.textContent = `${user.department || 'Computer Science & Engineering'} • Faculty ID: ${user.rollNumber || 'FAC-CS-101'}`;
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;
}

function setupTabs() {
  const navItems = document.querySelectorAll('.sidebar-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`tab-${tabId}`);
      if (activePane) activePane.classList.add('active');

      // Clear unread blue dot when faculty opens this tab
      if (typeof UnreadTracker !== 'undefined') {
        UnreadTracker.markAsSeen('FACULTY', tabId);
      }
    });
  });
}

async function loadFacultyOverview() {
  document.getElementById('stat-my-students').textContent = '120';
  document.getElementById('stat-classes-today').textContent = '3 Lectures';
  document.getElementById('stat-pending-grading').textContent = '5 Submissions';
}

const mockClassStudents = [
  { id: 4, rollNumber: 'CS2024-042', fullName: 'Alex Morgan', status: 'PRESENT' },
  { id: 5, rollNumber: 'CS2024-043', fullName: 'Priya Sharma', status: 'PRESENT' },
  { id: 6, rollNumber: 'CS2024-044', fullName: 'David Chen', status: 'PRESENT' },
  { id: 7, rollNumber: 'CS2024-045', fullName: 'Emma Watson', status: 'ABSENT' },
  { id: 8, rollNumber: 'CS2024-046', fullName: 'Rahul Verma', status: 'PRESENT' }
];

async function loadAttendanceClassList() {
  const tbody = document.getElementById('faculty-attendance-table-body');
  if (!tbody) return;

  tbody.innerHTML = mockClassStudents.map((s, idx) => `
    <tr>
      <td><strong>${s.rollNumber}</strong></td>
      <td>${s.fullName}</td>
      <td>
        <select class="form-control form-control-sm attendance-status-select" data-id="${s.id}" style="width:130px; padding:6px 10px;">
          <option value="PRESENT" ${s.status === 'PRESENT' ? 'selected' : ''}>Present ✅</option>
          <option value="ABSENT" ${s.status === 'ABSENT' ? 'selected' : ''}>Absent ❌</option>
          <option value="LATE" ${s.status === 'LATE' ? 'selected' : ''}>Late ⏰</option>
        </select>
      </td>
      <td>
        <input type="text" class="form-control form-control-sm" placeholder="Optional remark..." style="padding:6px 10px;">
      </td>
    </tr>
  `).join('');

  document.getElementById('mark-all-present-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.attendance-status-select').forEach(sel => sel.value = 'PRESENT');
    showToast('All students marked Present', 'info');
  });

  document.getElementById('save-attendance-btn')?.addEventListener('click', async () => {
    const subject = document.getElementById('attendance-subject-select').value;
    const date = document.getElementById('attendance-date-input').value;
    showToast(`Attendance saved successfully for ${subject} (${date})!`, 'success');
    if (typeof UnreadTracker !== 'undefined') {
      UnreadTracker.notifyNewUpdate('attendance');
    }
  });
}

async function loadFacultyAssignments() {
  const user = AuthState.getUser();
  const assignments = await apiRequest(`/faculty/assignments?facultyId=${user.id}`);
  const container = document.getElementById('faculty-assignments-list');
  if (!container || !assignments) return;

  container.innerHTML = assignments.map(a => `
    <div class="glass-card assignment-card">
      <div>
        <div class="card-top">
          <span class="badge badge-primary">${a.assignment?.subjectCode || a.subjectCode || 'CS501'}</span>
          <span class="badge badge-info">Due: ${new Date(a.assignment?.dueDate || a.dueDate || Date.now()).toLocaleDateString()}</span>
        </div>
        <h3 style="font-size:1.1rem; margin-bottom:6px;">${a.assignment?.title || a.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">${a.assignment?.description || a.description}</p>
      </div>
      <div style="margin-top:16px;">
        <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="openGradingModal(${a.assignment?.id || a.id || 1}, '${a.assignment?.title || a.title}')">
          <i class="fa-solid fa-pen-to-square"></i> Review & Grade Submissions (1 Graded)
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// OFFICIAL INSTITUTIONAL FACULTY TIMETABLE DATA (AI & DS - Academic Year 2026-2027)
// Extracted with 100% precision from official Class Timetables
// ==========================================
const OFFICIAL_FACULTY_LIST = [
  {
    id: "RM",
    name: "Dr. R. Murugesan",
    code: "RM",
    designation: "Professor & HoD",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    initials: "RM",
    subjects: [
      { code: "23ADT501", name: "Deep Learning", short: "DL", type: "theory" },
      { code: "23ADT501", name: "Deep Learning Lab", short: "DL Lab", type: "lab" },
      { code: "-", name: "Advanced Data Structure and Algorithm", short: "ADS", type: "theory" }
    ],
    mentoring: "Wednesday 12:30 PM - 01:20 PM",
    schedule: {
      MONDAY: {
        2: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        5: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        6: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        7: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        8: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" }
      },
      TUESDAY: {
        4: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        6: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      WEDNESDAY: {
        2: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        3: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      THURSDAY: {
        1: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        5: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        8: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      FRIDAY: {
        3: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      SATURDAY: {
        5: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" },
        6: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" },
        7: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" },
        8: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" }
      }
    }
  },
  {
    id: "MR-Ramesh",
    name: "Mr. M. Ramesh",
    code: "MR",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    initials: "MR",
    subjects: [
      { code: "23CSE005", name: "Business Analytics", short: "BA", type: "theory" },
      { code: "23CSE005", name: "Business Analytics Lab", short: "BA Lab", type: "lab" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        1: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        4: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        7: { code: "23CSE005", subject: "Business Analytics Lab [BA Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" },
        8: { code: "23CSE005", subject: "Business Analytics Lab [BA Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" }
      },
      TUESDAY: {
        1: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      WEDNESDAY: {
        7: { code: "23CSE005", subject: "Business Analytics Lab [BA Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        8: { code: "23CSE005", subject: "Business Analytics Lab [BA Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" }
      },
      THURSDAY: {
        3: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        7: { code: "23CSE005", subject: "Business Analytics Lab [BA Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" },
        8: { code: "23CSE005", subject: "Business Analytics Lab [BA Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" }
      },
      FRIDAY: {
        1: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        5: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        7: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      SATURDAY: {
        2: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        3: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        4: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        6: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        7: { code: "23CSE005", subject: "Business Analytics [BA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      }
    }
  },
  {
    id: "MR-Rajendran",
    name: "Dr. M. Rajendran",
    code: "MR",
    designation: "Faculty / Specialist",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    initials: "MR",
    subjects: [
      { code: "-", name: "Web Development", short: "WD", type: "theory" },
      { code: "-", name: "Communication Training", short: "COMM", type: "training" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {},
      TUESDAY: {},
      WEDNESDAY: {
        1: { code: "-", subject: "Web Development [WD]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        2: { code: "-", subject: "Web Development [WD]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      THURSDAY: {},
      FRIDAY: {
        3: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'A'", room: "MB III A-201", type: "training" },
        4: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'A'", room: "MB III A-201", type: "training" }
      },
      SATURDAY: {}
    }
  },
  {
    id: "RMN",
    name: "Mr. R. Muthuchelvan",
    code: "RMN",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    initials: "RMN",
    subjects: [
      { code: "23CSE011", name: "Cloud Service Management", short: "CSM", type: "theory" },
      { code: "23CSE011", name: "Cloud Service Management Lab", short: "CSM Lab", type: "lab" },
      { code: "-", name: "Advanced Data Structure and Algorithm", short: "ADS", type: "theory" },
      { code: "-", name: "Communication Training", short: "COMM", type: "training" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        2: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      TUESDAY: {
        7: { code: "23CSE011", subject: "Cloud Service Management Lab [CSM Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" },
        8: { code: "23CSE011", subject: "Cloud Service Management Lab [CSM Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" }
      },
      WEDNESDAY: {
        3: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'B'", room: "MB III A-202", type: "training" },
        4: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'B'", room: "MB III A-202", type: "training" },
        6: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      THURSDAY: {
        6: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        8: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      FRIDAY: {
        1: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        2: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        3: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        4: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      SATURDAY: {
        1: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        2: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      }
    }
  },
  {
    id: "MS",
    name: "Mrs. M. Sivagami",
    code: "MS",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    initials: "MS",
    subjects: [
      { code: "23CBT502", name: "Data and Information Security", short: "DIS", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        3: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      TUESDAY: {
        2: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        5: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      WEDNESDAY: {
        1: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        7: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      THURSDAY: {},
      FRIDAY: {
        6: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        8: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      SATURDAY: {
        1: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      }
    }
  },
  {
    id: "SM",
    name: "Ms. S. Muthulakshmi",
    code: "SM",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    initials: "SM",
    subjects: [
      { code: "23CST504", name: "Distributed Computing", short: "DC", type: "theory" },
      { code: "-", name: "Advanced Data Structure and Algorithm", short: "ADS", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        4: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      TUESDAY: {},
      WEDNESDAY: {
        6: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        8: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      THURSDAY: {
        2: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        5: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        6: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      FRIDAY: {
        2: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        4: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        7: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      SATURDAY: {
        4: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      }
    }
  },
  {
    id: "DB",
    name: "Mr. D. Baskar",
    code: "DB",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    initials: "DB",
    subjects: [
      { code: "23ADT502", name: "Big Data Analytics", short: "BDA", type: "theory" },
      { code: "23ADT502", name: "Big Data Analytics Lab", short: "BDA Lab", type: "lab" },
      { code: "-", name: "Communication Training", short: "COMM", type: "training" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {},
      TUESDAY: {},
      WEDNESDAY: {
        4: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        5: { code: "23ADT502", subject: "Big Data Analytics Lab [BDA Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" },
        6: { code: "23ADT502", subject: "Big Data Analytics Lab [BDA Lab]", section: "III Year 'A'", room: "MB III A-201", type: "lab" }
      },
      THURSDAY: {
        4: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      FRIDAY: {
        1: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'B'", room: "MB III A-202", type: "training" },
        2: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'B'", room: "MB III A-202", type: "training" },
        5: { code: "23ADT502", subject: "Big Data Analytics Lab [BDA Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        6: { code: "23ADT502", subject: "Big Data Analytics Lab [BDA Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        8: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      SATURDAY: {
        2: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        4: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        8: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      }
    }
  },
  {
    id: "DA",
    name: "Dr. D. Anandhan",
    code: "DA",
    designation: "Associate Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    initials: "DA",
    subjects: [
      { code: "-", name: "Aptitude", short: "AP", type: "aptitude" },
      { code: "23ADT502", name: "Big Data Analytics", short: "BDA", type: "theory" },
      { code: "23ADT502", name: "Big Data Analytics Lab", short: "BDA Lab", type: "lab" },
      { code: "-", name: "Communication Training", short: "COMM", type: "training" },
      { code: "-", name: "Web Development", short: "WD", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        3: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        5: { code: "-", subject: "Aptitude [AP]", section: "III Year 'A'", room: "MB III A-201", type: "aptitude" },
        6: { code: "-", subject: "Aptitude [AP]", section: "III Year 'A'", room: "MB III A-201", type: "aptitude" },
        7: { code: "-", subject: "Aptitude [AP]", section: "III Year 'A'", room: "MB III A-201", type: "aptitude" },
        8: { code: "-", subject: "Aptitude [AP]", section: "III Year 'A'", room: "MB III A-201", type: "aptitude" }
      },
      TUESDAY: {
        1: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        3: { code: "-", subject: "Web Development [WD]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        4: { code: "-", subject: "Web Development [WD]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      WEDNESDAY: {
        7: { code: "23ADT502", subject: "Big Data Analytics Lab [BDA Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" },
        8: { code: "23ADT502", subject: "Big Data Analytics Lab [BDA Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" }
      },
      THURSDAY: {
        1: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'C'", room: "MB III A-203", type: "training" },
        2: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'C'", room: "MB III A-203", type: "training" },
        3: { code: "23ADT502", subject: "Big Data Analytics [BDA]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      FRIDAY: {},
      SATURDAY: {
        7: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'C'", room: "MB III A-203", type: "training" },
        8: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'C'", room: "MB III A-203", type: "training" }
      }
    }
  },
  {
    id: "CK",
    name: "Mr. C. Kavin Prakash",
    code: "CK",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    initials: "CK",
    subjects: [
      { code: "-", name: "Aptitude", short: "AP", type: "aptitude" },
      { code: "23CST504", name: "Distributed Computing", short: "DC", type: "theory" },
      { code: "-", name: "Web Development", short: "WD", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        1: { code: "-", subject: "Aptitude [AP]", section: "III Year 'B'", room: "MB III A-202", type: "aptitude" },
        2: { code: "-", subject: "Aptitude [AP]", section: "III Year 'B'", room: "MB III A-202", type: "aptitude" },
        3: { code: "-", subject: "Aptitude [AP]", section: "III Year 'B'", room: "MB III A-202", type: "aptitude" },
        4: { code: "-", subject: "Aptitude [AP]", section: "III Year 'B'", room: "MB III A-202", type: "aptitude" },
        5: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      TUESDAY: {
        5: { code: "-", subject: "Web Development [WD]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        6: { code: "-", subject: "Web Development [WD]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        7: { code: "-", subject: "Web Development [WD]", section: "III Year 'B'", room: "MB III A-202", type: "theory" },
        8: { code: "-", subject: "Web Development [WD]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      WEDNESDAY: {},
      THURSDAY: {
        4: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        6: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      FRIDAY: {},
      SATURDAY: {
        5: { code: "23CST504", subject: "Distributed Computing [DC]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      }
    }
  },
  {
    id: "SG",
    name: "Mr. S. Gobinath",
    code: "SG",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    initials: "SG",
    subjects: [
      { code: "23ADT501", name: "Deep Learning", short: "DL", type: "theory" },
      { code: "23ADT501", name: "Deep Learning Lab", short: "DL Lab", type: "lab" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        6: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      TUESDAY: {
        2: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      WEDNESDAY: {
        5: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      THURSDAY: {},
      FRIDAY: {
        5: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" },
        6: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" },
        7: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" },
        8: { code: "23ADT501", subject: "Deep Learning Lab [DL Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" }
      },
      SATURDAY: {
        1: { code: "23ADT501", subject: "Deep Learning [DL]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      }
    }
  },
  {
    id: "RP",
    name: "Mr. R. Palraj",
    code: "RP",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    initials: "RP",
    subjects: [
      { code: "23CBT502", name: "Data and Information Security", short: "DIS", type: "theory" },
      { code: "-", name: "Aptitude", short: "AP", type: "aptitude" },
      { code: "-", name: "Web Development", short: "WD", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {
        1: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      TUESDAY: {
        5: { code: "-", subject: "Aptitude [AP]", section: "III Year 'C'", room: "MB III A-203", type: "aptitude" },
        6: { code: "-", subject: "Aptitude [AP]", section: "III Year 'C'", room: "MB III A-203", type: "aptitude" },
        7: { code: "-", subject: "Aptitude [AP]", section: "III Year 'C'", room: "MB III A-203", type: "aptitude" },
        8: { code: "-", subject: "Aptitude [AP]", section: "III Year 'C'", room: "MB III A-203", type: "aptitude" }
      },
      WEDNESDAY: {
        3: { code: "-", subject: "Web Development [WD]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        4: { code: "-", subject: "Web Development [WD]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      THURSDAY: {
        5: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" },
        7: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      },
      FRIDAY: {},
      SATURDAY: {
        3: { code: "23CBT502", subject: "Data and Information Security [DIS]", section: "III Year 'C'", room: "MB III A-203", type: "theory" }
      }
    }
  },
  {
    id: "AB",
    name: "Mr. A. Bharathidhasan",
    code: "AB",
    designation: "Assistant Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    initials: "AB",
    subjects: [
      { code: "23CSE011", name: "Cloud Service Management Lab", short: "CSM Lab", type: "lab" },
      { code: "-", name: "Communication Training", short: "COMM", type: "training" },
      { code: "-", name: "Advanced Data Structure and Algorithm", short: "ADS", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {},
      TUESDAY: {
        3: { code: "23CSE011", subject: "Cloud Service Management Lab [CSM Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" },
        4: { code: "23CSE011", subject: "Cloud Service Management Lab [CSM Lab]", section: "III Year 'C'", room: "MB III A-203", type: "lab" }
      },
      WEDNESDAY: {
        1: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'A'", room: "MB III A-201", type: "training" },
        2: { code: "-", subject: "Communication Training [COMM]", section: "III Year 'A'", room: "MB III A-201", type: "training" }
      },
      THURSDAY: {
        7: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      FRIDAY: {},
      SATURDAY: {
        5: { code: "23CSE011", subject: "Cloud Service Management Lab [CSM Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" },
        6: { code: "23CSE011", subject: "Cloud Service Management Lab [CSM Lab]", section: "III Year 'B'", room: "MB III A-202", type: "lab" }
      }
    }
  },
  {
    id: "CV",
    name: "Ms. C. Vishnupriya",
    code: "CV",
    designation: "Assistant Professor & Class Advisor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    initials: "CV",
    subjects: [
      { code: "-", name: "Web Development", short: "WD", type: "theory" },
      { code: "-", name: "Advanced Data Structure and Algorithm", short: "ADS", type: "theory" }
    ],
    mentoring: "Wednesday 12:30 PM - 01:20 PM",
    schedule: {
      MONDAY: {},
      TUESDAY: {
        1: { code: "-", subject: "Web Development [WD]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        2: { code: "-", subject: "Web Development [WD]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      WEDNESDAY: {},
      THURSDAY: {
        1: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        2: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        3: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" },
        4: { code: "-", subject: "Advanced Data Structure & Algorithm [ADS]", section: "III Year 'A'", room: "MB III A-201", type: "theory" }
      },
      FRIDAY: {},
      SATURDAY: {}
    }
  },
  {
    id: "KM",
    name: "Dr. K. Manivannan",
    code: "KM",
    designation: "Professor",
    department: "Artificial Intelligence and Data Science",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150",
    initials: "KM",
    subjects: [
      { code: "23CSE011", name: "Cloud Service Management", short: "CSM", type: "theory" }
    ],
    mentoring: null,
    schedule: {
      MONDAY: {},
      TUESDAY: {
        3: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      WEDNESDAY: {
        5: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      },
      THURSDAY: {},
      FRIDAY: {},
      SATURDAY: {
        3: { code: "23CSE011", subject: "Cloud Service Management [CSM]", section: "III Year 'B'", room: "MB III A-202", type: "theory" }
      }
    }
  }
];

let selectedFacultyId = null;

const PERIODS_DEFINITION = [
  { num: 1, label: "Period I", time: "09.15 - 10.00" },
  { num: 2, label: "Period II", time: "10.00 - 10.45" },
  { num: 3, label: "Period III", time: "11.00 - 11.45" },
  { num: 4, label: "Period IV", time: "11.45 - 12.30" },
  { num: 5, label: "Period V", time: "01.20 - 02.05" },
  { num: 6, label: "Period VI", time: "02.05 - 02.50" },
  { num: 7, label: "Period VII", time: "03.05 - 03.50" },
  { num: 8, label: "Period VIII", time: "03.50 - 04.30" }
];

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

async function loadFacultyTimetable() {
  loadFacultyScheduleFromStorage();
  renderFacultyChips();
  const detailsSection = document.getElementById('faculty-timetable-details-section');
  const emptyState = document.getElementById('faculty-tt-empty-state');
  const printBtn = document.getElementById('btn-print-timetable');

  if (!selectedFacultyId) {
    if (detailsSection) detailsSection.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    if (printBtn) printBtn.style.display = 'none';
  } else {
    if (detailsSection) detailsSection.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';
    if (printBtn) printBtn.style.display = 'inline-flex';
    renderSelectedFacultyTimetable(selectedFacultyId);
  }
}

function countTotalPeriods(faculty) {
  let count = 0;
  WEEK_DAYS.forEach(d => {
    const dayObj = faculty.schedule[d] || {};
    count += Object.keys(dayObj).length;
  });
  return count;
}

function countPeriodTypes(faculty) {
  let theory = 0, lab = 0, other = 0;
  WEEK_DAYS.forEach(d => {
    const dayObj = faculty.schedule[d] || {};
    Object.values(dayObj).forEach(slot => {
      if (slot.type === 'lab') lab++;
      else if (slot.type === 'theory') theory++;
      else other++;
    });
  });
  return { theory, lab, other, total: theory + lab + other };
}

function renderFacultyChips(filterQuery = "") {
  const container = document.getElementById('faculty-chip-container');
  if (!container) return;

  const q = filterQuery.trim().toLowerCase();
  const filtered = OFFICIAL_FACULTY_LIST.filter(f => {
    if (!q) return true;
    return f.name.toLowerCase().includes(q) ||
           f.code.toLowerCase().includes(q) ||
           f.designation.toLowerCase().includes(q) ||
           f.subjects.some(s => s.name.toLowerCase().includes(q) || s.short.toLowerCase().includes(q));
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:16px; color:var(--text-muted); font-size:0.85rem;">No faculty matching "${filterQuery}" found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(f => {
    const totalPeriods = countTotalPeriods(f);
    const isActive = f.id === selectedFacultyId;
    const subjPreview = f.subjects.map(s => s.short).join(', ');

    return `
      <div class="faculty-chip ${isActive ? 'active' : ''}" onclick="selectFaculty('${f.id}')" title="Click to view full Period 1-8 timetable for ${f.name}">
        <div class="faculty-chip-avatar">${f.initials}</div>
        <div class="faculty-chip-info">
          <div class="faculty-chip-name">${f.name}</div>
          <div class="faculty-chip-sub">
            <span class="faculty-chip-badge">${f.code}</span>
            <span style="font-size:0.7rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${subjPreview}</span>
          </div>
        </div>
        <div class="faculty-chip-count" title="Total teaching periods/week">${totalPeriods} hrs</div>
      </div>
    `;
  }).join('');
}

function filterFacultyChips() {
  const query = document.getElementById('faculty-search-input')?.value || "";
  renderFacultyChips(query);
}

function selectFaculty(facultyId) {
  selectedFacultyId = facultyId;
  const searchVal = document.getElementById('faculty-search-input')?.value || "";
  renderFacultyChips(searchVal);

  const detailsSection = document.getElementById('faculty-timetable-details-section');
  const emptyState = document.getElementById('faculty-tt-empty-state');
  const printBtn = document.getElementById('btn-print-timetable');

  if (detailsSection) detailsSection.style.display = 'flex';
  if (emptyState) emptyState.style.display = 'none';
  if (printBtn) printBtn.style.display = 'inline-flex';

  renderSelectedFacultyTimetable(facultyId);

  // Smooth scroll to timetable details
  if (detailsSection) {
    detailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function renderSelectedFacultyTimetable(facultyId) {
  const faculty = OFFICIAL_FACULTY_LIST.find(f => f.id === facultyId) || OFFICIAL_FACULTY_LIST[0];
  if (!faculty) return;

  // 1. Render Active Faculty Profile Banner
  const profileContainer = document.getElementById('faculty-active-profile-card');
  if (profileContainer) {
    const stats = countPeriodTypes(faculty);
    const subjectsBadges = faculty.subjects.map(s => {
      const typeClass = s.type === 'lab' ? 'badge-info' : (s.type === 'theory' ? 'badge-primary' : 'badge-warning');
      return `<span class="badge ${typeClass}" style="margin-right:4px;">${s.code !== '-' ? s.code + ': ' : ''}${s.name} [${s.short}]</span>`;
    }).join('');

    profileContainer.innerHTML = `
      <div class="faculty-active-banner">
        <div class="faculty-banner-main">
          <div class="faculty-banner-avatar">${faculty.initials}</div>
          <div class="faculty-banner-text">
            <h3>
              ${faculty.name} 
              <span class="badge badge-primary" style="font-size:0.75rem; vertical-align:middle;">[${faculty.code}]</span>
            </h3>
            <p>
              <span><i class="fa-solid fa-graduation-cap" style="color:var(--primary-light);"></i> ${faculty.designation}</span>
              <span>•</span>
              <span><i class="fa-solid fa-building-columns" style="color:var(--primary-light);"></i> ${faculty.department}</span>
            </p>
            <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-right:4px;">Assigned Subjects:</span>
              ${subjectsBadges}
            </div>
          </div>
        </div>

        <div class="faculty-banner-stats">
          <div class="faculty-stat-pill" title="Total Weekly Periods">
            <i class="fa-solid fa-calendar-check" style="color:#10b981;"></i>
            <span><strong>${stats.total}</strong> Total Periods/Wk</span>
          </div>
          <div class="faculty-stat-pill" title="Theory Class Periods">
            <i class="fa-solid fa-book-open" style="color:#6366f1;"></i>
            <span><strong>${stats.theory}</strong> Theory</span>
          </div>
          <div class="faculty-stat-pill" title="Laboratory Practical Periods">
            <i class="fa-solid fa-flask" style="color:#06b6d4;"></i>
            <span><strong>${stats.lab}</strong> Practical/Lab</span>
          </div>
          ${stats.other > 0 ? `
            <div class="faculty-stat-pill" title="Aptitude & Training">
              <i class="fa-solid fa-bullseye" style="color:#f59e0b;"></i>
              <span><strong>${stats.other}</strong> Aptitude/Training</span>
            </div>
          ` : ''}
          ${faculty.mentoring ? `
            <div class="faculty-stat-pill" style="border-color:#3b82f6; background:rgba(59,130,246,0.1);" title="Counseling & Mentoring Session">
              <i class="fa-solid fa-user-group" style="color:#3b82f6;"></i>
              <span>${faculty.mentoring}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 2. Render Weekly Timetable Matrix (Mon - Sat x Periods 1 - 8)
  const matrixContainer = document.getElementById('faculty-timetable-matrix');
  if (matrixContainer) {
    let html = `<div class="tt-header" style="background:rgba(99,102,241,0.15); border-color:rgba(99,102,241,0.3);">
      <strong style="font-size:0.84rem;">Day / Period</strong>
      <div class="tt-time" style="font-size:0.7rem; color:var(--text-muted);">Institutional Time</div>
    </div>`;

    PERIODS_DEFINITION.forEach(p => {
      html += `
        <div class="tt-header">
          <strong>${p.label}</strong>
          <div class="tt-time">${p.time}</div>
        </div>
      `;
    });

    WEEK_DAYS.forEach(day => {
      const dayName = day.charAt(0) + day.slice(1).toLowerCase();
      const daySchedule = faculty.schedule[day] || {};

      html += `<div class="tt-day">
        <i class="fa-regular fa-calendar" style="margin-right:6px; color:var(--primary-light);"></i>
        ${dayName.substring(0, 3)}
      </div>`;

      for (let p = 1; p <= 8; p++) {
        const slot = daySchedule[p];
        if (slot) {
          let cellTypeClass = 'cell-theory';
          let typeLabel = 'Theory';
          if (slot.type === 'lab') {
            cellTypeClass = 'cell-lab';
            typeLabel = 'Lab';
          } else if (slot.type === 'aptitude') {
            cellTypeClass = 'cell-aptitude';
            typeLabel = 'Aptitude';
          } else if (slot.type === 'training') {
            cellTypeClass = 'cell-training';
            typeLabel = 'Training';
          }

          html += `
            <div class="faculty-tt-cell-occupied ${cellTypeClass}" title="${slot.subject} • ${slot.section} • ${slot.room}">
              <div class="faculty-tt-delete-slot-btn" onclick="event.stopPropagation(); deleteCustomPeriodSlot('${faculty.id}', '${day}', ${p})" title="Clear/Remove this period">
                <i class="fa-solid fa-trash-can"></i>
              </div>
              <div class="faculty-cell-top">
                <span class="faculty-cell-subj">${slot.code && slot.code !== '-' ? slot.code : slot.subject.split('[')[0]}</span>
                <span class="faculty-cell-sec">${slot.section}</span>
              </div>
              <div class="faculty-cell-title">${slot.subject}</div>
              <div class="faculty-cell-bottom">
                <span class="faculty-cell-room"><i class="fa-solid fa-location-dot"></i> ${slot.room}</span>
                <span class="badge ${slot.type === 'lab' ? 'badge-info' : (slot.type === 'aptitude' ? 'badge-warning' : (slot.type === 'training' ? 'badge-secondary' : 'badge-primary'))}" style="font-size:0.62rem; padding:1px 4px;">${typeLabel}</span>
              </div>
            </div>
          `;
        } else {
          html += `
            <div class="faculty-tt-cell-free" onclick="openAddPeriodModal('${faculty.id}', '${day}', ${p})" title="Click + to add custom class or schedule for Period ${p}">
              <div class="faculty-tt-add-btn">
                <i class="fa-solid fa-plus"></i>
              </div>
              <span class="faculty-tt-add-text">Add Class</span>
            </div>
          `;
        }
      }
    });

    matrixContainer.innerHTML = html;
  }

  // 3. Render Workload Breakdown Card
  const breakdownContainer = document.getElementById('faculty-workload-breakdown');
  if (breakdownContainer) {
    const dayRows = WEEK_DAYS.map(d => {
      const dName = d.charAt(0) + day.slice(1).toLowerCase();
      const slots = faculty.schedule[d] || {};
      const periodKeys = Object.keys(slots).sort((a,b) => Number(a) - Number(b));
      
      const periodsContent = periodKeys.length > 0
        ? periodKeys.map(k => `<span class="badge badge-primary" style="margin-right:4px;">P${k}: ${slots[k].subject.split('[')[0].trim()} (${slots[k].section})</span>`).join('')
        : `<span style="color:var(--text-muted); font-size:0.8rem;">No classes scheduled</span>`;

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-glass);">
          <strong style="width:120px; font-size:0.85rem;"><i class="fa-regular fa-calendar-check" style="color:var(--primary-light); margin-right:6px;"></i> ${dName}</strong>
          <div style="flex:1; display:flex; flex-wrap:wrap; gap:4px;">${periodsContent}</div>
          <span class="badge badge-success" style="font-size:0.75rem;">${periodKeys.length} Periods</span>
        </div>
      `;
    }).join('');

    breakdownContainer.innerHTML = `
      <div class="glass-card" style="padding:22px; margin-top:20px;">
        <h4 style="font-size:1rem; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-list-check" style="color:var(--primary-light);"></i> Daily Schedule Breakdown: ${faculty.name}
        </h4>
        <div>${dayRows}</div>
      </div>
    `;
  }
}

// ==========================================
// Custom Period Modal Handling & Persistence
// ==========================================
function openAddPeriodModal(facultyId, day, periodNum) {
  const faculty = OFFICIAL_FACULTY_LIST.find(f => f.id === facultyId) || OFFICIAL_FACULTY_LIST[0];
  const pDef = PERIODS_DEFINITION.find(p => p.num === periodNum) || { label: `Period ${periodNum}`, time: '' };

  document.getElementById('custom-period-faculty-id').value = faculty.id;
  document.getElementById('custom-period-day').value = day;
  document.getElementById('custom-period-num').value = periodNum;

  const dName = day.charAt(0) + day.slice(1).toLowerCase();
  document.getElementById('custom-period-slot-badge').textContent = `${dName} • ${pDef.label}`;
  document.getElementById('custom-period-time-label').textContent = pDef.time;
  document.getElementById('custom-period-faculty-badge').textContent = faculty.name;

  // Reset form
  document.getElementById('custom-subject-select').value = '';
  document.getElementById('custom-subject-name-group').style.display = 'none';
  document.getElementById('custom-subject-name-input').value = '';
  document.getElementById('custom-room-input').value = 'MB III A-201';
  document.getElementById('custom-type-select').value = 'theory';

  const modal = document.getElementById('add-period-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAddPeriodModal() {
  const modal = document.getElementById('add-period-modal');
  if (modal) modal.style.display = 'none';
}

function handleSubjectSelectChange() {
  const select = document.getElementById('custom-subject-select');
  const customGroup = document.getElementById('custom-subject-name-group');
  const typeSelect = document.getElementById('custom-type-select');

  if (select.value === 'CUSTOM') {
    customGroup.style.display = 'block';
    document.getElementById('custom-subject-name-input').required = true;
  } else {
    customGroup.style.display = 'none';
    document.getElementById('custom-subject-name-input').required = false;

    // Auto-select session format
    if (select.value.toLowerCase().includes('lab')) {
      typeSelect.value = 'lab';
    } else if (select.value.toLowerCase().includes('aptitude') || select.value.toLowerCase().includes('ap')) {
      typeSelect.value = 'aptitude';
    } else if (select.value.toLowerCase().includes('training') || select.value.toLowerCase().includes('comm')) {
      typeSelect.value = 'training';
    } else {
      typeSelect.value = 'theory';
    }
  }
}

function handleSaveCustomPeriod(e) {
  e.preventDefault();
  const facultyId = document.getElementById('custom-period-faculty-id').value;
  const day = document.getElementById('custom-period-day').value;
  const periodNum = parseInt(document.getElementById('custom-period-num').value);

  const subjectSelect = document.getElementById('custom-subject-select').value;
  const customSubjInput = document.getElementById('custom-subject-name-input').value;
  const section = document.getElementById('custom-section-select').value;
  const room = document.getElementById('custom-room-input').value;
  const type = document.getElementById('custom-type-select').value;

  const subjectFullName = subjectSelect === 'CUSTOM' ? (customSubjInput || 'Custom Course') : subjectSelect;
  let code = '-';
  if (subjectFullName.includes(':')) {
    code = subjectFullName.split(':')[0].trim();
  }

  const faculty = OFFICIAL_FACULTY_LIST.find(f => f.id === facultyId);
  if (faculty) {
    if (!faculty.schedule[day]) faculty.schedule[day] = {};
    faculty.schedule[day][periodNum] = {
      code: code,
      subject: subjectFullName,
      section: section,
      room: room,
      type: type,
      customAdded: true
    };
    saveFacultyScheduleToStorage();
  }

  closeAddPeriodModal();
  renderFacultyChips(document.getElementById('faculty-search-input')?.value || "");
  renderSelectedFacultyTimetable(facultyId);
}

function deleteCustomPeriodSlot(facultyId, day, periodNum) {
  if (!confirm(`Are you sure you want to remove the class from Period ${periodNum}?`)) {
    return;
  }
  const faculty = OFFICIAL_FACULTY_LIST.find(f => f.id === facultyId);
  if (faculty && faculty.schedule[day] && faculty.schedule[day][periodNum]) {
    delete faculty.schedule[day][periodNum];
    saveFacultyScheduleToStorage();
    renderFacultyChips(document.getElementById('faculty-search-input')?.value || "");
    renderSelectedFacultyTimetable(facultyId);
  }
}

function saveFacultyScheduleToStorage() {
  try {
    const customSchedules = {};
    OFFICIAL_FACULTY_LIST.forEach(f => {
      customSchedules[f.id] = f.schedule;
    });
    localStorage.setItem('CAMPUS_AI_CUSTOM_FACULTY_SCHEDULES', JSON.stringify(customSchedules));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

function loadFacultyScheduleFromStorage() {
  try {
    const saved = localStorage.getItem('CAMPUS_AI_CUSTOM_FACULTY_SCHEDULES');
    if (saved) {
      const parsed = JSON.parse(saved);
      OFFICIAL_FACULTY_LIST.forEach(f => {
        if (parsed[f.id]) {
          f.schedule = parsed[f.id];
        }
      });
    }
  } catch (err) {
    console.error("Storage parse error:", err);
  }
}

function printFacultyTimetable() {
  const faculty = OFFICIAL_FACULTY_LIST.find(f => f.id === selectedFacultyId) || OFFICIAL_FACULTY_LIST[0];
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to export the timetable.");
    return;
  }

  let tableRows = '';
  WEEK_DAYS.forEach(day => {
    const dName = day.charAt(0) + day.slice(1).toLowerCase();
    const daySchedule = faculty.schedule[day] || {};
    let cells = `<td><strong>${dName}</strong></td>`;
    for (let p = 1; p <= 8; p++) {
      const s = daySchedule[p];
      if (s) {
        cells += `<td><strong>${s.code !== '-' ? s.code : ''} ${s.subject}</strong><br><small>${s.section} • ${s.room}</small></td>`;
      } else {
        cells += `<td style="color:#94a3b8; text-align:center;">—</td>`;
      }
    }
    tableRows += `<tr>${cells}</tr>`;
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Faculty Timetable - ${faculty.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { margin: 0 0 6px 0; font-size: 18pt; }
        .header h3 { margin: 0 0 6px 0; font-size: 13pt; color: #475569; }
        .info-bar { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 11pt; background: #f1f5f9; padding: 10px 14px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 6px; vertical-align: top; }
        th { background: #e2e8f0; font-weight: bold; text-align: center; }
        .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10pt; color: #475569; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>V.S.B. ENGINEERING COLLEGE, KARUR</h2>
        <h3>Department of Artificial Intelligence and Data Science</h3>
        <p style="margin:4px 0; font-size:10pt;"><strong>FACULTY TIME TABLE</strong> • Academic Year 2026-2027 (ODD Semester)</p>
      </div>

      <div class="info-bar">
        <div><strong>Faculty:</strong> ${faculty.name} [${faculty.code}] (${faculty.designation})</div>
        <div><strong>Department:</strong> ${faculty.department}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Day / Period</th>
            <th>P1<br><small>09:15-10:00</small></th>
            <th>P2<br><small>10:00-10:45</small></th>
            <th>P3<br><small>11:00-11:45</small></th>
            <th>P4<br><small>11:45-12:30</small></th>
            <th>P5<br><small>01:20-02:05</small></th>
            <th>P6<br><small>02:05-02:50</small></th>
            <th>P7<br><small>03:05-03:50</small></th>
            <th>P8<br><small>03:50-04:30</small></th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <div><strong>Class Advisor</strong></div>
        <div><strong>HoD / AI & DS</strong></div>
        <div><strong>Principal</strong></div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ==========================================
// Study Notes & Materials Management
// ==========================================
let allFacultyMaterials = [];

async function loadFacultyMaterials() {
  const result = await apiRequest('/faculty/materials');
  allFacultyMaterials = Array.isArray(result) ? result : (typeof getStoredFacultyUploadedMaterials === 'function' ? getStoredFacultyUploadedMaterials() : []);
  updateFacultyMaterialStats(allFacultyMaterials);
  renderFacultyMaterials(allFacultyMaterials);
}

function updateFacultyMaterialStats(materials) {
  const countEl = document.getElementById('stat-faculty-materials-count');
  const downloadsEl = document.getElementById('stat-faculty-downloads-count');
  const storageEl = document.getElementById('stat-faculty-storage');

  const count = (materials || []).length;
  if (countEl) countEl.textContent = count;
  if (downloadsEl) {
    const totalDownloads = (materials || []).reduce((acc, m) => acc + (Number(m.downloads) || 0), 0);
    downloadsEl.textContent = totalDownloads.toLocaleString();
  }
  if (storageEl) {
    storageEl.textContent = `${(count * 4.2).toFixed(1)} MB`;
  }
}

function getFormatDetails(format) {
  switch ((format || '').toUpperCase()) {
    case 'PDF':
      return { css: 'format-pdf', icon: 'fa-solid fa-file-pdf', label: 'PDF Document' };
    case 'PPTX':
      return { css: 'format-pptx', icon: 'fa-solid fa-file-powerpoint', label: 'Presentation' };
    case 'ZIP':
      return { css: 'format-zip', icon: 'fa-solid fa-file-zipper', label: 'Code / Archive' };
    case 'Q-BANK':
      return { css: 'format-qbank', icon: 'fa-solid fa-file-lines', label: 'Question Bank' };
    case 'CHEATSHEET':
      return { css: 'format-cheatsheet', icon: 'fa-solid fa-bolt', label: 'Formula Sheet' };
    default:
      return { css: 'format-docx', icon: 'fa-solid fa-file-word', label: 'Document' };
  }
}

function renderFacultyMaterials(materials) {
  const grid = document.getElementById('faculty-materials-grid');
  if (!grid) return;

  if (!materials || materials.length === 0) {
    grid.innerHTML = `
      <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 60px 24px; border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 16px;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(99, 102, 241, 0.12); color: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px auto;">
          <i class="fa-solid fa-cloud-arrow-up"></i>
        </div>
        <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No Notes or Study Materials Posted Yet</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 520px; margin: 0 auto 24px auto; line-height: 1.6;">
          You haven't uploaded any study materials for your students yet. Click below to publish your first lecture notes, question banks, or presentation slides.
        </p>
        <button class="btn btn-primary" onclick="openUploadMaterialModal()">
          <i class="fa-solid fa-plus"></i> Upload Study Material Now
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = materials.map(m => {
    const fmt = getFormatDetails(m.format);
    const dateFormatted = new Date(m.uploadDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <div class="material-card">
        <div>
          <div class="material-header">
            <div class="material-format-icon ${fmt.css}">
              <i class="${fmt.icon}"></i>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px; gap:8px;">
                <span class="badge badge-primary" style="font-size:0.75rem;">${m.subjectCode} • ${m.unit}</span>
              </div>
              <h3 class="material-title" title="${m.title}">${m.title}</h3>
            </div>
          </div>

          <p class="material-desc">${m.description || 'Comprehensive lecture materials and study module notes.'}</p>

          <div class="material-meta-row">
            <div class="material-author">
              <img src="${m.facultyAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}" alt="${m.facultyName}">
              <span style="font-weight:600; color:var(--text-main); font-size:0.8rem;">${m.facultyName}</span>
            </div>
            <div style="display:flex; gap:10px; font-size:0.78rem;">
              <span><i class="fa-solid fa-file"></i> ${m.fileSize || '3.5 MB'}</span>
              <span><i class="fa-solid fa-download" style="color:var(--success);"></i> ${m.downloads || 0}</span>
            </div>
          </div>
        </div>

        <div class="material-actions">
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="previewFacultyMaterial(${m.id})">
            <i class="fa-solid fa-eye"></i> Read / Preview
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openEditMaterialModal(${m.id})" title="Edit Material">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="downloadStudyMaterial(${m.id})" title="Download File">
            <i class="fa-solid fa-download"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteFacultyMaterial(${m.id})" title="Delete Document">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupMaterialFilters() {
  const searchInput = document.getElementById('faculty-material-search');
  const subjectSelect = document.getElementById('faculty-material-filter-subject');
  const typeSelect = document.getElementById('faculty-material-filter-type');

  function applyFilters() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const subject = subjectSelect?.value || 'ALL';
    const type = typeSelect?.value || 'ALL';

    const filtered = allFacultyMaterials.filter(m => {
      const matchesQuery = !query || 
        (m.title && m.title.toLowerCase().includes(query)) ||
        (m.description && m.description.toLowerCase().includes(query)) ||
        (m.subjectCode && m.subjectCode.toLowerCase().includes(query)) ||
        (m.unit && m.unit.toLowerCase().includes(query));

      const matchesSubject = subject === 'ALL' || m.subjectCode === subject;
      const matchesType = type === 'ALL' || (m.format && m.format.toUpperCase() === type.toUpperCase());

      return matchesQuery && matchesSubject && matchesType;
    });

    renderFacultyMaterials(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (subjectSelect) subjectSelect.addEventListener('change', applyFilters);
  if (typeSelect) typeSelect.addEventListener('change', applyFilters);
}

let attachedMaterialFileData = null;

function setupMaterialUploadForm() {
  const form = document.getElementById('faculty-upload-material-form');
  const dropzone = document.getElementById('material-dropzone');
  if (!form) return;

  // Unit Chips Multi-Select Setup
  const unitChips = document.querySelectorAll('#unit-chips-group .unit-chip');
  const unitInput = document.getElementById('mat-unit');
  const unitSummary = document.getElementById('unit-selection-summary');

  function updateUnitSelection() {
    const activeChips = Array.from(document.querySelectorAll('#unit-chips-group .unit-chip.active'));
    const selectedUnits = activeChips.map(chip => chip.getAttribute('data-unit'));

    // Update icons for all chips in group
    unitChips.forEach(chip => {
      const icon = chip.querySelector('.unit-check-icon');
      if (chip.classList.contains('active')) {
        if (icon) icon.className = 'fa-solid fa-square-check unit-check-icon';
      } else {
        if (icon) icon.className = 'fa-regular fa-square unit-check-icon';
      }
    });

    if (selectedUnits.length === 0) {
      if (unitInput) unitInput.value = '';
      if (unitSummary) unitSummary.textContent = '';
      return;
    }

    // If "All Units" is selected
    if (selectedUnits.includes('All Units')) {
      if (unitInput) unitInput.value = 'All Units';
      if (unitSummary) unitSummary.textContent = 'All Units';
      return;
    }

    // If numerical units e.g. ["Unit 1", "Unit 4", "Unit 5"]
    const unitNums = selectedUnits
      .filter(u => u && u.startsWith('Unit '))
      .map(u => u.replace('Unit ', ''))
      .sort((a, b) => Number(a) - Number(b));
    
    const others = selectedUnits.filter(u => u && !u.startsWith('Unit '));

    let displayString = '';
    if (unitNums.length > 0) {
      if (unitNums.length === 1) {
        displayString = `Unit ${unitNums[0]}`;
      } else {
        displayString = `Units ${unitNums.join(', ')}`;
      }
    }
    if (others.length > 0) {
      displayString = displayString ? `${displayString}, ${others.join(', ')}` : others.join(', ');
    }

    if (unitInput) unitInput.value = displayString;
    if (unitSummary) unitSummary.textContent = displayString;
  }

  unitChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const unitVal = chip.getAttribute('data-unit');
      if (unitVal === 'All Units') {
        const isNowActive = !chip.classList.contains('active');
        unitChips.forEach(c => c.classList.remove('active'));
        if (isNowActive) chip.classList.add('active');
      } else {
        const allUnitsChip = document.querySelector('#unit-chips-group .unit-chip[data-unit="All Units"]');
        if (allUnitsChip) allUnitsChip.classList.remove('active');
        chip.classList.toggle('active');
      }
      updateUnitSelection();
    });
  });

  // Material Format Chips Setup
  const formatChips = document.querySelectorAll('#upload-format-chips-group .format-chip');
  const formatInput = document.getElementById('mat-format');
  const formatSummary = document.getElementById('format-selection-summary');

  formatChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      formatChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const fmtVal = chip.getAttribute('data-format') || 'PDF';
      if (formatInput) formatInput.value = fmtVal;
      if (formatSummary) formatSummary.textContent = chip.textContent.trim();
    });
  });

  // Drag and Drop Listeners
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        processAttachedMaterialFile(files[0]);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('mat-title').value.trim();
    const subjectVal = document.getElementById('mat-subject').value;
    if (!subjectVal) {
      showToast('Please choose a Course / Subject.', 'error');
      return;
    }
    const [subjectCode, subjectName] = subjectVal.split('|');
    const unit = (document.getElementById('mat-unit')?.value || '').trim();
    if (!unit) {
      showToast('Please select at least one Unit for this study material.', 'error');
      return;
    }
    const department = document.getElementById('mat-dept')?.value || currentUser?.department || 'Information Technology';
    const format = document.getElementById('mat-format')?.value || 'PDF';
    const desc = document.getElementById('mat-desc').value.trim();

    // Use attached file metadata if provided, otherwise sensible defaults
    const fileSize = attachedMaterialFileData?.size || `${(Math.random() * 3 + 2).toFixed(1)} MB`;
    const cleanUnitFileName = unit.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = attachedMaterialFileData?.name || `${subjectCode}_${cleanUnitFileName}_Notes.pdf`;
    const content = attachedMaterialFileData?.contentPreview || desc;

    const newMaterial = {
      id: Date.now(),
      title,
      subjectCode,
      subjectName,
      department,
      facultyName: currentUser?.fullName || 'Prof. Sarah Jenkins',
      facultyAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      unit,
      format,
      description: desc,
      fileName,
      topics: [
        `${unit} Lecture Notes & Theory Derivations`,
        `Core Syllabus Concepts for ${subjectName}`,
        `Anna University Exam Solutions & Solved Exercises`
      ],
      contentPreview: content,
      fileSize,
      pages: Math.floor(Math.random() * 35 + 15),
      downloads: 0,
      views: 1,
      uploadDate: new Date().toISOString()
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<i class="fa-solid fa-cloud-arrow-up"></i> Publish Material';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing to Students...';
    }

    try {
      // 1. Post to backend/cloud DB
      const res = await apiRequest('/faculty/materials', 'POST', newMaterial);

      // 2. Publish to student notes repository in local state for instant cross-tab sync
      try {
        let studentNotes = typeof getStoredStudyMaterials === 'function' ? getStoredStudyMaterials() : [];
        if (!Array.isArray(studentNotes)) studentNotes = [];
        studentNotes.unshift(newMaterial);
        if (typeof saveStoredStudyMaterials === 'function') {
          saveStoredStudyMaterials(studentNotes);
        } else {
          localStorage.setItem('campusai_study_materials', JSON.stringify(studentNotes));
        }

        let facultyNotes = typeof getStoredFacultyUploadedMaterials === 'function' ? getStoredFacultyUploadedMaterials() : [];
        if (!Array.isArray(facultyNotes)) facultyNotes = [];
        facultyNotes.unshift(newMaterial);
        if (typeof saveStoredFacultyUploadedMaterials === 'function') {
          saveStoredFacultyUploadedMaterials(facultyNotes);
        } else {
          localStorage.setItem('campusai_faculty_uploaded_materials', JSON.stringify(facultyNotes));
        }
      } catch (stErr) {}

      // 3. Update submit button to Published state
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Published! ✓';
        submitBtn.style.background = '#10b981';
      }

      showToast(`✓ Study Material "${title}" published to student notes!`, 'success');

      if (typeof UnreadTracker !== 'undefined') {
        UnreadTracker.notifyNewUpdate('materials');
      }

      window.dispatchEvent(new CustomEvent('campusai:material_published', { detail: newMaterial }));

      // 4. Clean and automatically close modal
      setTimeout(() => {
        removeAttachedFile();
        closeUploadMaterialModal();
        form.reset();
        document.querySelectorAll('.unit-chip').forEach(c => c.classList.remove('active'));
        if (unitInput) unitInput.value = '';
        if (unitSummary) unitSummary.textContent = '';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.style.background = '';
        }
      }, 400);

      await loadFacultyMaterials();
    } catch (err) {
      showToast('Error publishing material. Please try again.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
}

window.handleMaterialFileSelect = function(event) {
  const file = event.target.files?.[0];
  if (file) {
    processAttachedMaterialFile(file);
  }
};

function processAttachedMaterialFile(file) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const sizeDisplay = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${(file.size / 1024).toFixed(1)} KB`;

  attachedMaterialFileData = {
    name: file.name,
    size: sizeDisplay,
    type: file.type,
    contentPreview: `### Attached File: ${file.name}\n\nDocument successfully processed and uploaded by course instructor. Ready for full offline download and student study.`
  };

  // Auto-detect format from extension
  const ext = file.name.split('.').pop().toLowerCase();
  const formatSelect = document.getElementById('mat-format');
  if (formatSelect) {
    if (ext === 'pdf') formatSelect.value = 'PDF';
    else if (ext === 'pptx' || ext === 'ppt') formatSelect.value = 'PPTX';
    else if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'py') formatSelect.value = 'ZIP';
    else if (ext === 'doc' || ext === 'docx') formatSelect.value = 'PDF';
    else formatSelect.value = 'PDF';
  }

  // Auto-suggest title if empty
  const titleInput = document.getElementById('mat-title');
  if (titleInput && !titleInput.value.trim()) {
    titleInput.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  // Update Preview UI
  const emptyState = document.getElementById('dropzone-empty-state');
  const previewCard = document.getElementById('dropzone-file-preview');
  const fileNameEl = document.getElementById('attached-file-name');
  const fileSizeEl = document.getElementById('attached-file-size');
  const iconWrap = document.getElementById('attached-file-icon-wrap');
  const iconEl = document.getElementById('attached-file-icon');

  if (emptyState) emptyState.style.display = 'none';
  if (previewCard) previewCard.style.display = 'flex';
  if (fileNameEl) fileNameEl.textContent = file.name;
  if (fileSizeEl) fileSizeEl.textContent = sizeDisplay;

  if (iconWrap && iconEl) {
    if (ext === 'pdf') {
      iconWrap.className = 'material-format-icon format-pdf';
      iconEl.className = 'fa-solid fa-file-pdf';
    } else if (ext === 'pptx' || ext === 'ppt') {
      iconWrap.className = 'material-format-icon format-pptx';
      iconEl.className = 'fa-solid fa-file-powerpoint';
    } else if (ext === 'zip' || ext === 'rar') {
      iconWrap.className = 'material-format-icon format-zip';
      iconEl.className = 'fa-solid fa-file-zipper';
    } else {
      iconWrap.className = 'material-format-icon format-docx';
      iconEl.className = 'fa-solid fa-file-word';
    }
  }

  showToast(`Attached file "${file.name}" (${sizeDisplay})`, 'info');
}

window.removeAttachedFile = function() {
  attachedMaterialFileData = null;
  const fileInput = document.getElementById('mat-file-input');
  if (fileInput) fileInput.value = '';

  const emptyState = document.getElementById('dropzone-empty-state');
  const previewCard = document.getElementById('dropzone-file-preview');
  if (emptyState) emptyState.style.display = 'block';
  if (previewCard) previewCard.style.display = 'none';
};

window.openUploadMaterialModal = function() {
  document.querySelectorAll('#unit-chips-group .unit-chip').forEach(c => {
    c.classList.remove('active');
    const icon = c.querySelector('.unit-check-icon');
    if (icon) icon.className = 'fa-regular fa-square unit-check-icon';
  });
  const unitInput = document.getElementById('mat-unit');
  if (unitInput) unitInput.value = '';
  const unitSummary = document.getElementById('unit-selection-summary');
  if (unitSummary) unitSummary.textContent = '';

  document.querySelectorAll('#upload-format-chips-group .format-chip').forEach(c => {
    c.classList.remove('active');
    if (c.getAttribute('data-format') === 'PDF') c.classList.add('active');
  });
  const formatInput = document.getElementById('mat-format');
  if (formatInput) formatInput.value = 'PDF';
  const formatSummary = document.getElementById('format-selection-summary');
  if (formatSummary) formatSummary.textContent = 'PDF Notes';

  document.getElementById('upload-material-modal')?.classList.add('active');
};

window.closeUploadMaterialModal = function() {
  document.getElementById('upload-material-modal')?.classList.remove('active');
};

window.deleteFacultyMaterial = async function(id) {
  if (!confirm('Are you sure you want to remove this study material from the student portal?')) return;
  await apiRequest(`/faculty/materials/${id}`, 'DELETE');
  showToast('Study Material deleted successfully.', 'info');
  await loadFacultyMaterials();
};

window.previewFacultyMaterial = function(id) {
  const material = allFacultyMaterials.find(m => m.id === id);
  if (!material) return;

  const modal = document.getElementById('preview-material-modal');
  const fmt = getFormatDetails(material.format);

  const iconEl = document.getElementById('preview-modal-icon');
  if (iconEl) {
    iconEl.className = `material-format-icon ${fmt.css}`;
    iconEl.innerHTML = `<i class="${fmt.icon}"></i>`;
  }

  const titleEl = document.getElementById('preview-modal-title');
  if (titleEl) titleEl.textContent = material.title;

  const subtitleEl = document.getElementById('preview-modal-subtitle');
  if (subtitleEl) subtitleEl.textContent = `${material.subjectCode} - ${material.subjectName} • ${material.unit}`;

  const tagsEl = document.getElementById('preview-modal-tags');
  if (tagsEl) {
    tagsEl.innerHTML = `
      <span class="badge badge-primary">${material.subjectCode}</span>
      <span class="badge badge-info">${material.unit}</span>
      <span class="badge badge-warning">${material.tag || 'Notes'}</span>
      <span class="badge badge-success"><i class="fa-solid fa-file"></i> ${material.fileSize || '3.5 MB'}</span>
      <span class="badge badge-secondary"><i class="fa-solid fa-user-tie"></i> ${material.facultyName}</span>
    `;
  }

  const bodyEl = document.getElementById('preview-modal-document-body');
  if (bodyEl) {
    const formattedContent = (material.contentPreview || material.description || '')
      .replace(/^### (.*$)/gim, '<h4 class="reader-section-header"><i class="fa-solid fa-bookmark"></i> $1</h4>')
      .replace(/^#### (.*$)/gim, '<h5 style="color:var(--text-main); margin:12px 0 6px 0;">$1</h5>')
      .replace(/\`\`\`(\w+)?\n([\s\S]*?)\`\`\`/gim, '<pre class="reader-code-box"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>');

    bodyEl.innerHTML = `
      <div style="margin-bottom:16px;">
        <p style="font-size:0.95rem; color:var(--text-muted); line-height:1.6; margin-bottom:14px;">${material.description}</p>
        ${material.topics && material.topics.length ? `
          <div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:var(--radius-sm); padding:12px 16px; margin-bottom:18px;">
            <strong style="color:var(--primary-light); font-size:0.85rem; display:block; margin-bottom:6px;"><i class="fa-solid fa-list-check"></i> Curriculum Syllabus Coverage:</strong>
            <ul style="padding-left:18px; margin:0; font-size:0.85rem; color:var(--text-main);">
              ${material.topics.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div style="margin-top:16px;">${formattedContent}</div>
      </div>
    `;
  }

  const metaLeftEl = document.getElementById('preview-modal-meta-left');
  if (metaLeftEl) {
    metaLeftEl.innerHTML = `<span>Uploaded: ${new Date(material.uploadDate || Date.now()).toLocaleDateString()} • ${material.downloads || 0} Downloads</span>`;
  }

  const downloadBtn = document.getElementById('preview-modal-download-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => downloadStudyMaterial(material.id);
  }

  modal?.classList.add('active');
};

window.closePreviewModal = function() {
  document.getElementById('preview-material-modal')?.classList.remove('active');
};

window.downloadStudyMaterial = function(id) {
  const targetId = Number(id) || id;

  if (typeof incrementMaterialDownload === 'function') {
    incrementMaterialDownload(targetId);
  } else {
    try {
      let materials = typeof getStoredStudyMaterials === 'function' ? getStoredStudyMaterials() : [];
      materials = materials.map(m => (Number(m.id) === Number(id) || String(m.id) === String(id)) ? { ...m, downloads: (m.downloads || 0) + 1 } : m);
      if (typeof saveStoredStudyMaterials === 'function') saveStoredStudyMaterials(materials);

      let facultyMaterials = typeof getStoredFacultyUploadedMaterials === 'function' ? getStoredFacultyUploadedMaterials() : [];
      facultyMaterials = facultyMaterials.map(m => (Number(m.id) === Number(id) || String(m.id) === String(id)) ? { ...m, downloads: (m.downloads || 0) + 1 } : m);
      if (typeof saveStoredFacultyUploadedMaterials === 'function') saveStoredFacultyUploadedMaterials(facultyMaterials);
    } catch (e) {
      console.error(e);
    }
  }

  const materials = typeof getStoredFacultyUploadedMaterials === 'function' ? getStoredFacultyUploadedMaterials() : (typeof getStoredStudyMaterials === 'function' ? getStoredStudyMaterials() : []);
  const mat = materials.find(m => Number(m.id) === Number(id) || String(m.id) === String(id)) || (typeof getStoredStudyMaterials === 'function' ? getStoredStudyMaterials().find(m => Number(m.id) === Number(id) || String(m.id) === String(id)) : null);
  if (!mat) {
    showToast('Download started...', 'info');
    loadFacultyMaterials();
    return;
  }

  // Generate downloadable plain text/markdown file blob
  const fileContent = `=====================================================
CampusAI - Official Course Study Material
Subject: ${mat.subjectCode || 'Course'} - ${mat.subjectName || 'Study Material'}
Unit: ${mat.unit || 'General'}
Title: ${mat.title}
Instructor: ${mat.facultyName || 'Faculty'}
Published Date: ${new Date(mat.uploadDate || Date.now()).toLocaleString()}
=====================================================

DESCRIPTION:
${mat.description || 'Lecture notes, practice problems, and study guides.'}

SYLLABUS TOPICS:
${(mat.topics || []).map(t => `- ${t}`).join('\n')}

NOTES & FORMULAS:
${mat.contentPreview || 'Refer to full class lectures.'}
`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${(mat.subjectCode || 'Material')}_${(mat.unit || 'Unit')}_${(mat.title || 'Notes').replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  showToast(`Downloading "${mat.title}" (${mat.fileSize || '3.5 MB'})...`, 'success');
  loadFacultyMaterials();
};

// Listen for cross-tab download synchronization
window.addEventListener('storage', (e) => {
  if (e.key === 'campusai_faculty_uploaded_materials' || e.key === 'campusai_study_materials') {
    if (typeof loadFacultyMaterials === 'function') {
      loadFacultyMaterials();
    }
  }
});

window.addEventListener('campusai_material_downloaded', () => {
  if (typeof loadFacultyMaterials === 'function') {
    loadFacultyMaterials();
  }
});

function setupNewAssignmentForm() {
  const form = document.getElementById('create-assignment-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-assign-title').value;
    const subject = document.getElementById('new-assign-subject').value;
    const maxMarks = document.getElementById('new-assign-marks').value;
    const dueDate = document.getElementById('new-assign-due').value;
    const desc = document.getElementById('new-assign-desc').value;

    showToast(`Assignment "${title}" published for ${subject}!`, 'success');
    if (typeof UnreadTracker !== 'undefined') {
      UnreadTracker.notifyNewUpdate('assignments');
    }
    form.reset();
  });
}

function setupBroadcastForm() {
  const form = document.getElementById('faculty-announcement-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('announce-title').value;
    showToast(`Circular "${title}" broadcasted to students.`, 'success');
    if (typeof UnreadTracker !== 'undefined') {
      UnreadTracker.notifyNewUpdate('announcements');
    }
    form.reset();
  });
}

window.openGradingModal = function(assignmentId, title) {
  document.getElementById('grading-modal-title').textContent = `Review Submissions: ${title}`;
  document.getElementById('grading-modal').classList.add('active');
};

window.closeGradingModal = function() {
  document.getElementById('grading-modal').classList.remove('active');
};

window.saveStudentGrade = function() {
  const marks = document.getElementById('grade-marks-input').value;
  const feedback = document.getElementById('grade-feedback-input').value;
  showToast(`Graded successfully! Score: ${marks}/100. Student notified.`, 'success');
  closeGradingModal();
};

// ==========================================
// Edit Study Material Implementation
// ==========================================
let editAttachedMaterialFileData = null;

function setupEditMaterialForm() {
  const form = document.getElementById('faculty-edit-material-form');
  const dropzone = document.getElementById('edit-material-dropzone');
  if (!form) return;

  const unitChips = document.querySelectorAll('#edit-unit-chips-group .edit-unit-chip');
  const unitInput = document.getElementById('edit-mat-unit');
  const unitSummary = document.getElementById('edit-unit-selection-summary');

  function updateEditUnitSelection() {
    const activeChips = Array.from(document.querySelectorAll('#edit-unit-chips-group .edit-unit-chip.active'));
    const selectedUnits = activeChips.map(chip => chip.getAttribute('data-unit'));

    unitChips.forEach(chip => {
      const icon = chip.querySelector('.unit-check-icon');
      if (chip.classList.contains('active')) {
        if (icon) icon.className = 'fa-solid fa-square-check unit-check-icon';
      } else {
        if (icon) icon.className = 'fa-regular fa-square unit-check-icon';
      }
    });

    if (selectedUnits.length === 0) {
      if (unitInput) unitInput.value = '';
      if (unitSummary) unitSummary.textContent = '';
      return;
    }

    if (selectedUnits.includes('All Units')) {
      if (unitInput) unitInput.value = 'All Units';
      if (unitSummary) unitSummary.textContent = 'All Units';
      return;
    }

    const unitNums = selectedUnits
      .filter(u => u && u.startsWith('Unit '))
      .map(u => u.replace('Unit ', ''))
      .sort((a, b) => Number(a) - Number(b));
    
    const others = selectedUnits.filter(u => u && !u.startsWith('Unit '));

    let displayString = '';
    if (unitNums.length > 0) {
      if (unitNums.length === 1) {
        displayString = `Unit ${unitNums[0]}`;
      } else {
        displayString = `Units ${unitNums.join(', ')}`;
      }
    }
    if (others.length > 0) {
      displayString = displayString ? `${displayString}, ${others.join(', ')}` : others.join(', ');
    }

    if (unitInput) unitInput.value = displayString;
    if (unitSummary) unitSummary.textContent = displayString;
  }

  unitChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const unitVal = chip.getAttribute('data-unit');
      if (unitVal === 'All Units') {
        const isNowActive = !chip.classList.contains('active');
        unitChips.forEach(c => c.classList.remove('active'));
        if (isNowActive) chip.classList.add('active');
      } else {
        const allUnitsChip = document.querySelector('#edit-unit-chips-group .edit-unit-chip[data-unit="All Units"]');
        if (allUnitsChip) allUnitsChip.classList.remove('active');
        chip.classList.toggle('active');
      }
      updateEditUnitSelection();
    });
  });

  // Edit Material Format Chips Setup
  const editFormatChips = document.querySelectorAll('#edit-format-chips-group .edit-format-chip');
  const editFormatInput = document.getElementById('edit-mat-format');
  const editFormatSummary = document.getElementById('edit-format-selection-summary');

  editFormatChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      editFormatChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const fmtVal = chip.getAttribute('data-format') || 'PDF';
      if (editFormatInput) editFormatInput.value = fmtVal;
      if (editFormatSummary) editFormatSummary.textContent = chip.textContent.trim();
    });
  });

  // Drag and Drop Listeners for Edit Dropzone
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        processEditAttachedMaterialFile(files[0]);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = Number(document.getElementById('edit-mat-id').value);
    const existing = allFacultyMaterials.find(m => Number(m.id) === id);
    if (!existing) {
      showToast('Material not found for updating.', 'error');
      return;
    }

    const title = document.getElementById('edit-mat-title').value.trim();
    const subjectVal = document.getElementById('edit-mat-subject').value;
    const [subjectCode, subjectName] = subjectVal.split('|');
    const department = document.getElementById('edit-mat-dept').value;
    const format = document.getElementById('edit-mat-format')?.value || existing.format || 'PDF';
    const unit = (document.getElementById('edit-mat-unit')?.value || '').trim();
    if (!unit) {
      showToast('Please select at least one Unit.', 'error');
      return;
    }
    const desc = document.getElementById('edit-mat-desc').value.trim();

    let fileName = existing.fileName;
    let fileSize = existing.fileSize;
    let contentPreview = existing.contentPreview;

    if (editAttachedMaterialFileData) {
      fileSize = editAttachedMaterialFileData.size;
      fileName = editAttachedMaterialFileData.name;
      contentPreview = editAttachedMaterialFileData.contentPreview || desc;
    }

    const updatedData = {
      id,
      title,
      subjectCode,
      subjectName,
      department,
      unit,
      format,
      description: desc,
      fileName,
      fileSize,
      contentPreview,
      topics: [
        `${unit} Lecture Notes & Theory Derivations`,
        `Core Syllabus Concepts for ${subjectName}`,
        `Anna University Exam Solutions & Solved Exercises`
      ]
    };

    await apiRequest('/faculty/materials', 'PUT', updatedData);
    showToast(`Study Material "${title}" updated successfully!`, 'success');
    closeEditMaterialModal();
    await loadFacultyMaterials();
  });
}

window.openEditMaterialModal = function(id) {
  const mat = allFacultyMaterials.find(m => Number(m.id) === Number(id));
  if (!mat) return;

  document.getElementById('edit-mat-id').value = mat.id;
  document.getElementById('edit-mat-title').value = mat.title || '';
  
  // Set Subject
  const subjectSelect = document.getElementById('edit-mat-subject');
  if (subjectSelect) {
    const found = Array.from(subjectSelect.options).find(o => o.value.startsWith(mat.subjectCode));
    if (found) subjectSelect.value = found.value;
  }

  // Set Department
  const deptSelect = document.getElementById('edit-mat-dept');
  if (deptSelect && mat.department) {
    deptSelect.value = mat.department;
  }

  // Set Format Chips
  const fmt = (mat.format || 'PDF').toUpperCase();
  const editFormatInput = document.getElementById('edit-mat-format');
  if (editFormatInput) editFormatInput.value = fmt;
  const editFormatSummary = document.getElementById('edit-format-selection-summary');

  document.querySelectorAll('#edit-format-chips-group .edit-format-chip').forEach(c => {
    c.classList.remove('active');
    if (c.getAttribute('data-format') === fmt) {
      c.classList.add('active');
      if (editFormatSummary) editFormatSummary.textContent = c.textContent.trim();
    }
  });

  // Set Unit chips
  document.querySelectorAll('.edit-unit-chip').forEach(c => c.classList.remove('active'));
  const unitStr = mat.unit || '';
  document.getElementById('edit-mat-unit').value = unitStr;
  const unitSummary = document.getElementById('edit-unit-selection-summary');
  if (unitSummary) unitSummary.textContent = unitStr;

  if (unitStr === 'All Units') {
    document.querySelector('.edit-unit-chip[data-unit="All Units"]')?.classList.add('active');
  } else if (unitStr === 'Lab Manual') {
    document.querySelector('.edit-unit-chip[data-unit="Lab Manual"]')?.classList.add('active');
  } else {
    document.querySelectorAll('.edit-unit-chip').forEach(chip => {
      const u = chip.getAttribute('data-unit');
      if (u && (unitStr.includes(u) || unitStr.includes(u.replace('Unit ', '')))) {
        chip.classList.add('active');
      }
    });
  }

  // Update check icons for edit chips
  document.querySelectorAll('#edit-unit-chips-group .edit-unit-chip').forEach(chip => {
    const icon = chip.querySelector('.unit-check-icon');
    if (chip.classList.contains('active')) {
      if (icon) icon.className = 'fa-solid fa-square-check unit-check-icon';
    } else {
      if (icon) icon.className = 'fa-regular fa-square unit-check-icon';
    }
  });

  document.getElementById('edit-mat-desc').value = mat.description || '';

  // Reset file attachment
  removeEditAttachedFile();
  const currentFileLabel = document.getElementById('edit-current-file-label');
  if (currentFileLabel) {
    currentFileLabel.textContent = `Current file: ${mat.fileName || 'Attached document'} (${mat.fileSize || '3.5 MB'})`;
  }

  document.getElementById('edit-material-modal')?.classList.add('active');
};

window.closeEditMaterialModal = function() {
  document.getElementById('edit-material-modal')?.classList.remove('active');
};

window.handleEditMaterialFileSelect = function(event) {
  const file = event.target.files?.[0];
  if (file) {
    processEditAttachedMaterialFile(file);
  }
};

window.processEditAttachedMaterialFile = function(file) {
  if (!file) return;
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  const sizeKB = (file.size / 1024).toFixed(1);
  const sizeDisplay = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

  editAttachedMaterialFileData = {
    file: file,
    name: file.name,
    size: sizeDisplay,
    type: file.type,
    contentPreview: `[Attached File: ${file.name}]\nFormat: ${file.type || 'Binary'}\nSize: ${sizeDisplay}\nUploaded for students.`
  };

  const emptyState = document.getElementById('edit-dropzone-empty-state');
  const previewCard = document.getElementById('edit-dropzone-file-preview');
  const fileNameEl = document.getElementById('edit-attached-file-name');
  const fileSizeEl = document.getElementById('edit-attached-file-size');
  const iconWrap = document.getElementById('edit-attached-file-icon-wrap');
  const iconEl = document.getElementById('edit-attached-file-icon');

  if (emptyState) emptyState.style.display = 'none';
  if (previewCard) previewCard.style.display = 'flex';
  if (fileNameEl) fileNameEl.textContent = file.name;
  if (fileSizeEl) fileSizeEl.textContent = sizeDisplay;

  if (iconWrap && iconEl) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      iconWrap.className = 'material-format-icon format-pdf';
      iconEl.className = 'fa-solid fa-file-pdf';
    } else if (ext === 'pptx' || ext === 'ppt') {
      iconWrap.className = 'material-format-icon format-pptx';
      iconEl.className = 'fa-solid fa-file-powerpoint';
    } else if (ext === 'zip' || ext === 'rar') {
      iconWrap.className = 'material-format-icon format-zip';
      iconEl.className = 'fa-solid fa-file-zipper';
    } else {
      iconWrap.className = 'material-format-icon format-docx';
      iconEl.className = 'fa-solid fa-file-word';
    }
  }

  showToast(`New file "${file.name}" attached (${sizeDisplay})`, 'info');
};

window.removeEditAttachedFile = function() {
  editAttachedMaterialFileData = null;
  const fileInput = document.getElementById('edit-mat-file-input');
  if (fileInput) fileInput.value = '';

  const emptyState = document.getElementById('edit-dropzone-empty-state');
  const previewCard = document.getElementById('edit-dropzone-file-preview');
  if (emptyState) emptyState.style.display = 'block';
  if (previewCard) previewCard.style.display = 'none';
};
