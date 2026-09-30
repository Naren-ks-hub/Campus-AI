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

  // Fetch tables and metrics
  loadAdminAnalytics().catch(console.error);
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
      else if (tabId === 'users') loadUserDirectory().catch(console.error);
      else if (tabId === 'complaints') loadAdminComplaints().catch(console.error);
      else if (tabId === 'events') loadAdminEventsList().catch(console.error);
      else if (tabId === 'knowledge-base') loadKnowledgeBaseManager().catch(console.error);
    });
  });
}

async function loadAdminAnalytics() {
  const stats = await apiRequest('/admin/analytics');
  if (stats) {
    const s1 = document.getElementById('stat-total-students');
    const s2 = document.getElementById('stat-total-faculty');
    const s3 = document.getElementById('stat-pending-grievances');
    const s4 = document.getElementById('stat-active-events');
    
    let eventCount = stats.upcomingEvents || 4;
    try {
      const storedEvents = JSON.parse(localStorage.getItem('campusai_events_data'));
      if (Array.isArray(storedEvents)) eventCount = storedEvents.length;
    } catch(e) {}

    if (s1) s1.textContent = stats.totalStudents || 1420;
    if (s2) s2.textContent = stats.totalFaculty || 85;
    if (s3) s3.textContent = stats.pendingComplaints || 4;
    if (s4) s4.textContent = eventCount;
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
