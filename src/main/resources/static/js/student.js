/**
 * CampusAI - Student Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = AuthState.getUser();
  if (!user || user.role !== 'STUDENT') {
    // If not logged in or different role, allow browsing but set defaults
    document.getElementById('student-name-display')?.setTextContent?.(user ? user.fullName : 'Alex Morgan');
  }

  // Populate user profile info in topbar and sidebar
  updateProfileHeader(user);

  // Tab switching
  setupTabs();

  // Load dashboard data
  await loadDashboardOverview();
  await loadTimetable();
  await loadAttendance();
  await loadAssignments();
  await loadEvents();
  await loadAnnouncements();
  await loadComplaints();

  // Setup form submissions
  setupComplaintForm();
  setupAssignmentSubmissionForm();
});

function updateProfileHeader(user) {
  if (!user) return;
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  const avatarEl = document.getElementById('user-avatar');
  const welcomeName = document.getElementById('welcome-student-name');
  const rollEl = document.getElementById('student-roll-dept');

  if (nameEl) nameEl.textContent = user.fullName;
  if (roleEl) roleEl.textContent = `${user.department || 'CSE'} • Sem ${user.semester || 5}`;
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;
  if (welcomeName) welcomeName.textContent = user.fullName;
  if (rollEl) rollEl.textContent = `Roll No: ${user.rollNumber || 'CS2024-042'} | Semester ${user.semester || 5}`;
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
    });
  });
}

async function loadDashboardOverview() {
  const user = AuthState.getUser();
  const stats = await apiRequest(`/student/dashboard-stats?studentId=${user.id}`);

  if (stats) {
    document.getElementById('stat-attendance-rate').textContent = `${stats.attendancePercent}%`;
    document.getElementById('stat-present-count').textContent = `${stats.presentClasses} / ${stats.totalClasses} Classes`;
    document.getElementById('stat-pending-assignments').textContent = stats.pendingAssignments;
    document.getElementById('stat-active-complaints').textContent = stats.totalComplaints;

    // Update Attendance Ring
    const ring = document.getElementById('attendance-ring-circle');
    if (ring) {
      const circumference = 2 * Math.PI * 60; // r=60
      const offset = circumference - (stats.attendancePercent / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }
  }
}

async function loadTimetable() {
  const schedule = await apiRequest('/student/timetable');
  const container = document.getElementById('timetable-container');
  if (!container || !schedule) return;

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  let html = `
    <div class="tt-header">Day / Period</div>
    <div class="tt-header">Period 1 (09:00 - 10:00)</div>
    <div class="tt-header">Period 2 (10:00 - 11:00)</div>
    <div class="tt-header">Period 3 (11:15 - 12:15)</div>
    <div class="tt-header">Period 4 (13:00 - 14:30)</div>
  `;

  days.forEach(day => {
    html += `<div class="tt-day"><i class="fa-solid fa-calendar-day" style="margin-right:8px; color:var(--primary-light);"></i>${day.substring(0, 3)}</div>`;
    const dayClasses = schedule.filter(s => s.dayOfWeek === day);

    for (let p = 1; p <= 4; p++) {
      const cell = dayClasses.find(s => s.periodNumber === p);
      if (cell) {
        html += `
          <div class="tt-cell">
            <h4>${cell.subjectName}</h4>
            <p><i class="fa-solid fa-location-dot"></i> ${cell.roomNumber} • <span class="badge badge-primary">${cell.subjectCode}</span></p>
          </div>
        `;
      } else {
        html += `<div class="tt-cell" style="opacity:0.4; display:flex; align-items:center; justify-content:center;"><span style="font-size:0.8rem;">Free Period</span></div>`;
      }
    }
  });

  container.innerHTML = html;
}

async function loadAttendance() {
  const user = AuthState.getUser();
  const records = await apiRequest(`/student/attendance?studentId=${user.id}`);
  const tbody = document.getElementById('attendance-table-body');
  if (!tbody || !records) return;

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><strong>${r.subjectCode}</strong></td>
      <td>${r.subjectName}</td>
      <td>${r.attendanceDate}</td>
      <td>
        <span class="badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}">
          <i class="fa-solid ${r.status === 'PRESENT' ? 'fa-check' : 'fa-xmark'}"></i> ${r.status}
        </span>
      </td>
      <td><span style="color:var(--text-muted); font-size:0.85rem;">${r.remarks || 'Regular lecture'}</span></td>
    </tr>
  `).join('');
}

async function loadAssignments() {
  const user = AuthState.getUser();
  const data = await apiRequest(`/student/assignments?studentId=${user.id}`);
  const container = document.getElementById('assignments-list');
  if (!container || !data) return;

  container.innerHTML = data.map(item => {
    const a = item.assignment;
    const sub = item.submission;
    const isSubmitted = !!sub;
    const isGraded = sub && sub.status === 'GRADED';

    return `
      <div class="glass-card assignment-card">
        <div>
          <div class="card-top">
            <span class="badge badge-primary">${a.subjectCode}</span>
            <span class="badge ${isGraded ? 'badge-success' : (isSubmitted ? 'badge-info' : 'badge-warning')}">
              ${isGraded ? `Graded: ${sub.marksObtained}/${a.maxMarks}` : (isSubmitted ? 'Submitted' : 'Pending')}
            </span>
          </div>
          <h3 style="font-size:1.1rem; margin-bottom:8px;">${a.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">${a.description}</p>
        </div>
        <div>
          <div class="card-meta">
            <span><i class="fa-regular fa-clock"></i> Due: ${new Date(a.dueDate).toLocaleDateString()}</span>
            <span><i class="fa-solid fa-award"></i> ${a.maxMarks} Marks</span>
          </div>
          <div style="margin-top:16px;">
            ${isSubmitted ? `
              <div style="font-size:0.8rem; color:var(--success); margin-bottom:8px;">
                <i class="fa-solid fa-circle-check"></i> Submitted on ${new Date().toLocaleDateString()}
                ${sub.feedback ? `<p style="color:var(--text-muted); margin-top:4px;"><em>Feedback: ${sub.feedback}</em></p>` : ''}
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" style="width:100%;" onclick="openSubmitModal(${a.id}, '${a.title}')">
                <i class="fa-solid fa-upload"></i> Submit Solution
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function loadEvents() {
  const events = await apiRequest('/public/events');
  const container = document.getElementById('student-events-list');
  if (!container || !events) return;

  container.innerHTML = events.map(ev => `
    <div class="glass-card event-card">
      <div>
        <div class="card-top">
          <span class="badge badge-info">${ev.category}</span>
          <span style="font-size:0.8rem; color:var(--primary-light); font-weight:600;">${new Date(ev.eventDate).toLocaleDateString()}</span>
        </div>
        <h3 style="font-size:1.15rem; margin-bottom:6px;">${ev.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">${ev.description}</p>
      </div>
      <div>
        <div class="card-meta" style="margin-bottom:14px;">
          <span><i class="fa-solid fa-location-dot"></i> ${ev.location}</span>
          <span><i class="fa-solid fa-user-tie"></i> ${ev.organizer}</span>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%;" onclick="openEventModal('${encodeURIComponent(ev.title)}', '${ev.category}')">
          <i class="fa-solid fa-ticket"></i> Register for Event &rarr;
        </button>
      </div>
    </div>
  `).join('');
}

async function loadAnnouncements() {
  const notices = await apiRequest('/public/announcements');
  const container = document.getElementById('student-announcements-list');
  if (!container || !notices) return;

  container.innerHTML = notices.map(n => `
    <div class="glass-card announcement-card">
      <div class="card-top">
        <span class="badge ${n.priority === 'URGENT' ? 'badge-danger' : (n.priority === 'HIGH' ? 'badge-warning' : 'badge-primary')}">
          ${n.priority}
        </span>
        <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(n.createdAt || Date.now()).toLocaleDateString()}</span>
      </div>
      <h3 style="font-size:1.1rem; margin-bottom:8px;">${n.title}</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.6;">${n.content}</p>
    </div>
  `).join('');
}

async function loadComplaints() {
  const user = AuthState.getUser();
  const complaints = await apiRequest(`/student/complaints?studentId=${user.id}`);
  const container = document.getElementById('complaints-list');
  if (!container || !complaints) return;

  container.innerHTML = complaints.map(c => `
    <div class="glass-card complaint-card" style="margin-bottom:16px;">
      <div class="card-top">
        <span class="badge badge-info">${c.category}</span>
        <span class="badge ${c.status === 'RESOLVED' ? 'badge-success' : (c.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-danger')}">
          ${c.status}
        </span>
      </div>
      <h3 style="font-size:1.05rem; margin-bottom:6px;">${c.subject}</h3>
      <p style="font-size:0.88rem; color:var(--text-muted);">${c.description}</p>
      ${c.adminResponse ? `
        <div style="margin-top:14px; padding:12px; background:rgba(99,102,241,0.08); border-radius:var(--radius-sm); border-left:3px solid var(--primary);">
          <strong style="font-size:0.8rem; color:var(--primary-light);"><i class="fa-solid fa-reply"></i> Admin Response:</strong>
          <p style="font-size:0.85rem; color:var(--text-main); margin-top:4px;">${c.adminResponse}</p>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function setupComplaintForm() {
  const form = document.getElementById('complaint-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = AuthState.getUser();
    const category = document.getElementById('complaint-category').value;
    const subject = document.getElementById('complaint-subject').value;
    const description = document.getElementById('complaint-description').value;

    const payload = {
      studentId: user.id,
      category,
      subject,
      description,
      status: 'PENDING'
    };

    await apiRequest('/student/complaints', 'POST', payload);
    showToast('Grievance submitted successfully! Admin notified.', 'success');
    form.reset();
    await loadComplaints();
  });
}

// Assignment Modal
let currentAssignmentId = null;
window.openSubmitModal = function(assignmentId, title) {
  currentAssignmentId = assignmentId;
  const modal = document.getElementById('submit-modal');
  document.getElementById('submit-modal-title').textContent = `Submit Solution: ${title}`;
  modal.classList.add('active');
};

window.closeSubmitModal = function() {
  document.getElementById('submit-modal').classList.remove('active');
};

function setupAssignmentSubmissionForm() {
  const form = document.getElementById('assignment-submit-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = AuthState.getUser();
    const text = document.getElementById('submission-text').value;
    const link = document.getElementById('submission-link').value;

    const payload = {
      assignmentId: currentAssignmentId,
      studentId: user.id,
      submissionText: text,
      fileUrl: link,
      status: 'SUBMITTED'
    };

    await apiRequest('/student/assignments/submit', 'POST', payload);
    showToast('Assignment submitted successfully!', 'success');
    closeSubmitModal();
    form.reset();
    await loadAssignments();
    await loadDashboardOverview();
  });
}

// ==========================================
// Event Registration Form Modal Functions
// ==========================================
window.openEventModal = function(encodedTitle, category) {
  const title = decodeURIComponent(encodedTitle);
  const user = AuthState.getUser() || {};

  document.getElementById('reg-event-name').value = title;
  document.getElementById('event-modal-title').textContent = `Register: ${title}`;

  if (document.getElementById('reg-student-name')) {
    document.getElementById('reg-student-name').value = user.fullName || 'Alex Morgan';
  }
  if (document.getElementById('reg-student-roll')) {
    document.getElementById('reg-student-roll').value = user.rollNumber || 'CS2024-042';
  }
  if (document.getElementById('reg-email')) {
    document.getElementById('reg-email').value = user.email || 'alex.m@campusai.edu';
  }
  if (document.getElementById('reg-phone')) {
    document.getElementById('reg-phone').value = user.phone || '+91 98765 43210';
  }

  // Pre-adjust track select based on event type
  const trackSelect = document.getElementById('reg-track-select');
  if (trackSelect) {
    if (title.includes('KANAL')) {
      trackSelect.value = 'Code Sprint & Bug Hunt';
    } else if (title.includes('LIRO')) {
      trackSelect.value = 'Line Follower / Robotics';
    } else if (title.includes('ILLUMINATE')) {
      trackSelect.value = 'AI & Web Hackathon';
    } else if (title.includes('DIGIVERSE')) {
      trackSelect.value = 'Project Exhibition';
    }
  }

  const modal = document.getElementById('event-register-modal');
  if (modal) modal.classList.add('active');
};

window.closeEventModal = function() {
  const modal = document.getElementById('event-register-modal');
  if (modal) modal.classList.remove('active');
};

function setupEventRegistrationForm() {
  const form = document.getElementById('event-registration-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const eventName = document.getElementById('reg-event-name').value;
    const studentName = document.getElementById('reg-student-name').value;
    const track = document.getElementById('reg-track-select').value;
    const passCode = 'VSB-' + Math.floor(1000 + Math.random() * 9000);

    closeEventModal();
    showToast(`🎉 Registration Confirmed for ${studentName}! Pass ID: ${passCode} (${track})`, 'success');
  });
}

// Auto init event form
document.addEventListener('DOMContentLoaded', () => {
  setupEventRegistrationForm();
});
