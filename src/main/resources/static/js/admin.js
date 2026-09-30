/**
 * CampusAI - Admin Console Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = AuthState.getUser();
  updateProfileHeader(user);
  setupTabs();

  // Setup interactive form listeners immediately
  setupAddUserForm();
  setupAdminAnnouncementForm();
  setupAdminEventForm();
  setupEditEventForm();
  setupKbForm();
  setupAdminAddStudentForm();

  // Fetch tables and metrics
  loadAdminAnalytics().catch(console.error);
  loadRegisteredStudentsTab().catch(console.error);
  loadUserDirectory().catch(console.error);
  loadAdminComplaints().catch(console.error);
  loadAdminEventsList().catch(console.error);
  loadKnowledgeBaseManager().catch(console.error);
});

function updateProfileHeader(user) {
  if (!user) return;
  const adminName = document.getElementById('admin-name');
  const adminRole = document.getElementById('admin-role-dept');
  const adminAvatar = document.getElementById('admin-avatar');

  if (adminName) adminName.textContent = user.fullName || 'Dr. Alistair Vance';
  if (adminRole) adminRole.textContent = 'Principal Administrator • CampusAI';
  if (adminAvatar && user.avatar) adminAvatar.src = user.avatar;
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

      if (tabId === 'analytics') loadAdminAnalytics().catch(console.error);
      else if (tabId === 'students') filterAndRenderStudents();
      else if (tabId === 'users') loadUserDirectory().catch(console.error);
      else if (tabId === 'grievances' || tabId === 'complaints') loadAdminComplaints().catch(console.error);
      else if (tabId === 'events') loadAdminEventsList().catch(console.error);
      else if (tabId === 'knowledge-base') loadKnowledgeBaseManager().catch(console.error);
    });
  });
}

// -------------------------------------------------------------
// 1. Dashboard Overview & Department Analytics
// -------------------------------------------------------------
async function loadAdminAnalytics() {
  const students = (typeof getStoredStudentsList === 'function') ? getStoredStudentsList() : await apiRequest('/admin/students');
  const stats = await apiRequest('/admin/analytics');

  if (students && Array.isArray(students)) {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const distinctDepts = new Set(students.map(s => s.department).filter(Boolean));
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newRegs = students.filter(s => !s.registrationDate || new Date(s.registrationDate) >= thirtyDaysAgo).length;

    const s1 = document.getElementById('stat-total-students');
    const s2 = document.getElementById('stat-total-departments');
    const s3 = document.getElementById('stat-active-students');
    const s4 = document.getElementById('stat-new-registrations');

    if (s1) s1.textContent = totalStudents;
    if (s2) s2.textContent = distinctDepts.size;
    if (s3) s3.textContent = activeStudents;
    if (s4) s4.textContent = newRegs;

    renderDepartmentAnalyticsChart(students);
    renderRecentlyRegisteredStudents(students);
  } else if (stats) {
    const s1 = document.getElementById('stat-total-students');
    const s2 = document.getElementById('stat-total-departments');
    const s3 = document.getElementById('stat-active-students');
    const s4 = document.getElementById('stat-new-registrations');

    if (s1) s1.textContent = stats.totalStudents || 12;
    if (s2) s2.textContent = stats.totalDepartments || 7;
    if (s3) s3.textContent = stats.activeStudents || 11;
    if (s4) s4.textContent = stats.newRegistrations || 12;
  }
}

function renderDepartmentAnalyticsChart(students) {
  const container = document.getElementById('dept-analytics-chart-container');
  if (!container) return;

  const deptCounts = {};
  students.forEach(s => {
    const d = s.department || 'Unassigned';
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });

  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
  const total = students.length || 1;
  const maxCount = Math.max(...Object.values(deptCounts), 1);

  const deptIcons = {
    'Computer Science & Engineering': 'fa-laptop-code',
    'Artificial Intelligence & Data Science': 'fa-brain',
    'Information Technology': 'fa-microchip',
    'Electronics & Communication Engineering': 'fa-satellite-dish',
    'Electrical & Electronics Engineering': 'fa-bolt',
    'Mechanical Engineering': 'fa-gears',
    'Civil Engineering': 'fa-building'
  };

  container.innerHTML = sortedDepts.map(([dept, count]) => {
    const pct = Math.round((count / total) * 100);
    const barWidth = Math.max(12, Math.round((count / maxCount) * 100));
    const icon = deptIcons[dept] || 'fa-graduation-cap';

    return `
      <div class="dept-bar-row">
        <div class="dept-bar-header">
          <span class="dept-bar-label">
            <i class="fa-solid ${icon}" style="color:var(--primary-light); width:18px;"></i>
            <span>${dept}</span>
          </span>
          <span style="display:flex; align-items:center; gap:8px;">
            <span class="dept-count-pill">${count} ${count === 1 ? 'student' : 'students'}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${pct}%</span>
          </span>
        </div>
        <div class="dept-bar-track">
          <div class="dept-bar-fill" style="width: ${barWidth}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentlyRegisteredStudents(students) {
  const tbody = document.getElementById('recent-students-table-body');
  if (!tbody) return;

  const sorted = [...students].sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
  const recent = sorted.slice(0, 8);

  if (!recent.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No registered students yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(s => {
    const dateStr = s.registrationDate ? new Date(s.registrationDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Recent';

    const statusBadge = s.status === 'Active' 
      ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Active</span>`
      : `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> Inactive</span>`;

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${s.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid var(--border-glass);">
            <div>
              <strong style="color:var(--text-main); font-size:0.9rem;">${s.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">${s.email}</div>
            </div>
          </div>
        </td>
        <td><code>${s.studentId}</code></td>
        <td><span style="font-size:0.85rem;">${s.department}</span></td>
        <td><span style="font-size:0.82rem; color:var(--text-muted);">${dateStr}</span></td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openStudentViewModal('${s.studentId}')" title="View Student Details">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 2. Registered Students Tab: Search, Filter, Management Table
// -------------------------------------------------------------
async function loadRegisteredStudentsTab() {
  const deptSelect = document.getElementById('student-dept-filter');
  const searchInput = document.getElementById('student-search-input');
  const statusSelect = document.getElementById('student-status-filter');

  const students = (typeof getStoredStudentsList === 'function') ? getStoredStudentsList() : await apiRequest('/admin/students');

  if (deptSelect && students && Array.isArray(students)) {
    const distinctDepts = Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort();
    const currentVal = deptSelect.value || 'ALL';
    
    deptSelect.innerHTML = `<option value="ALL">All Departments</option>` + 
      distinctDepts.map(d => `<option value="${d}">${d}</option>`).join('');

    deptSelect.value = currentVal;
  }

  if (searchInput && !searchInput.dataset.listenerAttached) {
    searchInput.addEventListener('input', () => filterAndRenderStudents());
    searchInput.dataset.listenerAttached = 'true';
  }

  if (deptSelect && !deptSelect.dataset.listenerAttached) {
    deptSelect.addEventListener('change', () => filterAndRenderStudents());
    deptSelect.dataset.listenerAttached = 'true';
  }

  if (statusSelect && !statusSelect.dataset.listenerAttached) {
    statusSelect.addEventListener('change', () => filterAndRenderStudents());
    statusSelect.dataset.listenerAttached = 'true';
  }

  filterAndRenderStudents();
}

function filterAndRenderStudents() {
  const students = (typeof getStoredStudentsList === 'function') ? getStoredStudentsList() : [];
  const searchInput = document.getElementById('student-search-input');
  const deptSelect = document.getElementById('student-dept-filter');
  const statusSelect = document.getElementById('student-status-filter');
  const tbody = document.getElementById('registered-students-table-body');
  const countBadge = document.getElementById('student-count-badge');
  const emptyState = document.getElementById('students-empty-state');

  const query = (searchInput?.value || '').trim().toLowerCase();
  const selectedDept = deptSelect?.value || 'ALL';
  const selectedStatus = statusSelect?.value || 'ALL';

  const filtered = students.filter(s => {
    const matchesQuery = !query || 
      (s.studentId && s.studentId.toLowerCase().includes(query)) ||
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query)) ||
      (s.department && s.department.toLowerCase().includes(query)) ||
      (s.phone && s.phone.toLowerCase().includes(query));

    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesQuery && matchesDept && matchesStatus;
  });

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${students.length} Students`;
  }

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(s => {
    const dateStr = s.registrationDate ? new Date(s.registrationDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Recent';

    const statusBadge = s.status === 'Active'
      ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Active</span>`
      : `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> Inactive</span>`;

    return `
      <tr>
        <td><strong style="color:var(--primary-light); font-family:monospace; font-size:0.9rem;">${s.studentId}</strong></td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${s.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid var(--border-glass);">
            <div>
              <div style="font-weight:600; color:var(--text-main);">${s.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${s.residenceType || 'Student'}</div>
            </div>
          </div>
        </td>
        <td><a href="mailto:${s.email}" style="color:var(--secondary); text-decoration:none; font-size:0.88rem;">${s.email}</a></td>
        <td><span style="font-size:0.88rem;">${s.department}</span></td>
        <td><span class="badge badge-info" style="font-size:0.78rem;">${s.year || '3rd Year'}</span></td>
        <td><span style="font-size:0.85rem; color:var(--text-muted); font-family:monospace;">${s.phone || 'N/A'}</span></td>
        <td><span style="font-size:0.82rem; color:var(--text-muted);">${dateStr}</span></td>
        <td>${statusBadge}</td>
        <td style="text-align:center;">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="openStudentViewModal('${s.studentId}')" title="View Complete Profile">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="toggleStudentStatus('${s.studentId}')" title="Toggle Status (${s.status === 'Active' ? 'Deactivate' : 'Activate'})">
              <i class="fa-solid fa-arrows-rotate" style="color:${s.status === 'Active' ? 'var(--warning)' : 'var(--success)'};"></i>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="deleteStudentPrompt('${s.studentId}')" title="Delete Student Record">
              <i class="fa-solid fa-trash" style="color:var(--danger);"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.resetStudentFilters = function() {
  const searchInput = document.getElementById('student-search-input');
  const deptSelect = document.getElementById('student-dept-filter');
  const statusSelect = document.getElementById('student-status-filter');

  if (searchInput) searchInput.value = '';
  if (deptSelect) deptSelect.value = 'ALL';
  if (statusSelect) statusSelect.value = 'ALL';

  filterAndRenderStudents();
};

// -------------------------------------------------------------
// 3. Student Modals & Status Operations
// -------------------------------------------------------------
let currentActiveModalStudent = null;

window.openStudentViewModal = function(studentId) {
  const students = (typeof getStoredStudentsList === 'function') ? getStoredStudentsList() : [];
  const student = students.find(s => s.studentId === studentId || s.id == studentId);
  if (!student) {
    showToast('Student record not found.', 'error');
    return;
  }

  currentActiveModalStudent = student;

  const avatar = document.getElementById('modal-student-avatar');
  const name = document.getElementById('modal-student-name');
  const idSub = document.getElementById('modal-student-id-sub');
  const email = document.getElementById('modal-student-email');
  const phone = document.getElementById('modal-student-phone');
  const dept = document.getElementById('modal-student-dept');
  const year = document.getElementById('modal-student-year');
  const regDate = document.getElementById('modal-student-regdate');
  const status = document.getElementById('modal-student-status');
  const toggleBtn = document.getElementById('modal-toggle-status-btn');
  const deleteBtn = document.getElementById('modal-delete-student-btn');

  if (avatar) avatar.src = student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120';
  if (name) name.textContent = student.name;
  if (idSub) idSub.textContent = `Student ID: ${student.studentId}`;
  if (email) email.textContent = student.email;
  if (phone) phone.textContent = student.phone || 'Not Provided';
  if (dept) dept.textContent = student.department;
  if (year) year.textContent = `${student.year || '3rd Year'} • ${student.residenceType || 'Dayscholar'}`;

  const formattedDate = student.registrationDate ? new Date(student.registrationDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Recent';
  if (regDate) regDate.textContent = formattedDate;

  if (status) {
    status.innerHTML = student.status === 'Active'
      ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Active</span>`
      : `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> Inactive</span>`;
  }

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      toggleStudentStatus(student.studentId);
      openStudentViewModal(student.studentId);
    };
  }

  if (deleteBtn) {
    deleteBtn.onclick = () => {
      closeStudentViewModal();
      deleteStudentPrompt(student.studentId);
    };
  }

  document.getElementById('student-view-modal').classList.add('active');
};

window.closeStudentViewModal = function() {
  document.getElementById('student-view-modal').classList.remove('active');
};

window.toggleStudentStatus = function(studentId) {
  let students = (typeof getStoredStudentsList === 'function') ? getStoredStudentsList() : [];
  let updatedName = '';
  let newStatus = 'Active';

  students = students.map(s => {
    if (s.studentId === studentId || s.id == studentId) {
      newStatus = s.status === 'Active' ? 'Inactive' : 'Active';
      updatedName = s.name;
      return { ...s, status: newStatus };
    }
    return s;
  });

  if (typeof saveStoredStudentsList === 'function') {
    saveStoredStudentsList(students);
  }

  showToast(`Status of ${updatedName} updated to ${newStatus}.`, 'info');
  loadAdminAnalytics();
  filterAndRenderStudents();
};

window.deleteStudentPrompt = function(studentId) {
  let students = (typeof getStoredStudentsList === 'function') ? getStoredStudentsList() : [];
  const target = students.find(s => s.studentId === studentId || s.id == studentId);
  if (!target) return;

  if (confirm(`Are you sure you want to delete student record: ${target.name} (${target.studentId})?`)) {
    students = students.filter(s => s.studentId !== studentId && s.id != studentId);
    if (typeof saveStoredStudentsList === 'function') {
      saveStoredStudentsList(students);
    }
    showToast(`Student ${target.name} removed from registered database.`, 'info');
    loadAdminAnalytics();
    loadRegisteredStudentsTab();
  }
};

window.openAdminAddStudentModal = function() {
  document.getElementById('admin-register-student-modal').classList.add('active');
};

window.closeAdminAddStudentModal = function() {
  document.getElementById('admin-register-student-modal').classList.remove('active');
};

function setupAdminAddStudentForm() {
  const form = document.getElementById('admin-add-student-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('add-student-fullname').value.trim();
    const studentId = document.getElementById('add-student-id').value.trim();
    const email = document.getElementById('add-student-email').value.trim();
    const phone = document.getElementById('add-student-phone').value.trim();
    const department = document.getElementById('add-student-dept').value;
    const year = document.getElementById('add-student-year').value;
    const residenceType = document.getElementById('add-student-residence').value;
    const status = document.getElementById('add-student-status').value;

    const newStudent = {
      id: Date.now(),
      studentId,
      name: fullName,
      email,
      phone,
      department,
      year,
      residenceType,
      status,
      registrationDate: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
    };

    if (typeof registerNewStudentEntry === 'function') {
      registerNewStudentEntry(newStudent);
    } else {
      let list = getStoredStudentsList();
      list.unshift(newStudent);
      saveStoredStudentsList(list);
    }

    closeAdminAddStudentModal();
    form.reset();
    showToast(`Student ${fullName} (${studentId}) registered successfully!`, 'success');

    loadAdminAnalytics();
    loadRegisteredStudentsTab();
  });
}

async function loadUserDirectory() {
  const users = await apiRequest('/admin/users');
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody || !users) return;

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" style="width:32px; height:32px; border-radius:50%;">
          <div>
            <strong>${u.fullName}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${u.email}</div>
          </div>
        </div>
      </td>
      <td><span class="badge ${u.role === 'ADMIN' ? 'badge-danger' : (u.role === 'FACULTY' ? 'badge-warning' : 'badge-primary')}">${u.role}</span></td>
      <td>${u.department || 'General'}</td>
      <td><code>${u.rollNumber || 'N/A'}</code></td>
      <td><span class="badge badge-success">ACTIVE</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="deleteUserRow(${u.id}, '${u.fullName}')" title="Remove User">
          <i class="fa-solid fa-trash" style="color:var(--danger);"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminComplaints() {
  const complaints = await apiRequest('/student/complaints?studentId=4');
  const tbody = document.getElementById('admin-complaints-table-body');
  if (!tbody || !complaints) return;

  tbody.innerHTML = complaints.map(c => `
    <tr>
      <td>#${c.id}</td>
      <td><strong>${c.category}</strong></td>
      <td>
        <strong>${c.subject}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${c.description}</p>
      </td>
      <td><span class="badge ${c.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}">${c.status}</span></td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openResolveModal(${c.id}, '${c.subject}')">
          <i class="fa-solid fa-reply"></i> Resolve
        </button>
      </td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// Events Management: Load, Create, Edit, Delete
// -------------------------------------------------------------
async function loadAdminEventsList() {
  const container = document.getElementById('admin-events-list-container');
  const countBadge = document.getElementById('admin-events-count-badge');
  if (!container) return;

  const events = await apiRequest('/public/events');
  if (!events || !events.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
        <i class="fa-regular fa-calendar-xmark" style="font-size:2.5rem; margin-bottom:12px; color:var(--text-subtle);"></i>
        <p>No active campus events published yet.</p>
      </div>`;
    if (countBadge) countBadge.textContent = '0 Events';
    return;
  }

  if (countBadge) countBadge.textContent = `${events.length} Event${events.length > 1 ? 's' : ''}`;

  container.innerHTML = events.map(ev => {
    const formattedDate = ev.eventDate ? new Date(ev.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA';
    return `
      <div class="glass-card" style="padding:16px; border:1px solid var(--border-glass); border-radius:var(--radius-md); background:rgba(255,255,255,0.03); transition:var(--transition);" id="admin-event-card-${ev.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="badge badge-primary" style="font-size:0.75rem;">${ev.category || 'Event'}</span>
              <span style="font-size:0.78rem; color:var(--primary-light); font-weight:600;"><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
            </div>
            <h4 style="font-size:1.02rem; margin-bottom:4px; line-height:1.35; color:var(--text-main);">${ev.title}</h4>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${ev.description || ''}</p>
            <div style="font-size:0.78rem; color:var(--text-subtle); display:flex; gap:12px;">
              <span><i class="fa-solid fa-location-dot"></i> ${ev.location || 'Campus'}</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
            <button class="btn btn-secondary btn-sm" onclick="openEditEventModal(${ev.id})" title="Edit Event Details" style="padding:6px 12px; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-secondary btn-sm" onclick="deleteAdminEvent(${ev.id}, '${encodeURIComponent(ev.title)}')" title="Delete Event" style="padding:6px 12px; font-size:0.8rem; color:var(--danger); display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openEditEventModal = function(id) {
  let events = [];
  try {
    events = JSON.parse(localStorage.getItem('campusai_events_data')) || [];
  } catch(e) {}

  const target = events.find(ev => ev.id == id);
  if (!target) {
    showToast('Event not found.', 'error');
    return;
  }

  document.getElementById('edit-event-id').value = target.id;
  document.getElementById('edit-event-title').value = target.title || '';
  document.getElementById('edit-event-category').value = target.category || 'Hackathon';
  
  if (target.eventDate) {
    try {
      const dt = new Date(target.eventDate);
      const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      document.getElementById('edit-event-date').value = isoLocal;
    } catch(e) {
      document.getElementById('edit-event-date').value = '2026-11-15T09:00';
    }
  }

  document.getElementById('edit-event-location').value = target.location || '';
  document.getElementById('edit-event-desc').value = target.description || '';

  document.getElementById('edit-event-modal').classList.add('active');
};

window.closeEditEventModal = function() {
  document.getElementById('edit-event-modal').classList.remove('active');
};

function setupEditEventForm() {
  const form = document.getElementById('edit-event-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-event-id').value;
    const title = document.getElementById('edit-event-title').value.trim();
    const category = document.getElementById('edit-event-category').value;
    const eventDate = document.getElementById('edit-event-date').value;
    const location = document.getElementById('edit-event-location').value.trim();
    const description = document.getElementById('edit-event-desc').value.trim();

    const updatedEvent = {
      id: parseInt(id),
      title,
      category,
      eventDate: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      location: location || 'Campus Main Auditorium',
      description: description,
      organizer: 'Campus Administration',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
      registrationLink: '#'
    };

    // Update in localStorage
    try {
      let events = JSON.parse(localStorage.getItem('campusai_events_data')) || [];
      const idx = events.findIndex(ev => ev.id == id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...updatedEvent };
        localStorage.setItem('campusai_events_data', JSON.stringify(events));
      }
    } catch(err) { console.error(err); }

    // Update via API
    await apiRequest(`/admin/events/${id}`, 'PUT', updatedEvent).catch(console.error);

    closeEditEventModal();
    showToast(`Event "${title}" updated successfully!`, 'success');
    await loadAdminEventsList();
    await loadAdminAnalytics();
  });
}

window.deleteAdminEvent = async function(id, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  if (!confirm(`Are you sure you want to delete "${title}"? It will be removed from the student calendar.`)) {
    return;
  }

  // Delete from localStorage
  try {
    let events = JSON.parse(localStorage.getItem('campusai_events_data')) || [];
    events = events.filter(ev => ev.id != id);
    localStorage.setItem('campusai_events_data', JSON.stringify(events));
  } catch(err) { console.error(err); }

  // Delete from backend API
  await apiRequest(`/admin/events/${id}`, 'DELETE').catch(console.error);

  showToast(`Event "${title}" has been deleted.`, 'info');
  await loadAdminEventsList();
  await loadAdminAnalytics();
};

function setupAdminEventForm() {
  const form = document.getElementById('admin-event-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('admin-event-title');
    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      showToast('Please enter an event name.', 'error');
      return;
    }
    const category = document.getElementById('admin-event-category')?.value || 'Hackathon';
    const eventDate = document.getElementById('admin-event-date')?.value || new Date().toISOString();
    const location = document.getElementById('admin-event-location')?.value.trim() || 'Campus Main Auditorium';
    const description = document.getElementById('admin-event-desc')?.value.trim() || 'Exciting college campus event & fest.';

    const newEvent = {
      id: Date.now(),
      title,
      category,
      eventDate: eventDate ? (eventDate.includes('T') ? eventDate : new Date(eventDate).toISOString()) : new Date().toISOString(),
      location: location,
      description: description,
      organizer: 'Campus Administration',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
      registrationLink: '#'
    };

    // Save directly to localStorage
    try {
      let currentEvents = [];
      const stored = localStorage.getItem('campusai_events_data');
      if (stored) currentEvents = JSON.parse(stored);
      if (!Array.isArray(currentEvents) || !currentEvents.length) {
        currentEvents = [
          { id: 1, title: 'KANAL 2K26 - National Level Technical Symposium', category: 'Symposium', description: 'Flagship National Level Technical Symposium by CSE & IT featuring Paper Presentation, Code Sprint, Bug Hunt, Web Design, and AI Hack Challenge with cash awards.', eventDate: '2026-10-18T09:00:00', location: 'VSB Main Auditorium & CSE Lab 4', organizer: 'Dept of CSE & IT, VSBEC Karur', bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', registrationLink: 'https://vsbec.edu.in/kanal2k26' },
          { id: 2, title: 'LIRO 2K26 - Line Follower Robotics Competition', category: 'Robotics', description: 'Inter-college autonomous robotics and IoT line follower navigation challenge testing speed, sensor accuracy, and algorithmic path optimization.', eventDate: '2026-10-13T09:30:00', location: 'Einstein Tech Block & ECE Robotics Lab', organizer: 'Dept of ECE & Robotics Club', bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', registrationLink: 'https://vsbec.edu.in/liro2k26' },
          { id: 3, title: 'ILLUMINATE 2026 - E-Cell Entrepreneurship Summit', category: 'Workshop', description: 'Hands-on startup incubation, business modeling, and venture capital pitching workshop organized in association with E-Cell IIT Bombay.', eventDate: '2026-10-14T10:00:00', location: 'VSB Convention Center', organizer: 'Entrepreneurship Development Cell (EDC)', bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600', registrationLink: 'https://vsbec.edu.in/illuminate' },
          { id: 4, title: 'DIGIVERSE XPOSE 2026 - Annual Project & Cultural Expo', category: 'Cultural & Expo', description: 'Grand annual inter-department innovative engineering project expo, AI demonstrations, and cultural music & dance fiesta.', eventDate: '2026-11-05T08:30:00', location: 'Central Open Air Amphitheatre', organizer: 'Student Affairs Council', bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', registrationLink: 'https://vsbec.edu.in/digiverse' }
        ];
      }
      currentEvents.unshift(newEvent);
      localStorage.setItem('campusai_events_data', JSON.stringify(currentEvents));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }

    await apiRequest('/admin/events', 'POST', newEvent).catch(console.error);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Event Added Successfully!';
      submitBtn.style.background = 'var(--success)';
      setTimeout(() => {
        submitBtn.innerHTML = originalHtml;
        submitBtn.style.background = '';
      }, 2000);
    }

    showToast(`🎉 Campus Event "${title}" published to student calendar!`, 'success');
    form.reset();
    await loadAdminEventsList();
    await loadAdminAnalytics();
  });
}

// -------------------------------------------------------------
// Announcements & Knowledge Base Handlers
// -------------------------------------------------------------
function setupAddUserForm() {
  const form = document.getElementById('add-user-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('new-user-fullname').value;
    const email = document.getElementById('new-user-email').value;
    const role = document.getElementById('new-user-role').value;
    const dept = document.getElementById('new-user-dept').value;
    const roll = document.getElementById('new-user-roll').value;

    showToast(`User ${fullName} (${role}) added to directory!`, 'success');
    form.reset();
    await loadUserDirectory();
    await loadAdminAnalytics();
  });
}

function setupAdminAnnouncementForm() {
  const form = document.getElementById('admin-broadcast-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('admin-announce-title').value.trim();
    const priority = document.getElementById('admin-announce-priority').value;
    const targetRole = document.getElementById('admin-announce-target').value;
    const content = document.getElementById('admin-announce-content').value.trim();

    const newAnnouncement = {
      id: Date.now(),
      title,
      priority,
      targetRole,
      content,
      createdAt: new Date().toISOString()
    };

    try {
      let list = JSON.parse(localStorage.getItem('campusai_announcements_data')) || [];
      list.unshift(newAnnouncement);
      localStorage.setItem('campusai_announcements_data', JSON.stringify(list));
    } catch(err) { console.error(err); }

    await apiRequest('/admin/announcements', 'POST', newAnnouncement).catch(console.error);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      const orig = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Notice Broadcasted!';
      setTimeout(() => { submitBtn.innerHTML = orig; }, 1800);
    }

    showToast(`Official Notice "${title}" published across all campus portals!`, 'success');
    form.reset();
    await loadAdminAnalytics();
  });
}

const mockKnowledgeBase = [
  { id: 1, category: 'FEES', title: 'Institutional Tuition & Fee Schedule Regulations (AY 2026–2027)', refNumber: 'VSB/FIN/FEE-REG/2026-27/01', keywords: 'tuition, payment due date, late fine slabs, refund, installments', authority: 'Office of Finance & Accounts' },
  { id: 2, category: 'FEES', title: 'VSB Educational Trust Merit Scholarship & Concession Policy Bulletin 2026', refNumber: 'TRUST-SCHOLAR-2026/B-12', keywords: 'tnea cutoff 195, 100% waiver, cgpa topper cash award', authority: 'Board of Trustees' },
  { id: 3, category: 'LIBRARY', title: 'Central Digital Library Regulations Manual & Code of Ethics 2026', refNumber: 'LIB/MANUAL/2026/V4.2', keywords: 'borrow quota 5 books, overdue fine ₹2/day, book bank, ieee xplore', authority: 'Central Library Directorate' },
  { id: 4, category: 'EXAMS', title: 'Autonomous COE ODD Semester Examination & Hall Ticket Directive', refNumber: 'COE/CIR/2026/ODD/042', keywords: 'october 28 exams, mandatory 75% attendance, medical condonation', authority: 'Controller of Examinations' },
  { id: 5, category: 'EXAMS', title: 'Autonomous Revaluation, Photocopy & Supplementary Examination Notification', refNumber: 'COE/REV/2026/SUPP-03', keywords: 'revaluation ₹400, photocopy ₹300, 50% refund, arrears', authority: 'Controller of Examinations' },
  { id: 6, category: 'GRIEVANCE', title: 'Institutional Grievance Redressal Mechanism & Student Charter', refNumber: 'VSB/GRC/POLICY/2026/01', keywords: '4-tier escalation, mentor 24-48h SLA, hod, grc, ombudsman', authority: 'Apex Grievance Redressal Cell' },
  { id: 7, category: 'GRIEVANCE', title: 'Statutory Anti-Ragging Mandate & Internal Complaints Committee (ICC)', refNumber: 'INST/CIR/ICC-AR/2026/007', keywords: 'anti-ragging 1800-180-5522, flying squad, icc posh 15-day resolution', authority: 'Anti-Ragging Squad & ICC' },
  { id: 8, category: 'PLACEMENTS', title: 'Career Development Centre (CDC) Training & Placement Code of Conduct', refNumber: 'CDC/POLICY/2026/P-01', keywords: '47 lpa highest ctc, dream company policy, 1000+ offers', authority: 'Placement Directorate' },
  { id: 9, category: 'TRANSPORT', title: 'College Bus Transportation & Commuter Regulations', refNumber: 'TRANS/MANUAL/2026/R-50', keywords: '50+ routes, trichy, erode, dindigul, rfid smart card, 4:45 departure', authority: 'Transport Division' }
];

async function loadKnowledgeBaseManager() {
  const container = document.getElementById('kb-list-container');
  if (!container) return;

  container.innerHTML = mockKnowledgeBase.map(kb => `
    <div class="glass-card" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="badge badge-info">${kb.category}</span>
          <span style="font-family:monospace; font-size:0.75rem; color:var(--secondary); background:rgba(6,182,212,0.1); padding:2px 8px; border-radius:4px;"><i class="fa-solid fa-hashtag"></i> ${kb.refNumber}</span>
          <span style="font-size:0.72rem; color:#34d399; font-weight:700;"><i class="fa-solid fa-shield-check"></i> Verified</span>
        </div>
        <h4 style="font-size:0.95rem; margin-bottom:4px;">${kb.title}</h4>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:2px;">Issuing Authority: <strong style="color:var(--text-main);">${kb.authority}</strong></p>
        <p style="font-size:0.75rem; color:var(--text-subtle);">Trigger Keywords: <code>${kb.keywords}</code></p>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button class="btn btn-primary btn-sm" style="white-space:nowrap;" onclick="if(typeof openDocumentInspector==='function'){ openDocumentInspector('doc-${kb.category.toLowerCase()}-01'); } else { showToast('Opening archive record: ${kb.refNumber}', 'info'); }">
          <i class="fa-solid fa-file-magnifying-glass"></i> View Clauses
        </button>
        <button class="btn btn-secondary btn-sm" style="white-space:nowrap;" onclick="showToast('AI semantic intent editor for ${kb.refNumber} loaded.', 'info')">
          <i class="fa-solid fa-pen"></i> Edit Context
        </button>
      </div>
    </div>
  `).join('');
}

function setupKbForm() {
  const form = document.getElementById('add-kb-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = document.getElementById('kb-topic-title').value;
    showToast(`AI Knowledge Base updated with verified institutional record: "${topic}"!`, 'success');
    form.reset();
  });
}

window.deleteUserRow = function(id, name) {
  if (confirm(`Are you sure you want to deactivate user: ${name}?`)) {
    showToast(`User ${name} deactivated successfully.`, 'info');
  }
};

let currentResolveId = null;
window.openResolveModal = function(id, subject) {
  currentResolveId = id;
  document.getElementById('resolve-modal-title').textContent = `Resolve Ticket #${id}: ${subject}`;
  document.getElementById('resolve-modal').classList.add('active');
};

window.closeResolveModal = function() {
  document.getElementById('resolve-modal').classList.remove('active');
};

window.submitResolveResponse = function() {
  const responseText = document.getElementById('resolve-response-text').value;
  const status = document.getElementById('resolve-status-select').value;
  showToast(`Ticket #${currentResolveId} updated to ${status}. Notification sent to student!`, 'success');
  closeResolveModal();
};
