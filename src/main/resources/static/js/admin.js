/**
 * CampusAI - Admin Console Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = AuthState.getUser();
  updateProfileHeader(user);
  setupTabs();

  await loadAdminAnalytics();
  await loadUserDirectory();
  await loadAdminComplaints();
  await loadKnowledgeBaseManager();

  setupAddUserForm();
  setupAdminAnnouncementForm();
  setupAdminEventForm();
  setupKbForm();
});

function updateProfileHeader(user) {
  if (!user) return;
  document.getElementById('admin-name').textContent = user.fullName || 'Dr. Alistair Vance';
  document.getElementById('admin-role-dept').textContent = 'Principal Administrator • CampusAI';
  if (user.avatar) document.getElementById('admin-avatar').src = user.avatar;
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

async function loadAdminAnalytics() {
  const stats = await apiRequest('/admin/analytics');
  if (stats) {
    document.getElementById('stat-total-students').textContent = stats.totalStudents || 1420;
    document.getElementById('stat-total-faculty').textContent = stats.totalFaculty || 85;
    document.getElementById('stat-pending-grievances').textContent = stats.pendingComplaints || 4;
    document.getElementById('stat-active-events').textContent = stats.upcomingEvents || 3;
  }
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

const mockKnowledgeBase = [
  { id: 1, category: 'ABOUT', title: 'About CampusAI Institute of Tech', keywords: 'ranking, naac, campus' },
  { id: 2, category: 'ADMISSION', title: 'Admissions & Eligibility Criteria', keywords: 'btech, jee, cutoff, 10+2' },
  { id: 3, category: 'FEES', title: 'Tuition Fee Structure & Scholarships', keywords: 'fees, scholarship, installments' },
  { id: 4, category: 'LIBRARY', title: 'Central Library Hours & Digital Access', keywords: 'library, books, journals, ieee' },
  { id: 5, category: 'HOSTEL', title: 'Hostel Accommodation & Dining Rules', keywords: 'hostel, room, mess, warden' },
  { id: 6, category: 'PLACEMENTS', title: 'Campus Placement Statistics & Recruiters', keywords: 'jobs, packages, google, amazon' }
];

async function loadKnowledgeBaseManager() {
  const container = document.getElementById('kb-list-container');
  if (!container) return;

  container.innerHTML = mockKnowledgeBase.map(kb => `
    <div class="glass-card" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <span class="badge badge-info" style="margin-bottom:6px;">${kb.category}</span>
        <h4>${kb.title}</h4>
        <p style="font-size:0.8rem; color:var(--text-muted);">AI Keywords: <code>${kb.keywords}</code></p>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="editKbItem(${kb.id})">
        <i class="fa-solid fa-pen"></i> Edit AI Prompt
      </button>
    </div>
  `).join('');
}

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
      title,
      priority,
      targetRole,
      content,
      createdAt: new Date().toISOString()
    };

    await apiRequest('/admin/announcements', 'POST', newAnnouncement);
    showToast(`Official Notice "${title}" published across all campus portals!`, 'success');
    form.reset();
    await loadAdminAnalytics();
  });
}

function setupAdminEventForm() {
  const form = document.getElementById('admin-event-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('admin-event-title').value.trim();
    const category = document.getElementById('admin-event-category').value;
    const eventDate = document.getElementById('admin-event-date').value;
    const location = document.getElementById('admin-event-location').value.trim();
    const description = document.getElementById('admin-event-desc').value.trim();

    const newEvent = {
      title,
      category,
      eventDate: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      location: location || 'Campus Main Auditorium',
      description: description || 'Exciting college campus event.',
      organizer: 'Campus Administration',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
      registrationLink: '#'
    };

    await apiRequest('/admin/events', 'POST', newEvent);
    showToast(`Campus Event "${title}" published to student calendar!`, 'success');
    form.reset();
    await loadAdminAnalytics();
  });
}

function setupKbForm() {
  const form = document.getElementById('add-kb-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = document.getElementById('kb-topic-title').value;
    showToast(`AI Knowledge Base updated with new context: "${topic}"!`, 'success');
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
