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
      <span class="badge badge-success">AI&DS Sem 5</span>
    </div>
  `).join('');
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
    const [subjectCode, subjectName] = document.getElementById('mat-subject').value.split('|');
    const unit = document.getElementById('mat-unit').value;
    const format = document.getElementById('mat-format').value;
    const desc = document.getElementById('mat-desc').value.trim();

    const currentUser = AuthState.getUser();

    // Use attached file metadata if provided, otherwise sensible defaults
    const fileSize = attachedMaterialFileData?.size || `${(Math.random() * 3 + 2).toFixed(1)} MB`;
    const fileName = attachedMaterialFileData?.name || `${subjectCode}_${unit}_Notes.pdf`;
    const content = attachedMaterialFileData?.contentPreview || desc;

    const newMaterial = {
      id: Date.now(),
      title,
      subjectCode,
      subjectName,
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

    const res = await apiRequest('/faculty/materials', 'POST', newMaterial);
    showToast(`Study Material "${title}" with file "${fileName}" posted successfully!`, 'success');
    if (typeof UnreadTracker !== 'undefined') {
      UnreadTracker.notifyNewUpdate('materials');
    }
    removeAttachedFile();
    closeUploadMaterialModal();
    form.reset();
    await loadFacultyMaterials();
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
