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

  setupNewAssignmentForm();
  setupBroadcastForm();
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

async function loadFacultyTimetable() {
  const schedule = await apiRequest('/student/timetable');
  const container = document.getElementById('faculty-timetable-container');
  if (!container || !schedule) return;

  container.innerHTML = schedule.slice(0, 8).map(s => `
    <div class="glass-card" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <span class="badge badge-primary" style="margin-bottom:6px;">${s.dayOfWeek} • Period ${s.periodNumber}</span>
        <h4>${s.subjectName}</h4>
        <p style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${s.roomNumber} (${s.startTime} - ${s.endTime})</p>
      </div>
      <span class="badge badge-success">CSE Sem 5</span>
    </div>
  `).join('');
}

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
