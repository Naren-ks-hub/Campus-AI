/**
 * CampusAI - Student Dashboard Controller
 */

let currentProfileAvatarBase64 = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load & apply user profile (from localStorage or AuthState)
  loadUserProfile();

  // 2. Tab switching
  setupTabs();

  // 3. Load dashboard data
  await loadDashboardOverview();
  await loadTimetable();
  await loadAttendance();
  await loadAssignments();
  await loadStudentMaterials();
  await loadEvents();
  await loadClubs();
  await loadAnnouncements();
  await loadComplaints();

  // 4. Setup form submissions
  setupComplaintForm();
  setupAssignmentSubmissionForm();
  setupStudentMaterialFilters();

  // 5. Initialize Unread Notification Tracker
  UnreadTracker.init('STUDENT');
});

/**
 * Loads user profile from localStorage ('campusai_user_profile') or AuthState
 */
function loadUserProfile() {
  const savedProfile = localStorage.getItem('campusai_user_profile');
  let profile = null;
  if (savedProfile) {
    try {
      profile = JSON.parse(savedProfile);
    } catch (e) {
      console.warn('Failed to parse saved profile:', e);
    }
  }

  if (!profile) {
    const authUser = AuthState.getUser();
    profile = {
      fullName: authUser?.fullName || 'Naren KS',
      department: authUser?.department || 'Computer Science & Engineering',
      year: authUser?.year || '3rd Year',
      residenceType: authUser?.residenceType || 'Hostel',
      avatar: authUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      rollNumber: authUser?.rollNumber || 'CS2026-042'
    };
  }

  applyUserProfileToUI(profile);
  return profile;
}

/**
 * Updates all profile visual elements across the dashboard in real time
 */
function applyUserProfileToUI(profile) {
  if (!profile) return;

  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  const avatarEl = document.getElementById('user-avatar');
  const welcomeName = document.getElementById('welcome-student-name');
  const rollEl = document.getElementById('student-roll-dept');
  const topBadge = document.getElementById('student-topbar-badge') || document.querySelector('.topbar-title .badge');

  const deptShort = (profile.department || 'CSE')
    .replace('Computer Science & Engineering', 'CSE')
    .replace('Artificial Intelligence & Data Science', 'AI&DS')
    .replace('Information Technology', 'IT')
    .replace('Electronics & Communication', 'ECE')
    .replace('Electrical & Electronics', 'EEE')
    .replace('Mechanical Engineering', 'MECH')
    .replace('Civil Engineering', 'CIVIL');

  const yearText = profile.year || '3rd Year';
  const residenceText = profile.residenceType || 'Hostel';

  if (nameEl) nameEl.textContent = profile.fullName;
  if (roleEl) roleEl.textContent = `${deptShort} • ${yearText} • ${residenceText}`;
  if (avatarEl && profile.avatar) avatarEl.src = profile.avatar;
  if (welcomeName) welcomeName.textContent = profile.fullName;
  if (topBadge) topBadge.textContent = `${deptShort} • ${yearText} • ${residenceText === 'Hostel' ? 'Hosteler' : 'Day Scholar'}`;
  if (rollEl) {
    rollEl.textContent = `Roll No: ${profile.rollNumber || 'CS2026-042'} | ${profile.department || 'Computer Science & Engineering'} • ${yearText} • ${residenceText === 'Day Scholar' ? '🚌 Day Scholar' : '🏨 Hosteler'}`;
  }

  // Update card preview names if present
  const cardStudentName = document.getElementById('card-student-name');
  if (cardStudentName) cardStudentName.textContent = profile.fullName;
}

/**
 * Opens the Edit Profile Modal populated with active data
 */
window.openEditProfileModal = function() {
  const profile = loadUserProfile();
  
  const nameInput = document.getElementById('edit-profile-name');
  if (nameInput) nameInput.value = profile.fullName || '';

  const deptSelect = document.getElementById('edit-profile-dept');
  if (deptSelect) {
    for (let opt of deptSelect.options) {
      if (opt.value === profile.department || opt.text.includes(profile.department)) {
        opt.selected = true;
        break;
      }
    }
  }

  const yearSelect = document.getElementById('edit-profile-year');
  if (yearSelect) {
    for (let opt of yearSelect.options) {
      if (opt.value === profile.year || opt.value.includes(profile.year)) {
        opt.selected = true;
        break;
      }
    }
  }

  const residenceSelect = document.getElementById('edit-profile-residence');
  if (residenceSelect) {
    residenceSelect.value = (profile.residenceType === 'Dayscholar' || profile.residenceType === 'Day Scholar') ? 'Day Scholar' : 'Hostel';
  }

  const previewAvatar = document.getElementById('edit-profile-avatar-preview');
  if (previewAvatar) {
    previewAvatar.src = profile.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';
    currentProfileAvatarBase64 = profile.avatar;
  }

  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

/**
 * Closes the Edit Profile Modal immediately
 */
window.closeEditProfileModal = function() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

// Global escape key listener to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEditProfileModal();
  }
});

/**
 * Handles profile photo upload via FileReader to base64
 */
window.handleProfilePhotoUpload = function(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    return;
  }

  // Max 5MB check
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size should be less than 5MB.', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    currentProfileAvatarBase64 = e.target.result;
    const previewAvatar = document.getElementById('edit-profile-avatar-preview');
    if (previewAvatar) previewAvatar.src = currentProfileAvatarBase64;
    showToast('Photo loaded! Click Save to apply.', 'info');
  };
  reader.readAsDataURL(file);
};

/**
 * Saves updated profile into localStorage and AuthState and updates UI instantly
 */
window.saveUserProfile = function(event) {
  if (event) event.preventDefault();

  const fullName = (document.getElementById('edit-profile-name')?.value || '').trim();
  const department = document.getElementById('edit-profile-dept')?.value || 'Computer Science & Engineering';
  const year = document.getElementById('edit-profile-year')?.value || '3rd Year';
  const residenceType = document.getElementById('edit-profile-residence')?.value || 'Hostel';

  if (!fullName) {
    showToast('Please enter your full name.', 'error');
    return;
  }

  const existingProfile = loadUserProfile();
  const updatedProfile = {
    ...existingProfile,
    fullName: fullName,
    department: department,
    year: year,
    residenceType: residenceType,
    avatar: currentProfileAvatarBase64 || existingProfile.avatar
  };

  // Persist in localStorage
  localStorage.setItem('campusai_user_profile', JSON.stringify(updatedProfile));

  // Sync with AuthState
  const authUser = AuthState.getUser() || {};
  const updatedUser = {
    ...authUser,
    fullName: updatedProfile.fullName,
    department: updatedProfile.department,
    year: updatedProfile.year,
    residenceType: updatedProfile.residenceType,
    avatar: updatedProfile.avatar
  };
  AuthState.setUser(updatedUser);

  // Sync with Cloud TiDB Backend
  if (typeof apiRequest === 'function') {
    apiRequest('/student/profile', 'PUT', updatedUser).catch(console.warn);
  }

  // Instant real-time UI refresh
  applyUserProfileToUI(updatedProfile);
  closeEditProfileModal();
  showToast('Profile updated successfully!', 'success');
};

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

      // Clear unread blue dot when student navigates to this tab
      if (typeof UnreadTracker !== 'undefined') {
        UnreadTracker.markAsSeen('STUDENT', tabId);
      }

      if (tabId === 'events') {
        loadEvents().catch(console.error);
      } else if (tabId === 'clubs') {
        loadClubs();
      } else if (tabId === 'announcements') {
        loadAnnouncements().catch(console.error);
      } else if (tabId === 'timetable') {
        loadTimetable().catch(console.error);
      } else if (tabId === 'attendance') {
        loadAttendance().catch(console.error);
      } else if (tabId === 'assignments') {
        loadAssignments().catch(console.error);
      } else if (tabId === 'materials') {
        loadStudentMaterials().catch(console.error);
      } else if (tabId === 'complaints') {
        loadComplaints().catch(console.error);
      }
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

// Official Detailed Day-by-Day Schedule for Card View (Using Clean Subject Names)
const DETAILED_DAY_SCHEDULES = {
  MON: [
    {
      periodLabel: 'Periods I - II',
      code: 'AP',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-purple',
      status: 'Live Now',
      statusClass: 'sched-status-live',
      title: 'Aptitude',
      faculty: 'Mr. C. Kavin Prakash [CK]',
      time: '09:15 AM - 10:45 AM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 1 • 10:45 AM - 11:00 AM (15 mins)' }
    },
    {
      periodLabel: 'Periods III - IV',
      code: 'AP',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-pink',
      status: 'Training',
      statusClass: 'sched-status-training',
      title: 'Aptitude',
      faculty: 'Mr. C. Kavin Prakash [CK]',
      time: '11:00 AM - 12:30 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'lunch', text: '🍴 Lunch & Mentoring • 12:30 PM - 01:20 PM (50 mins)' }
    },
    {
      periodLabel: 'Periods V - VI',
      code: 'DL LAB',
      codeColor: 'sched-code-cyan',
      accentColor: 'schedule-card-accent-cyan',
      status: 'Practical',
      statusClass: 'sched-status-practical',
      title: 'Deep Learning Lab',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '01:20 PM - 02:50 PM',
      room: 'AI Research Lab',
      afterBreak: { type: 'tea', text: '☕ Tea Break 2 • 02:50 PM - 03:05 PM (15 mins)' }
    },
    {
      periodLabel: 'Periods VII - VIII',
      code: 'DL LAB',
      codeColor: 'sched-code-cyan',
      accentColor: 'schedule-card-accent-cyan',
      status: 'Practical',
      statusClass: 'sched-status-practical',
      title: 'Deep Learning Lab',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '03:05 PM - 04:30 PM',
      room: 'AI Research Lab'
    }
  ],

  TUE: [
    {
      periodLabel: 'Period I',
      code: 'BA',
      codeColor: 'sched-code-amber',
      accentColor: 'schedule-card-accent-amber',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Business Analytics',
      faculty: 'Mr. M. Ramesh [MR]',
      time: '09:15 AM - 10:00 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period II',
      code: 'DIS',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Data and Information Security',
      faculty: 'Mrs. M. Sivagami [MS]',
      time: '10:00 AM - 10:45 AM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 1 • 10:45 AM - 11:00 AM (15 mins)' }
    },
    {
      periodLabel: 'Period III',
      code: 'CSM',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Cloud Service Management',
      faculty: 'Dr. K. Manivannan [KM]',
      time: '11:00 AM - 11:45 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period IV',
      code: 'DL',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Deep Learning',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '11:45 AM - 12:30 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'lunch', text: '🍴 Lunch & Mentoring • 12:30 PM - 01:20 PM (50 mins)' }
    },
    {
      periodLabel: 'Periods V - VI',
      code: 'WD',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-pink',
      status: 'Training',
      statusClass: 'sched-status-training',
      title: 'Web Development',
      faculty: 'Mr. C. Kavin Prakash [CK]',
      time: '01:20 PM - 02:50 PM',
      room: 'Web Dev Lab',
      afterBreak: { type: 'tea', text: '☕ Tea Break 2 • 02:50 PM - 03:05 PM (15 mins)' }
    },
    {
      periodLabel: 'Periods VII - VIII',
      code: 'WD',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-pink',
      status: 'Training',
      statusClass: 'sched-status-training',
      title: 'Web Development',
      faculty: 'Mr. C. Kavin Prakash [CK]',
      time: '03:05 PM - 04:30 PM',
      room: 'Web Dev Lab'
    }
  ],

  WED: [
    {
      periodLabel: 'Period I',
      code: 'DIS',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Data and Information Security',
      faculty: 'Mrs. M. Sivagami [MS]',
      time: '09:15 AM - 10:00 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period II',
      code: 'DL',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Deep Learning',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '10:00 AM - 10:45 AM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 1 • 10:45 AM - 11:00 AM (15 mins)' }
    },
    {
      periodLabel: 'Periods III - IV',
      code: 'COMM',
      codeColor: 'sched-code-amber',
      accentColor: 'schedule-card-accent-amber',
      status: 'Training',
      statusClass: 'sched-status-training',
      title: 'Communication Training',
      faculty: 'Ms. S. Muthuchelvan [RMN]',
      time: '11:00 AM - 12:30 PM',
      room: 'Language Lab',
      afterBreak: { type: 'lunch', text: '🍴 Lunch & Mentoring • 12:30 PM - 01:20 PM (Dr. R. Murugesan)' }
    },
    {
      periodLabel: 'Period V',
      code: 'CSM',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Cloud Service Management',
      faculty: 'Dr. K. Manivannan [KM]',
      time: '01:20 PM - 02:05 PM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period VI',
      code: 'DC',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Distributed Computing',
      faculty: 'Ms. S. Muthulakshmi [SM]',
      time: '02:05 PM - 02:50 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 2 • 02:50 PM - 03:05 PM (15 mins)' }
    },
    {
      periodLabel: 'Periods VII - VIII',
      code: 'BA LAB',
      codeColor: 'sched-code-cyan',
      accentColor: 'schedule-card-accent-cyan',
      status: 'Practical',
      statusClass: 'sched-status-practical',
      title: 'Business Analytics Lab',
      faculty: 'Mr. M. Ramesh [MR]',
      time: '03:05 PM - 04:30 PM',
      room: 'Analytics Lab'
    }
  ],

  THU: [
    {
      periodLabel: 'Period I',
      code: 'DL',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Deep Learning',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '09:15 AM - 10:00 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period II',
      code: 'DC',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Distributed Computing',
      faculty: 'Ms. S. Muthulakshmi [SM]',
      time: '10:00 AM - 10:45 AM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 1 • 10:45 AM - 11:00 AM (15 mins)' }
    },
    {
      periodLabel: 'Period III',
      code: 'BA',
      codeColor: 'sched-code-amber',
      accentColor: 'schedule-card-accent-amber',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Business Analytics',
      faculty: 'Mr. M. Ramesh [MR]',
      time: '11:00 AM - 11:45 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period IV',
      code: 'BDA',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Big Data Analytics',
      faculty: 'Mr. D. Baskar [DB]',
      time: '11:45 AM - 12:30 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'lunch', text: '🍴 Lunch & Mentoring • 12:30 PM - 01:20 PM (50 mins)' }
    },
    {
      periodLabel: 'Periods V - VI',
      code: 'ADS',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-pink',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Advanced Data Structure and Algorithm',
      faculty: 'Ms. S. Muthulakshmi [SM]',
      time: '01:20 PM - 02:50 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 2 • 02:50 PM - 03:05 PM (15 mins)' }
    },
    {
      periodLabel: 'Period VII',
      code: 'ADS',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Advanced Data Structure and Algorithm',
      faculty: 'Mr. A. Bharathidhasan [AB]',
      time: '03:05 PM - 03:50 PM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period VIII',
      code: 'ADS',
      codeColor: 'sched-code-pink',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Advanced Data Structure and Algorithm',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '03:50 PM - 04:30 PM',
      room: 'MB III A-202'
    }
  ],

  FRI: [
    {
      periodLabel: 'Periods I - II',
      code: 'COMM',
      codeColor: 'sched-code-amber',
      accentColor: 'schedule-card-accent-amber',
      status: 'Training',
      statusClass: 'sched-status-training',
      title: 'Communication Training',
      faculty: 'Mr. D. Baskar [DB]',
      time: '09:15 AM - 10:45 AM',
      room: 'Language Lab',
      afterBreak: { type: 'tea', text: '☕ Tea Break 1 • 10:45 AM - 11:00 AM (15 mins)' }
    },
    {
      periodLabel: 'Period III',
      code: 'DL',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Deep Learning',
      faculty: 'Dr. R. Murugesan [RM]',
      time: '11:00 AM - 11:45 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period IV',
      code: 'DC',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Distributed Computing',
      faculty: 'Ms. S. Muthulakshmi [SM]',
      time: '11:45 AM - 12:30 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'lunch', text: '🍴 Lunch & Mentoring • 12:30 PM - 01:20 PM (50 mins)' }
    },
    {
      periodLabel: 'Periods V - VI',
      code: 'BDA LAB',
      codeColor: 'sched-code-cyan',
      accentColor: 'schedule-card-accent-cyan',
      status: 'Practical',
      statusClass: 'sched-status-practical',
      title: 'Big Data Analytics Lab',
      faculty: 'Mr. D. Baskar [DB]',
      time: '01:20 PM - 02:50 PM',
      room: 'Big Data Lab',
      afterBreak: { type: 'tea', text: '☕ Tea Break 2 • 02:50 PM - 03:05 PM (15 mins)' }
    },
    {
      periodLabel: 'Period VII',
      code: 'BA',
      codeColor: 'sched-code-amber',
      accentColor: 'schedule-card-accent-amber',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Business Analytics',
      faculty: 'Mr. M. Ramesh [MR]',
      time: '03:05 PM - 03:50 PM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period VIII',
      code: 'DIS',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Data and Information Security',
      faculty: 'Mrs. M. Sivagami [MS]',
      time: '03:50 PM - 04:30 PM',
      room: 'MB III A-202'
    }
  ],

  SAT: [
    {
      periodLabel: 'Period I',
      code: 'DIS',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Data and Information Security',
      faculty: 'Mrs. M. Sivagami [MS]',
      time: '09:15 AM - 10:00 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period II',
      code: 'BDA',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Big Data Analytics',
      faculty: 'Mr. D. Baskar [DB]',
      time: '10:00 AM - 10:45 AM',
      room: 'MB III A-202',
      afterBreak: { type: 'tea', text: '☕ Tea Break 1 • 10:45 AM - 11:00 AM (15 mins)' }
    },
    {
      periodLabel: 'Period III',
      code: 'CSM',
      codeColor: 'sched-code-purple',
      accentColor: 'schedule-card-accent-purple',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Cloud Service Management',
      faculty: 'Dr. K. Manivannan [KM]',
      time: '11:00 AM - 11:45 AM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period IV',
      code: 'DC',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Distributed Computing',
      faculty: 'Ms. S. Muthulakshmi [SM]',
      time: '11:45 AM - 12:30 PM',
      room: 'MB III A-202',
      afterBreak: { type: 'lunch', text: '🍴 Lunch & Mentoring • 12:30 PM - 01:20 PM (50 mins)' }
    },
    {
      periodLabel: 'Periods V - VI',
      code: 'CSM LAB',
      codeColor: 'sched-code-cyan',
      accentColor: 'schedule-card-accent-cyan',
      status: 'Practical',
      statusClass: 'sched-status-practical',
      title: 'Cloud Service Management Lab',
      faculty: 'Mr. A. Bharathidhasan [AB]',
      time: '01:20 PM - 02:50 PM',
      room: 'Cloud Computing Lab',
      afterBreak: { type: 'tea', text: '☕ Tea Break 2 • 02:50 PM - 03:05 PM (15 mins)' }
    },
    {
      periodLabel: 'Period VII',
      code: 'BA',
      codeColor: 'sched-code-amber',
      accentColor: 'schedule-card-accent-amber',
      status: 'Lecture',
      statusClass: 'sched-status-lecture',
      title: 'Business Analytics',
      faculty: 'Mr. M. Ramesh [MR]',
      time: '03:05 PM - 03:50 PM',
      room: 'MB III A-202'
    },
    {
      periodLabel: 'Period VIII',
      code: 'BDA',
      codeColor: 'sched-code-blue',
      accentColor: 'schedule-card-accent-blue',
      status: 'Core Course',
      statusClass: 'sched-status-core',
      title: 'Big Data Analytics',
      faculty: 'Mr. D. Baskar [DB]',
      time: '03:50 PM - 04:30 PM',
      room: 'MB III A-202'
    }
  ]
};

let currentSelectedScheduleDay = 'MON';

window.setTimetableView = function(view) {
  const cardsView = document.getElementById('day-schedule-view');
  const matrixView = document.getElementById('matrix-schedule-view');
  const btnCards = document.getElementById('btn-view-cards');
  const btnMatrix = document.getElementById('btn-view-matrix');

  if (view === 'cards') {
    if (cardsView) cardsView.style.display = 'block';
    if (matrixView) matrixView.style.display = 'none';
    if (btnCards) {
      btnCards.className = 'btn btn-sm btn-primary';
      btnCards.style.background = '';
    }
    if (btnMatrix) {
      btnMatrix.className = 'btn btn-sm btn-secondary';
      btnMatrix.style.background = 'transparent';
    }
  } else {
    if (cardsView) cardsView.style.display = 'none';
    if (matrixView) matrixView.style.display = 'block';
    if (btnMatrix) {
      btnMatrix.className = 'btn btn-sm btn-primary';
      btnMatrix.style.background = '';
    }
    if (btnCards) {
      btnCards.className = 'btn btn-sm btn-secondary';
      btnCards.style.background = 'transparent';
    }
  }
};

function renderScheduleDayTabs() {
  const tabsContainer = document.getElementById('schedule-day-tabs');
  if (!tabsContainer) return;

  const daysConfig = [
    { key: 'MON', name: 'MON', num: '05' },
    { key: 'TUE', name: 'TUE', num: '06' },
    { key: 'WED', name: 'WED', num: '07' },
    { key: 'THU', name: 'THU', num: '08' },
    { key: 'FRI', name: 'FRI', num: '09' },
    { key: 'SAT', name: 'SAT', num: '10' }
  ];

  tabsContainer.innerHTML = daysConfig.map(d => `
    <div class="schedule-day-pill ${d.key === currentSelectedScheduleDay ? 'active' : ''}" onclick="selectScheduleDay('${d.key}')">
      <span class="day-name">${d.name}</span>
      <span class="day-num">${d.num}</span>
    </div>
  `).join('');
}

window.selectScheduleDay = function(dayKey) {
  currentSelectedScheduleDay = dayKey;
  renderScheduleDayTabs();
  renderDaySchedule(dayKey);
};

function renderDaySchedule(dayKey) {
  const listContainer = document.getElementById('schedule-cards-list');
  if (!listContainer) return;

  const periods = DETAILED_DAY_SCHEDULES[dayKey] || DETAILED_DAY_SCHEDULES['MON'];

  let html = '';
  periods.forEach(p => {
    html += `
      <div class="schedule-card ${p.accentColor || ''}">
        <div class="schedule-card-top">
          <div class="schedule-card-left-tag">
            <span class="sched-code-pill ${p.codeColor || 'sched-code-pink'}">${p.code}</span>
            <span class="sched-period-text">${p.periodLabel}</span>
          </div>
          <span class="sched-status-pill ${p.statusClass || 'sched-status-core'}">
            ${p.status === 'Live Now' ? '<span class="pulse-dot"></span> ' : ''}${p.status}
          </span>
        </div>
        <h4 class="sched-title">${p.title}</h4>
        <div class="sched-faculty-row">
          <i class="fa-solid fa-user"></i> ${p.faculty}
        </div>
        <div class="sched-footer-row">
          <div class="sched-time-box">
            <i class="fa-regular fa-clock"></i> ${p.time}
          </div>
          <div class="sched-room-badge">
            <i class="fa-solid fa-location-dot"></i> ${p.room}
          </div>
        </div>
      </div>
    `;

    // Interstitial break banner
    if (p.afterBreak) {
      const isLunch = p.afterBreak.type === 'lunch';
      html += `
        <div class="schedule-break-card ${isLunch ? 'schedule-break-lunch' : 'schedule-break-tea'}">
          ${p.afterBreak.text}
        </div>
      `;
    }
  });

  listContainer.innerHTML = html;
}

// Official AIDS Timetable (48 periods: 6 Days x 8 Periods) matching official class schedule exactly
const OFFICIAL_AIDS_TIMETABLE = [
  // MONDAY: AP [CK] (I-IV), DL LAB [RM] (V-VIII)
  { dayOfWeek: 'MONDAY', periodNumber: 1, code: 'AP', facultyCode: '[CK]', name: 'Aptitude', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'MB III A-202', type: 'training' },
  { dayOfWeek: 'MONDAY', periodNumber: 2, code: 'AP', facultyCode: '[CK]', name: 'Aptitude', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'MB III A-202', type: 'training' },
  { dayOfWeek: 'MONDAY', periodNumber: 3, code: 'AP', facultyCode: '[CK]', name: 'Aptitude', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'MB III A-202', type: 'training' },
  { dayOfWeek: 'MONDAY', periodNumber: 4, code: 'AP', facultyCode: '[CK]', name: 'Aptitude', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'MB III A-202', type: 'training' },
  { dayOfWeek: 'MONDAY', periodNumber: 5, code: 'DL LAB', facultyCode: '[RM]', name: 'Deep Learning Lab', faculty: 'Dr. R. Murugesan [RM]', room: 'AI Research Lab', type: 'lab' },
  { dayOfWeek: 'MONDAY', periodNumber: 6, code: 'DL LAB', facultyCode: '[RM]', name: 'Deep Learning Lab', faculty: 'Dr. R. Murugesan [RM]', room: 'AI Research Lab', type: 'lab' },
  { dayOfWeek: 'MONDAY', periodNumber: 7, code: 'DL LAB', facultyCode: '[RM]', name: 'Deep Learning Lab', faculty: 'Dr. R. Murugesan [RM]', room: 'AI Research Lab', type: 'lab' },
  { dayOfWeek: 'MONDAY', periodNumber: 8, code: 'DL LAB', facultyCode: '[RM]', name: 'Deep Learning Lab', faculty: 'Dr. R. Murugesan [RM]', room: 'AI Research Lab', type: 'lab' },

  // TUESDAY: BA [MR], DIS [MS], CSM [KM], DL [RM], WD [CK] (V-VIII)
  { dayOfWeek: 'TUESDAY', periodNumber: 1, code: 'BA', facultyCode: '[MR]', name: 'Business Analytics', faculty: 'Mr. M. Ramesh [MR]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'TUESDAY', periodNumber: 2, code: 'DIS', facultyCode: '[MS]', name: 'Data and Information Security', faculty: 'Mrs. M. Sivagami [MS]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'TUESDAY', periodNumber: 3, code: 'CSM', facultyCode: '[KM]', name: 'Cloud Service Management', faculty: 'Dr. K. Manivannan [KM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'TUESDAY', periodNumber: 4, code: 'DL', facultyCode: '[RM]', name: 'Deep Learning', faculty: 'Dr. R. Murugesan [RM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'TUESDAY', periodNumber: 5, code: 'WD', facultyCode: '[CK]', name: 'Web Development', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'Web Dev Lab', type: 'training' },
  { dayOfWeek: 'TUESDAY', periodNumber: 6, code: 'WD', facultyCode: '[CK]', name: 'Web Development', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'Web Dev Lab', type: 'training' },
  { dayOfWeek: 'TUESDAY', periodNumber: 7, code: 'WD', facultyCode: '[CK]', name: 'Web Development', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'Web Dev Lab', type: 'training' },
  { dayOfWeek: 'TUESDAY', periodNumber: 8, code: 'WD', facultyCode: '[CK]', name: 'Web Development', faculty: 'Mr. C. Kavin Prakash [CK]', room: 'Web Dev Lab', type: 'training' },

  // WEDNESDAY: DIS [MS], DL [RM], COMM [RMN] (III-IV), CSM [KM], DC [SM], BA LAB [MR] (VII-VIII)
  { dayOfWeek: 'WEDNESDAY', periodNumber: 1, code: 'DIS', facultyCode: '[MS]', name: 'Data and Information Security', faculty: 'Mrs. M. Sivagami [MS]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 2, code: 'DL', facultyCode: '[RM]', name: 'Deep Learning', faculty: 'Dr. R. Murugesan [RM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 3, code: 'COMM', facultyCode: '[RMN]', name: 'Communication Training', faculty: 'Ms. S. Muthuchelvan [RMN]', room: 'Language Lab', type: 'training' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 4, code: 'COMM', facultyCode: '[RMN]', name: 'Communication Training', faculty: 'Ms. S. Muthuchelvan [RMN]', room: 'Language Lab', type: 'training' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 5, code: 'CSM', facultyCode: '[KM]', name: 'Cloud Service Management', faculty: 'Dr. K. Manivannan [KM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 6, code: 'DC', facultyCode: '[SM]', name: 'Distributed Computing', faculty: 'Ms. S. Muthulakshmi [SM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 7, code: 'BA LAB', facultyCode: '[MR]', name: 'Business Analytics Lab', faculty: 'Mr. M. Ramesh [MR]', room: 'Analytics Lab', type: 'lab' },
  { dayOfWeek: 'WEDNESDAY', periodNumber: 8, code: 'BA LAB', facultyCode: '[MR]', name: 'Business Analytics Lab', faculty: 'Mr. M. Ramesh [MR]', room: 'Analytics Lab', type: 'lab' },

  // THURSDAY: DL [RM], DC [SM], BA [MR], BDA [DB], ADS [SM] (V-VI), ADS [AB] (VII), ADS [RM] (VIII)
  { dayOfWeek: 'THURSDAY', periodNumber: 1, code: 'DL', facultyCode: '[RM]', name: 'Deep Learning', faculty: 'Dr. R. Murugesan [RM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 2, code: 'DC', facultyCode: '[SM]', name: 'Distributed Computing', faculty: 'Ms. S. Muthulakshmi [SM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 3, code: 'BA', facultyCode: '[MR]', name: 'Business Analytics', faculty: 'Mr. M. Ramesh [MR]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 4, code: 'BDA', facultyCode: '[DB]', name: 'Big Data Analytics', faculty: 'Mr. D. Baskar [DB]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 5, code: 'ADS', facultyCode: '[SM]', name: 'Advanced Data Structure and Algorithm', faculty: 'Ms. S. Muthulakshmi [SM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 6, code: 'ADS', facultyCode: '[SM]', name: 'Advanced Data Structure and Algorithm', faculty: 'Ms. S. Muthulakshmi [SM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 7, code: 'ADS', facultyCode: '[AB]', name: 'Advanced Data Structure and Algorithm', faculty: 'Mr. A. Bharathidhasan [AB]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'THURSDAY', periodNumber: 8, code: 'ADS', facultyCode: '[RM]', name: 'Advanced Data Structure and Algorithm', faculty: 'Dr. R. Murugesan [RM]', room: 'MB III A-202', type: 'lecture' },

  // FRIDAY: COMM [DB] (I-II), DL [RM], DC [SM], BDA LAB [DB] (V-VI), BA [MR], DIS [MS]
  { dayOfWeek: 'FRIDAY', periodNumber: 1, code: 'COMM', facultyCode: '[DB]', name: 'Communication Training', faculty: 'Mr. D. Baskar [DB]', room: 'Language Lab', type: 'training' },
  { dayOfWeek: 'FRIDAY', periodNumber: 2, code: 'COMM', facultyCode: '[DB]', name: 'Communication Training', faculty: 'Mr. D. Baskar [DB]', room: 'Language Lab', type: 'training' },
  { dayOfWeek: 'FRIDAY', periodNumber: 3, code: 'DL', facultyCode: '[RM]', name: 'Deep Learning', faculty: 'Dr. R. Murugesan [RM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'FRIDAY', periodNumber: 4, code: 'DC', facultyCode: '[SM]', name: 'Distributed Computing', faculty: 'Ms. S. Muthulakshmi [SM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'FRIDAY', periodNumber: 5, code: 'BDA LAB', facultyCode: '[DB]', name: 'Big Data Analytics Lab', faculty: 'Mr. D. Baskar [DB]', room: 'Big Data Lab', type: 'lab' },
  { dayOfWeek: 'FRIDAY', periodNumber: 6, code: 'BDA LAB', facultyCode: '[DB]', name: 'Big Data Analytics Lab', faculty: 'Mr. D. Baskar [DB]', room: 'Big Data Lab', type: 'lab' },
  { dayOfWeek: 'FRIDAY', periodNumber: 7, code: 'BA', facultyCode: '[MR]', name: 'Business Analytics', faculty: 'Mr. M. Ramesh [MR]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'FRIDAY', periodNumber: 8, code: 'DIS', facultyCode: '[MS]', name: 'Data and Information Security', faculty: 'Mrs. M. Sivagami [MS]', room: 'MB III A-202', type: 'lecture' },

  // SATURDAY: DIS [MS], BDA [DB], CSM [KM], DC [SM], CSM LAB [AB] (V-VI), BA [MR], BDA [DB]
  { dayOfWeek: 'SATURDAY', periodNumber: 1, code: 'DIS', facultyCode: '[MS]', name: 'Data and Information Security', faculty: 'Mrs. M. Sivagami [MS]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'SATURDAY', periodNumber: 2, code: 'BDA', facultyCode: '[DB]', name: 'Big Data Analytics', faculty: 'Mr. D. Baskar [DB]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'SATURDAY', periodNumber: 3, code: 'CSM', facultyCode: '[KM]', name: 'Cloud Service Management', faculty: 'Dr. K. Manivannan [KM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'SATURDAY', periodNumber: 4, code: 'DC', facultyCode: '[SM]', name: 'Distributed Computing', faculty: 'Ms. S. Muthulakshmi [SM]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'SATURDAY', periodNumber: 5, code: 'CSM LAB', facultyCode: '[AB]', name: 'Cloud Service Management Lab', faculty: 'Mr. A. Bharathidhasan [AB]', room: 'Cloud Computing Lab', type: 'lab' },
  { dayOfWeek: 'SATURDAY', periodNumber: 6, code: 'CSM LAB', facultyCode: '[AB]', name: 'Cloud Service Management Lab', faculty: 'Mr. A. Bharathidhasan [AB]', room: 'Cloud Computing Lab', type: 'lab' },
  { dayOfWeek: 'SATURDAY', periodNumber: 7, code: 'BA', facultyCode: '[MR]', name: 'Business Analytics', faculty: 'Mr. M. Ramesh [MR]', room: 'MB III A-202', type: 'lecture' },
  { dayOfWeek: 'SATURDAY', periodNumber: 8, code: 'BDA', facultyCode: '[DB]', name: 'Big Data Analytics', faculty: 'Mr. D. Baskar [DB]', room: 'MB III A-202', type: 'lecture' }
];

async function loadTimetable() {
  const schedule = OFFICIAL_AIDS_TIMETABLE;
  const container = document.getElementById('timetable-container');
  if (!container || !schedule) return;

  const periodsHeader = [
    { num: 'I', time: '09.15 - 10.00' },
    { num: 'II', time: '10.00 - 10.45' },
    { num: 'III', time: '11.00 - 11.45' },
    { num: 'IV', time: '11.45 - 12.30' },
    { num: 'V', time: '01.20 - 02.05' },
    { num: 'VI', time: '02.05 - 02.50' },
    { num: 'VII', time: '03.05 - 03.50' },
    { num: 'VIII', time: '03.50 - 04.30' }
  ];

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  let html = `<div class="tt-header" style="background:rgba(99,102,241,0.15);"><strong>Day / Period</strong><div class="tt-time">Academic Schedule</div></div>`;
  
  periodsHeader.forEach(p => {
    html += `
      <div class="tt-header">
        <strong>Period ${p.num}</strong>
        <div class="tt-time">${p.time}</div>
      </div>
    `;
  });

  days.forEach(day => {
    const dayName = day.charAt(0) + day.slice(1).toLowerCase();
    html += `<div class="tt-day"><i class="fa-regular fa-calendar-check" style="margin-right:6px; color:var(--primary-light);"></i>${dayName.substring(0, 3)}</div>`;
    const dayClasses = schedule.filter(s => s.dayOfWeek === day);

    for (let p = 1; p <= 8; p++) {
      const cell = dayClasses.find(s => s.periodNumber === p);
      if (cell) {
        const cellClass = cell.type === 'lab' ? 'lab-cell' : (cell.type === 'training' ? 'training-cell' : '');
        html += `
          <div class="tt-cell ${cellClass}" title="${cell.name} • ${cell.faculty} • ${cell.room}">
            <div class="tt-simple-code">${cell.code}</div>
            <div class="tt-simple-faculty">${cell.facultyCode || cell.faculty}</div>
          </div>
        `;
      } else {
        html += `<div class="tt-cell" style="opacity:0.35; display:flex; align-items:center; justify-content:center;"><span style="font-size:0.75rem; color:var(--text-muted);">-</span></div>`;
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
    <div class="glass-card announcement-card interactive" onclick="openAnnouncementModal(${n.id})" title="Click to view detailed official circular">
      <div>
        <div class="card-top">
          <span class="badge ${n.priority === 'URGENT' ? 'badge-danger' : (n.priority === 'HIGH' ? 'badge-warning' : 'badge-primary')}">
            ${n.priority === 'URGENT' ? '🚨 URGENT' : (n.priority === 'HIGH' ? '⭐ HIGH' : '📌 NOTICE')}
          </span>
          <span style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${new Date(n.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
        <h3 style="font-size:1.12rem; margin-bottom:8px; line-height:1.35;">${n.title}</h3>
        <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.6;">${n.content}</p>
      </div>
      <div class="read-more-pill">
        <span>Read Full Circular &amp; Action Items</span> <i class="fa-solid fa-arrow-right"></i>
      </div>
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

// ==========================================
// Interactive Announcement Detail Modal
// ==========================================
const announcementDetails = {
  1: {
    title: "Autonomous COE End-Semester Examinations Schedule Released",
    priority: "URGENT",
    date: "28 Sep 2026",
    issuer: "Controller of Examinations (COE)",
    ref: "VSBEC/COE/2026/OCT-089",
    content: "The Controller of Examinations has officially released the End-Semester Examination timetable for all **3rd, 5th, and 7th Semester B.E. / B.Tech (Autonomous)** regular and arrear candidates.\n\n• **Commencement Date**: October 28th, 2026\n• **Exam Sessions**: Morning (09:30 AM - 12:30 PM) | Afternoon (01:30 PM - 04:30 PM)\n• **Hall Tickets**: Available for direct download via the student portal from October 15th onwards.\n• **Arrear Examinations**: Timetable published concurrently under the student examination tab.",
    extra: "⚠️ <strong>Mandatory Exam Regulations</strong>: Candidates must bring their original physical College ID Card and verified Hall Ticket. Possession of smart watches, programmable calculators, or mobile phones inside examination halls is strictly prohibited.",
    actionText: "Download Full Examination Schedule PDF",
    actionMsg: "📄 Downloading VSBEC End-Semester Exam Timetable 2026 PDF..."
  },
  2: {
    title: "Campus Placement Drive 2026: Tier-1 IT & Product Companies",
    priority: "HIGH",
    date: "27 Sep 2026",
    issuer: "Career Development Center (CDC)",
    ref: "VSBEC/CDC/2026/PL-044",
    content: "The Career Development Center (CDC) announces upcoming on-campus recruitment registrations for tier-1 IT & core product software companies.\n\n• **Participating Recruiters**: Autodesk (47 LPA), Zoho (12 LPA), TCS Digital/Ninja (3.8 - 9.2 LPA), Infosys (9.5 LPA), Hexaware, Virtusa.\n• **Eligibility**: B.E / B.Tech (All Branches) with CGPA ≥ 6.5 & No Standing Arrears.\n• **Selection Rounds**: Online Coding Assessment & Aptitude &rarr; Technical Interview 1 &rarr; Techno-Managerial &rarr; HR Round.\n• **Mandatory Prep**: 3-day intensive mock assessment starts this Monday in Lab Block B.",
    extra: "⭐ <strong>Placement Cell Tip</strong>: Keep your resume updated in standard single-page format and ensure GitHub / LeetCode profile links are active in your CDC profile.",
    actionText: "Register on CDC Placement Portal",
    actionMsg: "💼 Redirecting to VSB CDC Placement Registration Portal..."
  },
  3: {
    title: "AICTE - IDEA Lab Hands-On Workshop on Generative AI & IoT",
    priority: "NORMAL",
    date: "26 Sep 2026",
    issuer: "Department of CSE & AI&DS",
    ref: "VSBEC/CSE/2026/WS-012",
    content: "Department of Computer Science and AI&DS is organizing a 3-day national hands-on workshop on **Edge AI, Jetson Nano Architectures, and Large Language Model Fine-Tuning** at the VSB AICTE IDEA Lab (Block C, 2nd Floor).\n\n• **Session 1**: Edge Computing with NVIDIA Jetson Nano & OpenCV\n• **Session 2**: Quantization and local deployment of LLMs (Llama 3 & Mistral)\n• **Session 3**: Capstone IoT Sensor Integration & Live Cloud Dashboarding\n• **Certificates**: AICTE IDEA Lab authorized participation certificates for all attendees.",
    extra: "💡 <strong>Hardware Kit Access</strong>: All registered participants will receive individual access to hardware kits, edge microcontrollers, and high-compute GPU clusters during the lab sessions.",
    actionText: "Register for AICTE IDEA Lab Workshop",
    actionMsg: "🎉 Registered successfully for AICTE IDEA Lab Hands-On Workshop!"
  },
  4: {
    title: "College Bus Transport & Route Timings - Karur, Trichy, Dindigul & Erode",
    priority: "NORMAL",
    date: "25 Sep 2026",
    issuer: "Transport Department",
    ref: "VSBEC/TR/2026/BUS-050",
    content: "Updated morning pick-up and evening drop schedules for all **50 college bus routes** (covering Karur, Trichy, Dindigul, Erode, Namakkal, and Paramathi Velur) have been released.\n\n• **Morning Pickup**: All route buses start at terminal points by 07:15 AM to arrive on campus by 08:35 AM.\n• **Evening Departure**: All college buses depart from the main campus bus bay at 04:45 PM sharp.\n• **Emergency Transport Contacts**: Transport Officer: +91 98424 56789 | Control Room: 04324-290123.",
    extra: "🚌 <strong>RFID Bus Pass Compliance</strong>: Students must scan/display their valid smart bus pass while boarding. Pass renewals can be done at the administrative accounts section.",
    actionText: "Download 50 Bus Routes Timetable PDF",
    actionMsg: "🚍 Downloading Complete VSB Bus Route Schedule PDF..."
  }
};

let currentAnnounceAction = null;

function formatText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

window.openAnnouncementModal = function(id) {
  const data = announcementDetails[id] || {
    title: "Official Campus Bulletin",
    priority: "NORMAL",
    date: new Date().toLocaleDateString(),
    issuer: "VSB Administration",
    ref: "VSB/CIR/2026",
    content: "Please check with your department coordinator or HOD for full circular details.",
    extra: "Notice for all enrolled students.",
    actionText: "Open Attached Document",
    actionMsg: "Opening document..."
  };

  const titleEl = document.getElementById('modal-announce-title');
  const dateEl = document.getElementById('modal-announce-date');
  const issuerEl = document.getElementById('modal-announce-issuer');
  const refEl = document.getElementById('modal-announce-ref');
  const contentEl = document.getElementById('modal-announce-content');
  const extraEl = document.getElementById('modal-announce-extra');
  const prioEl = document.getElementById('modal-announce-priority');
  const actionBtn = document.getElementById('modal-announce-action-btn');

  if (titleEl) titleEl.textContent = data.title;
  if (dateEl) dateEl.textContent = data.date;
  if (issuerEl) issuerEl.textContent = data.issuer;
  if (refEl) refEl.textContent = data.ref;
  if (contentEl) contentEl.innerHTML = formatText(data.content);
  if (extraEl) extraEl.innerHTML = data.extra;
  
  if (prioEl) {
    prioEl.className = 'badge ' + (data.priority === 'URGENT' ? 'badge-danger' : (data.priority === 'HIGH' ? 'badge-warning' : 'badge-primary'));
    prioEl.textContent = data.priority === 'URGENT' ? '🚨 URGENT' : (data.priority === 'HIGH' ? '⭐ HIGH' : '📌 OFFICIAL NOTICE');
  }

  if (actionBtn) {
    actionBtn.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> ${data.actionText}`;
  }
  currentAnnounceAction = data.actionMsg;

  const modal = document.getElementById('announcement-detail-modal');
  if (modal) modal.classList.add('active');
};

window.closeAnnouncementModal = function() {
  const modal = document.getElementById('announcement-detail-modal');
  if (modal) modal.classList.remove('active');
};

window.takeAnnouncementAction = function() {
  if (currentAnnounceAction) {
    showToast(currentAnnounceAction, 'success');
  }
  closeAnnouncementModal();
};

/* ==========================================================================
   STUDENT CLUBS & SOCIETIES MODULE
   ========================================================================== */

const CAMPUS_CLUBS = [
  {
    id: "electronics",
    name: "Electronics Club",
    category: "TECHNICAL",
    categoryName: "Technical Society",
    icon: "fa-microchip",
    color: "#6366f1",
    tagline: "Designing Next-Gen Embedded Circuits & IoT Innovations",
    description: "The Electronics Club is a student-driven technical society focused on PCB design, embedded systems, IoT devices, microcontrollers (STM32, Arduino, ESP32), and analog/digital VLSI design. Members gain hands-on access to lab equipment, oscilloscopes, soldering stations, and rapid prototyping tools.",
    timing: "Every Wednesday, 4:30 PM – 6:00 PM",
    venue: "IoT & Embedded Systems Lab (Block C, 2nd Floor)",
    facultyAdvisor: "Dr. V. Rajesh Kumar (Asso. Prof, ECE)",
    studentLead: "Arun Varma (IV Year ECE)",
    membersCount: 148,
    tags: ["IoT", "PCB Design", "VLSI", "Arduino", "ESP32", "Embedded Systems"],
    activities: [
      "Annual Circuit Design Challenge (Electra 2026)",
      "Hands-on SMD Soldering & PCB Prototyping Workshop",
      "Edge AI Microcontroller Hackathon",
      "Industrial Visit to Texas Instruments Design Center"
    ]
  },
  {
    id: "electrical",
    name: "Electrical Club",
    category: "TECHNICAL",
    categoryName: "Technical Society",
    icon: "fa-bolt",
    color: "#f59e0b",
    tagline: "Powering Tomorrow with Smart Grids, EV & Green Energy",
    description: "The Electrical Club empowers engineering students to explore power electronics, renewable energy systems, electric vehicle (EV) powertrains, PLC/SCADA industrial automation, and smart electrical grid simulations through industry-aligned projects.",
    timing: "Every Tuesday, 4:30 PM – 6:00 PM",
    venue: "Power Electronics & Drives Lab (Block B, 1st Floor)",
    facultyAdvisor: "Dr. S. Meganathan (HOD, EEE)",
    studentLead: "Praveen Kumar (IV Year EEE)",
    membersCount: 124,
    tags: ["Electric Vehicles", "Solar PV", "Smart Grid", "Power Electronics", "MATLAB", "PLC/SCADA"],
    activities: [
      "Solar EV Go-Kart Prototype Build",
      "MATLAB Power System Simulation Bootcamp",
      "Energy Audit & Green Campus Initiative",
      "High Voltage Safety & Switchgear Practical Training"
    ]
  },
  {
    id: "coding",
    name: "Coding Club",
    category: "TECHNICAL",
    categoryName: "Technical Society",
    icon: "fa-code",
    color: "#10b981",
    tagline: "Crafting Code, Algorithms & Open Source Solutions",
    description: "The Coding Club is the campus hub for competitive programming, full-stack web development, machine learning algorithms, open-source software contributions, and collaborative hackathon teams. We host weekly coding sprints on LeetCode, Codeforces, and GitHub.",
    timing: "Every Thursday, 5:00 PM – 6:45 PM",
    venue: "Advanced Computing Lab 4 (Block A, 3rd Floor)",
    facultyAdvisor: "Prof. K. Sundaramoorthy (CSE)",
    studentLead: "Alex Morgan (III Year CSE)",
    membersCount: 310,
    tags: ["Data Structures", "Algorithms", "React", "Python", "Competitive Programming", "Git"],
    activities: [
      "CodeWars 24-Hour Inter-College Hackathon",
      "Weekly LeetCode & DSA Mastery Sprints",
      "Open Source Hacktoberfest Sprint",
      "Masterclasses on Cloud Deployments (AWS/Docker)"
    ]
  },
  {
    id: "literature",
    name: "Literature Club",
    category: "LITERARY",
    categoryName: "Literary & Debate",
    icon: "fa-book-open",
    color: "#8b5cf6",
    tagline: "Where Words Ignite Minds, Debates & Creative Expression",
    description: "The Literature Club fosters deep intellectual dialogue, creative prose, poetry writing, parliamentary debating, book discussions, and public speaking. It hosts both English and vernacular literary activities designed to hone eloquence and critical thinking.",
    timing: "Every Monday, 4:30 PM – 5:45 PM",
    venue: "Central Library Seminar Hall (Block D)",
    facultyAdvisor: "Dr. Ananya Sharma (Dept of English & Humanities)",
    studentLead: "Divya Bharathi (III Year IT)",
    membersCount: 95,
    tags: ["Debating", "Creative Writing", "Poetry Slam", "Book Reviews", "Public Speaking", "MUN"],
    activities: [
      "Annual Model United Nations (VSB-MUN 2026)",
      "Bilingual Slam Poetry & Storytelling Night",
      "Inter-Department Parliamentary Debate Championship",
      "Monthly Book Critics Circle & Author Meets"
    ]
  },
  {
    id: "photography",
    name: "Photography Club",
    category: "CREATIVE",
    categoryName: "Creative & Visual Arts",
    icon: "fa-camera-retro",
    color: "#ec4899",
    tagline: "Freezing Moments, Framing Perspectives & Visual Stories",
    description: "The Photography Club unites visual storytellers, DSLR enthusiasts, mobile photography creators, and digital post-processing editors. Members capture all campus festivals, run photo walks, master portraiture and lighting, and produce festival aftermovies.",
    timing: "Every Friday, 4:30 PM – 6:00 PM",
    venue: "Media & Visual Design Studio (Admin Block 2nd Floor)",
    facultyAdvisor: "Prof. R. Karthikeyan (Mechanical / Media Cell)",
    studentLead: "Sanjay Balaji (IV Year Mech)",
    membersCount: 118,
    tags: ["DSLR Photography", "Photo Editing", "Cinematography", "Lightroom", "Visual Arts", "Drones"],
    activities: [
      "'Campus Through the Lens' Photo Exhibition",
      "Adobe Lightroom & Photoshop Post-Processing Workshops",
      "Golden Hour Nature & Macro Photography Walks",
      "Official Campus Fest Media Coverage Crew"
    ]
  },
  {
    id: "eco",
    name: "Eco Club",
    category: "SOCIAL",
    categoryName: "Environment & Social Impact",
    icon: "fa-leaf",
    color: "#14b8a6",
    tagline: "Championing Sustainability, Biodiversity & Green Living",
    description: "The Eco Club leads environmental action, organic campus farming, e-waste recycling drives, plastic-free campaigns, and tree-plantation missions to cultivate an eco-conscious student generation and reduce carbon footprints.",
    timing: "Every Saturday, 9:30 AM – 11:00 AM",
    venue: "Botanical Garden & Green House Complex",
    facultyAdvisor: "Dr. P. Manoharan (Dept of Chemistry & Environmental Sci)",
    studentLead: "Kavitha Selvam (III Year BioTech)",
    membersCount: 135,
    tags: ["Sustainability", "Tree Plantation", "Waste Management", "Solar Power", "Organic Farming", "E-Waste"],
    activities: [
      "Mega 1000-Sapling Campus Green Canopy Drive",
      "Campus E-Waste & Plastic Segregation Drive",
      "World Environment Day Cleanliness Drive",
      "Workshops on Composting and Urban Terrace Farming"
    ]
  },
  {
    id: "robotics",
    name: "Robotics Club",
    category: "TECHNICAL",
    categoryName: "Technical Society",
    icon: "fa-robot",
    color: "#3b82f6",
    tagline: "Engineering Autonomous Bots, Drones & Robotic Systems",
    description: "The Robotics Club brings together mechanical, electrical, and computer science engineers to build autonomous line followers, combat robo-wars fighters, quadcopters, ROS-based navigation bots, and industrial robotic arms.",
    timing: "Every Thursday, 4:30 PM – 6:30 PM",
    venue: "Robotics & AICTE IDEA Lab (Block C, Ground Floor)",
    facultyAdvisor: "Dr. N. Saravanan (Mechanical & Mechatronics)",
    studentLead: "Rohan Nair (IV Year Mechatronics)",
    membersCount: 175,
    tags: ["RoboWars", "ROS", "Drone Tech", "3D Printing", "Autonomous Navigation", "Sensors"],
    activities: [
      "National Robowars Championship (RoboKombat)",
      "Autonomous Maze Solver & Line Follower Contest",
      "Quadcopter Flight Dynamics & PID Tuning Bootcamp",
      "3D CAD Modeling & Rapid 3D Printing Sessions"
    ]
  },
  {
    id: "finearts",
    name: "Fine Arts Club",
    category: "CREATIVE",
    categoryName: "Creative & Fine Arts",
    icon: "fa-palette",
    color: "#f43f5e",
    tagline: "Unleashing Imagination Through Canvas, Sculptures & Design",
    description: "The Fine Arts Club is a creative sanctuary for painters, sketch artists, digital illustrators, sculptors, and calligraphers. The club is responsible for campus art murals, stage decor for festivals, and gallery exhibitions.",
    timing: "Every Wednesday, 4:00 PM – 5:30 PM",
    venue: "Art & Creativity Studio (Auditorium Wing)",
    facultyAdvisor: "Prof. S. Gomathi (Civil / Architecture)",
    studentLead: "Sneha Ramakrishnan (III Year AI&DS)",
    membersCount: 102,
    tags: ["Oil Painting", "Digital Art", "Calligraphy", "Sculpture", "Mural Painting", "Sketching"],
    activities: [
      "Annual 'Chitrakala' State-Level Painting Competition",
      "Live Campus Wall Mural Painting Festival",
      "Charcoal & Watercolor Portrait Workshop",
      "Digital Art with Procreate & Graphic Tablets Bootcamp"
    ]
  },
  {
    id: "puzzle",
    name: "Puzzle Club",
    category: "LITERARY",
    categoryName: "Logic & Mind Sports",
    icon: "fa-puzzle-piece",
    color: "#06b6d4",
    tagline: "Decoding Mysteries, Sudoku, Chess & Logical Conundrums",
    description: "The Puzzle Club is dedicated to sharpening cognitive power, lateral thinking, chess strategy, Sudoku solving, cryptography ciphers, escape-room puzzles, and mathematical riddles for analytical minds.",
    timing: "Every Tuesday, 4:30 PM – 5:45 PM",
    venue: "Math & Logic Lab (Block A, 2nd Floor)",
    facultyAdvisor: "Dr. T. Venkataraman (Dept of Mathematics)",
    studentLead: "Harish Venkat (II Year CSE)",
    membersCount: 88,
    tags: ["Chess", "Rubik's Cube", "Cryptography", "Sudoku", "Brain Teasers", "Escape Room"],
    activities: [
      "Annual Inter-College Blitz Chess & Blitz Sudoku Open",
      "Speedcubing 3x3 Rubik's Cube Championship",
      "Cryptic Treasure Hunt & Campus Escape Room",
      "Mathematical Riddles & Logical Aptitude Showdown"
    ]
  },
  {
    id: "cultural",
    name: "Cultural Club",
    category: "CREATIVE",
    categoryName: "Music, Dance & Drama",
    icon: "fa-masks-theater",
    color: "#d946ef",
    tagline: "Celebrating Music, Dance, Theater & Vibrant Heritage",
    description: "The Cultural Club is the heartbeat of college life, organizing Western & classical dance troupes, music bands, street plays (Nukkad Natak), drama productions, and the grand annual inter-college cultural fest.",
    timing: "Every Friday & Saturday, 4:30 PM – 6:30 PM",
    venue: "Main Open-Air Amphitheatre & Music Studio",
    facultyAdvisor: "Dr. K. Jayalakshmi (Dept of Management / Cultural Head)",
    studentLead: "Vikramaditya Rao (IV Year CSE)",
    membersCount: 285,
    tags: ["Classical Dance", "Western Music Band", "Dramatics", "Street Play", "Singing", "Festivals"],
    activities: [
      "Dhruva Mega Annual Cultural Festival",
      "Battle of the Campus Rock Bands",
      "Street Play / Nukkad Natak for Social Awareness",
      "Classical Fusion Carnatic & Western Ensemble Concert"
    ]
  }
];

let activeClubFilter = 'ALL';
let activeClubSearch = '';
let activeModalClubId = null;

function getJoinedClubs() {
  try {
    const raw = localStorage.getItem('campusai_joined_clubs');
    if (!raw) {
      // Default initial memberships for student
      const initial = ['coding', 'robotics'];
      localStorage.setItem('campusai_joined_clubs', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return ['coding', 'robotics'];
  }
}

function saveJoinedClubs(list) {
  localStorage.setItem('campusai_joined_clubs', JSON.stringify(list));
}

async function loadClubs() {
  const container = document.getElementById('student-clubs-grid');
  if (!container) return;

  const joinedList = getJoinedClubs();

  // Update badge & counts
  const badgeEl = document.getElementById('my-joined-clubs-badge');
  if (badgeEl) {
    badgeEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${joinedList.length} Clubs Enrolled`;
  }
  const myClubsCountEl = document.getElementById('my-clubs-count');
  if (myClubsCountEl) {
    myClubsCountEl.textContent = joinedList.length;
  }

  // Filter dataset
  const filtered = CAMPUS_CLUBS.filter(club => {
    let matchesCategory = false;
    if (activeClubFilter === 'ALL') {
      matchesCategory = true;
    } else if (activeClubFilter === 'JOINED') {
      matchesCategory = joinedList.includes(club.id);
    } else {
      matchesCategory = club.category === activeClubFilter;
    }

    const q = activeClubSearch.trim().toLowerCase();
    if (!q) return matchesCategory;
    const matchesSearch = 
      club.name.toLowerCase().includes(q) ||
      club.tagline.toLowerCase().includes(q) ||
      club.description.toLowerCase().includes(q) ||
      club.studentLead.toLowerCase().includes(q) ||
      club.facultyAdvisor.toLowerCase().includes(q) ||
      club.tags.some(t => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--border-glass);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h4 style="margin-bottom: 6px;">No clubs found</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your filter or search keywords.</p>
        <button class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="filterClubCategory('ALL')">View All Clubs (10)</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(club => {
    const isJoined = joinedList.includes(club.id);
    const categoryBadgeClass = 
      club.category === 'TECHNICAL' ? 'badge-primary' :
      club.category === 'CREATIVE' ? 'badge-danger' :
      club.category === 'LITERARY' ? 'badge-warning' : 'badge-success';

    return `
      <div class="glass-card club-card" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${club.color}; ${isJoined ? 'border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.08);' : ''} position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <div>
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <div style="width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; background: ${club.color}22; color: ${club.color};">
                <i class="fa-solid ${club.icon}"></i>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700;">${club.name}</h3>
                <span class="badge ${categoryBadgeClass}" style="font-size: 0.72rem; padding: 2px 8px; margin-top: 4px;">${club.categoryName}</span>
              </div>
            </div>
            ${isJoined ? `<span class="badge badge-success" style="font-size: 0.72rem; padding: 4px 8px;"><i class="fa-solid fa-circle-check"></i> Enrolled</span>` : ''}
          </div>

          <!-- Tagline & Description -->
          <p style="font-size: 0.88rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">${club.tagline}</p>
          <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${club.description}
          </p>
        </div>

        <!-- Card Footer Actions -->
        <div style="display: flex; gap: 8px; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 14px; flex-wrap: wrap;">
          ${isJoined ? `
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="openClubDetailModal('${club.id}')">
              <i class="fa-solid fa-circle-info"></i> Info
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1.3; background: linear-gradient(135deg, #10b981, #059669); border:none;" onclick="openClubPassModal('${club.id}')">
              <i class="fa-solid fa-id-card"></i> Member Pass
            </button>
            <button class="btn btn-icon btn-secondary btn-sm" style="color: var(--danger);" title="Leave Club" onclick="toggleJoinClub('${club.id}')">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="openClubDetailModal('${club.id}')">
              <i class="fa-solid fa-circle-info"></i> View Details
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1.2;" onclick="openClubJoinModal('${club.id}')">
              <i class="fa-solid fa-user-plus"></i> Join Club
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

window.filterClubCategory = function(cat) {
  activeClubFilter = cat;
  document.querySelectorAll('.club-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === cat) {
      btn.classList.add('btn-primary', 'active');
      btn.classList.remove('btn-secondary');
    } else {
      btn.classList.remove('btn-primary', 'active');
      btn.classList.add('btn-secondary');
    }
  });
  loadClubs();
};

window.searchClubs = function(query) {
  activeClubSearch = query;
  loadClubs();
};

window.openClubDetailModal = function(clubId) {
  const club = CAMPUS_CLUBS.find(c => c.id === clubId);
  if (!club) return;

  activeModalClubId = clubId;
  const joinedList = getJoinedClubs();
  const isJoined = joinedList.includes(clubId);

  const nameEl = document.getElementById('modal-club-name');
  const taglineEl = document.getElementById('modal-club-tagline');
  const catEl = document.getElementById('modal-club-category');
  const descEl = document.getElementById('modal-club-desc');
  const timingEl = document.getElementById('modal-club-timing');
  const venueEl = document.getElementById('modal-club-venue');
  const facultyEl = document.getElementById('modal-club-faculty');
  const leadEl = document.getElementById('modal-club-lead');
  const activitiesEl = document.getElementById('modal-club-activities');
  const tagsEl = document.getElementById('modal-club-tags');
  const iconWrapEl = document.getElementById('modal-club-icon-wrap');
  const iconEl = document.getElementById('modal-club-icon');
  const statusBadge = document.getElementById('modal-club-status-badge');
  const joinBtn = document.getElementById('modal-club-join-btn');

  if (nameEl) nameEl.textContent = club.name;
  if (taglineEl) taglineEl.textContent = club.tagline;
  if (catEl) {
    catEl.textContent = club.categoryName;
    catEl.className = 'badge ' + (
      club.category === 'TECHNICAL' ? 'badge-primary' :
      club.category === 'CREATIVE' ? 'badge-danger' :
      club.category === 'LITERARY' ? 'badge-warning' : 'badge-success'
    );
  }
  if (descEl) descEl.textContent = club.description;
  if (timingEl) timingEl.textContent = club.timing;
  if (venueEl) venueEl.textContent = club.venue;
  if (facultyEl) facultyEl.textContent = club.facultyAdvisor;
  if (leadEl) leadEl.textContent = club.studentLead;
  
  if (iconWrapEl) {
    iconWrapEl.style.background = `${club.color}22`;
    iconWrapEl.style.color = club.color;
  }
  if (iconEl) {
    iconEl.className = `fa-solid ${club.icon}`;
  }

  if (statusBadge) {
    statusBadge.style.display = isJoined ? 'inline-flex' : 'none';
  }

  if (joinBtn) {
    if (isJoined) {
      joinBtn.className = 'btn btn-secondary';
      joinBtn.innerHTML = `<i class="fa-solid fa-id-card" style="color:var(--success);"></i> View Digital Member Pass`;
      joinBtn.onclick = () => {
        closeClubDetailModal();
        openClubPassModal(clubId);
      };
    } else {
      joinBtn.className = 'btn btn-primary';
      joinBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Join Club`;
      joinBtn.onclick = () => {
        closeClubDetailModal();
        openClubJoinModal(clubId);
      };
    }
  }

  if (activitiesEl) {
    activitiesEl.innerHTML = club.activities.map(act => `
      <li style="margin-bottom: 6px;"><strong style="color:var(--text-main);">${act}</strong></li>
    `).join('');
  }

  if (tagsEl) {
    tagsEl.innerHTML = club.tags.map(tag => `
      <span class="badge" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-glass); color: var(--text-muted); font-size: 0.8rem; padding: 4px 10px;">#${tag}</span>
    `).join('');
  }

  const modal = document.getElementById('club-detail-modal');
  if (modal) modal.classList.add('active');
};

window.closeClubDetailModal = function() {
  const modal = document.getElementById('club-detail-modal');
  if (modal) modal.classList.remove('active');
  activeModalClubId = null;
};

window.selectClubRole = function(btn, roleName) {
  document.querySelectorAll('.club-role-pill').forEach(p => {
    p.classList.remove('active');
    p.style.background = 'rgba(255,255,255,0.03)';
    p.style.borderColor = 'var(--border-glass)';
    p.style.color = 'var(--text-muted)';
  });

  btn.classList.add('active');
  btn.style.background = 'rgba(99,102,241,0.2)';
  btn.style.borderColor = 'var(--primary)';
  btn.style.color = 'var(--primary-light)';

  const hiddenInput = document.getElementById('join-selected-role');
  if (hiddenInput) hiddenInput.value = roleName;
};

window.openClubJoinModal = function(clubId) {
  const club = CAMPUS_CLUBS.find(c => c.id === clubId);
  if (!club) return;

  activeModalClubId = clubId;
  const user = AuthState.getUser() || {};

  // Show form, hide success
  const formWrapper = document.getElementById('club-join-form-wrapper');
  const successWrapper = document.getElementById('club-join-success-wrapper');
  if (formWrapper) formWrapper.style.display = 'block';
  if (successWrapper) successWrapper.style.display = 'none';

  const clubIdInput = document.getElementById('join-club-id');
  const clubNameEl = document.getElementById('join-modal-club-name');
  const clubIconWrap = document.getElementById('join-modal-club-icon-wrap');
  const clubIconEl = document.getElementById('join-modal-club-icon');

  if (clubIdInput) clubIdInput.value = clubId;
  if (clubNameEl) clubNameEl.textContent = `Join ${club.name}`;
  if (clubIconWrap) {
    clubIconWrap.style.background = `${club.color}22`;
    clubIconWrap.style.color = club.color;
  }
  if (clubIconEl) clubIconEl.className = `fa-solid ${club.icon}`;

  // Extract accurate logged in student info
  const headerName = document.getElementById('user-name')?.textContent?.trim();
  const welcomeName = document.getElementById('welcome-student-name')?.textContent?.trim();
  
  let fullName = user.fullName || user.name || (headerName && headerName !== 'Alex Morgan' ? headerName : '') || (welcomeName && welcomeName !== 'Alex' ? welcomeName : 'Naren K S');
  let rollNumber = user.rollNumber || user.rollNo || 'AD2024-088';
  let dept = user.department || 'Artificial Intelligence & Data Science';
  let yearText = user.year || (user.semester ? `Year ${Math.ceil(user.semester / 2)}` : '3rd Year');
  let deptYear = `${dept}, ${yearText}`;
  let section = user.section || user.batch || (user.residenceType ? `${user.residenceType} Batch` : 'Section A');
  let email = user.email || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@campusai.edu`;
  let phone = user.phone || '+91 98424 56789';

  const fullNameEl = document.getElementById('join-full-name');
  const rollNoEl = document.getElementById('join-roll-no');
  const deptYearEl = document.getElementById('join-dept-year');
  const sectionEl = document.getElementById('join-section');
  const emailEl = document.getElementById('join-email');
  const phoneEl = document.getElementById('join-phone');

  if (fullNameEl) fullNameEl.value = fullName;
  if (rollNoEl) rollNoEl.value = rollNumber;
  if (deptYearEl) deptYearEl.value = deptYear;
  if (sectionEl) sectionEl.value = section;
  if (emailEl) emailEl.value = email;
  if (phoneEl) phoneEl.value = phone;

  const submitBtn = document.getElementById('join-submit-btn');
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Confirm & Join Club`;
    submitBtn.disabled = false;
  }

  const modal = document.getElementById('club-join-modal');
  if (modal) modal.classList.add('active');
};

window.openClubPassModal = function(clubId) {
  const club = CAMPUS_CLUBS.find(c => c.id === clubId);
  if (!club) return;

  activeModalClubId = clubId;
  const user = AuthState.getUser() || {};
  const headerName = document.getElementById('user-name')?.textContent?.trim();

  // Retrieve registration record if exists
  let passId = `VSB-${club.name.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  let role = "Core Technical Track";
  let fullName = user.fullName || user.name || (headerName && headerName !== 'Alex Morgan' ? headerName : 'Naren K S');
  let rollNumber = user.rollNumber || "AD2024-088";
  let dept = user.department || "Artificial Intelligence & Data Science";
  let year = user.year || "3rd Year";
  let deptYear = `${dept}, ${year}`;

  try {
    const rawRegs = localStorage.getItem('campusai_club_registrations');
    if (rawRegs) {
      const regs = JSON.parse(rawRegs);
      const existing = regs.find(r => r.clubId === clubId);
      if (existing) {
        fullName = existing.fullName;
        rollNumber = existing.rollNumber;
        deptYear = existing.deptYear;
        role = existing.role || role;
        passId = existing.passId || passId;
      }
    }
  } catch (e) {}

  // Populate card
  document.getElementById('card-club-name').textContent = club.name;
  document.getElementById('card-student-name').textContent = fullName;
  document.getElementById('card-roll-no').textContent = rollNumber;
  document.getElementById('card-dept').textContent = deptYear;
  document.getElementById('card-pass-id').textContent = passId;
  document.getElementById('card-role').textContent = role;
  document.getElementById('success-club-name').textContent = club.name;

  // Switch modal view to card
  const formWrapper = document.getElementById('club-join-form-wrapper');
  const successWrapper = document.getElementById('club-join-success-wrapper');
  if (formWrapper) formWrapper.style.display = 'none';
  if (successWrapper) successWrapper.style.display = 'block';

  const modal = document.getElementById('club-join-modal');
  if (modal) modal.classList.add('active');
};

window.closeClubJoinModal = function() {
  const modal = document.getElementById('club-join-modal');
  if (modal) modal.classList.remove('active');
};

window.handleClubJoinSubmit = function(e) {
  e.preventDefault();

  const clubId = document.getElementById('join-club-id').value;
  const club = CAMPUS_CLUBS.find(c => c.id === clubId);
  const clubName = club ? club.name : 'Club';

  const fullName = document.getElementById('join-full-name').value.trim();
  const rollNumber = document.getElementById('join-roll-no').value.trim();
  const deptYear = document.getElementById('join-dept-year').value.trim();
  const section = document.getElementById('join-section').value.trim();
  const email = document.getElementById('join-email').value.trim();
  const phone = document.getElementById('join-phone').value.trim();
  const role = document.getElementById('join-selected-role')?.value || 'Core Technical Track';

  if (!fullName || !rollNumber || !deptYear || !email || !phone) {
    showToast('Please fill in all required fields (*)', 'danger');
    return;
  }

  const submitBtn = document.getElementById('join-submit-btn');
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Activating Membership...`;
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    const passId = `VSB-${clubName.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const registrationRecord = {
      clubId,
      clubName,
      fullName,
      rollNumber,
      deptYear,
      section: section || 'N/A',
      email,
      phone,
      role,
      passId,
      registeredAt: new Date().toLocaleString()
    };

    try {
      const rawRegs = localStorage.getItem('campusai_club_registrations');
      let regs = rawRegs ? JSON.parse(rawRegs) : [];
      regs = regs.filter(r => !(r.clubId === clubId && r.rollNumber === rollNumber));
      regs.push(registrationRecord);
      localStorage.setItem('campusai_club_registrations', JSON.stringify(regs));
    } catch (err) {
      console.error('Error saving registration', err);
    }

    // Add to joined list
    let joined = getJoinedClubs();
    if (!joined.includes(clubId)) {
      joined.push(clubId);
      saveJoinedClubs(joined);
    }

    // Populate Success Card
    document.getElementById('card-club-name').textContent = clubName;
    document.getElementById('card-student-name').textContent = fullName;
    document.getElementById('card-roll-no').textContent = rollNumber;
    document.getElementById('card-dept').textContent = deptYear;
    document.getElementById('card-pass-id').textContent = passId;
    document.getElementById('card-role').textContent = role;
    document.getElementById('success-club-name').textContent = clubName;

    // Transition smoothly to success pass
    const formWrapper = document.getElementById('club-join-form-wrapper');
    const successWrapper = document.getElementById('club-join-success-wrapper');
    if (formWrapper) formWrapper.style.display = 'none';
    if (successWrapper) successWrapper.style.display = 'block';

    showToast(`🎉 Registration Successful! Welcome to ${clubName}!`, 'success');
    loadClubs();
  }, 400);
};

window.downloadMemberCard = function() {
  const studentName = document.getElementById('card-student-name')?.textContent || 'Student';
  const clubName = document.getElementById('card-club-name')?.textContent || 'Club';
  const passId = document.getElementById('card-pass-id')?.textContent || 'PASS-001';

  showToast(`📥 Downloading Digital Membership Pass for ${studentName} (${passId})...`, 'success');

  // Trigger gentle print preview or simulated file download
  setTimeout(() => {
    showToast(`✅ Member Pass saved! Show this digital badge during lab entry & meetups.`, 'success');
  }, 800);
};

window.addClubToCalendar = function() {
  const clubId = activeModalClubId;
  const club = CAMPUS_CLUBS.find(c => c.id === clubId) || { name: 'Club Meetup', timing: 'Weekly' };

  showToast(`📅 Added ${club.name} weekly session (${club.timing}) to your academic calendar!`, 'success');
};

window.toggleJoinClub = function(clubId) {
  let joined = getJoinedClubs();
  const club = CAMPUS_CLUBS.find(c => c.id === clubId);
  const clubName = club ? club.name : 'Club';

  if (joined.includes(clubId)) {
    if (confirm(`Are you sure you want to leave ${clubName}?`)) {
      joined = joined.filter(id => id !== clubId);
      saveJoinedClubs(joined);
      showToast(`You have left ${clubName}.`, 'warning');
      loadClubs();
      if (activeModalClubId === clubId) {
        closeClubDetailModal();
        closeClubJoinModal();
      }
    }
  } else {
    openClubJoinModal(clubId);
  }
};

// ==========================================
// Student Notes & Study Materials Controller
// ==========================================
let allStudentMaterials = [];
let studentActiveSubjectFilter = 'ALL';
let studentActiveFormatFilter = 'ALL';
let studentBookmarkedOnly = false;

function getBookmarkedMaterialIds() {
  try {
    const saved = localStorage.getItem('campusai_bookmarked_materials');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [1, 2]; // Default demo bookmarks
}

function saveBookmarkedMaterialIds(ids) {
  localStorage.setItem('campusai_bookmarked_materials', JSON.stringify(ids));
}

async function loadStudentMaterials() {
  const res = await apiRequest('/student/materials');
  allStudentMaterials = Array.isArray(res) ? res : (typeof getStoredStudyMaterials === 'function' ? getStoredStudyMaterials() : []);
  updateStudentMaterialsUI();
}

function updateStudentMaterialsUI() {
  const bookmarks = getBookmarkedMaterialIds();
  const countBadge = document.getElementById('student-bookmarked-count');
  if (countBadge) countBadge.textContent = bookmarks.length;

  const statCount = document.getElementById('student-stat-materials-count');
  if (statCount) statCount.textContent = `${allStudentMaterials.length} Modules`;

  applyStudentMaterialFilters();
}

function getMaterialFormatDetails(format) {
  switch ((format || '').toUpperCase()) {
    case 'PDF':
      return { css: 'format-pdf', icon: 'fa-solid fa-file-pdf', label: 'PDF Document' };
    case 'PPTX':
      return { css: 'format-pptx', icon: 'fa-solid fa-file-powerpoint', label: 'Presentation' };
    case 'ZIP':
      return { css: 'format-zip', icon: 'fa-solid fa-file-zipper', label: 'Code Archive' };
    case 'Q-BANK':
      return { css: 'format-qbank', icon: 'fa-solid fa-file-lines', label: 'Question Bank' };
    case 'CHEATSHEET':
      return { css: 'format-cheatsheet', icon: 'fa-solid fa-bolt', label: 'Formula Sheet' };
    default:
      return { css: 'format-docx', icon: 'fa-solid fa-file-word', label: 'Document' };
  }
}

function renderStudentMaterials(materials) {
  const grid = document.getElementById('student-materials-grid');
  if (!grid) return;

  const bookmarks = getBookmarkedMaterialIds();

  if (!materials || materials.length === 0) {
    const hasAnyMaterials = (allStudentMaterials || []).length > 0;
    if (hasAnyMaterials) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px 20px; background:rgba(255,255,255,0.02); border-radius:var(--radius-md); border:1px dashed var(--border-glass);">
          <i class="fa-solid fa-filter-circle-xmark" style="font-size:2.8rem; color:var(--text-muted); margin-bottom:12px; display:block;"></i>
          <h4 style="margin-bottom:6px;">No Materials Matching Filter</h4>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">Try adjusting your search query, subject, or format filters.</p>
          <button class="btn btn-secondary btn-sm" onclick="resetStudentMaterialFilters()"><i class="fa-solid fa-arrows-rotate"></i> Reset All Filters</button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 60px 24px; border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 16px;">
          <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(99, 102, 241, 0.12); color: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px auto;">
            <i class="fa-solid fa-folder-open"></i>
          </div>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No Study Materials Available Yet</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 520px; margin: 0 auto; line-height: 1.6;">
            Your professors have not published any lecture notes or digital study materials yet. They will appear here as soon as faculty uploads them.
          </p>
        </div>
      `;
    }
    return;
  }

  grid.innerHTML = materials.map(m => {
    const fmt = getMaterialFormatDetails(m.format);
    const isBookmarked = bookmarks.includes(m.id);

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
              <div>
                <div style="font-weight:600; color:var(--text-main); font-size:0.8rem;">${m.facultyName}</div>
                <div style="font-size:0.72rem; color:var(--text-muted);">${m.subjectName}</div>
              </div>
            </div>
            <div style="text-align:right; font-size:0.78rem;">
              <div><i class="fa-solid fa-file"></i> ${m.fileSize || '3.5 MB'}</div>
              <div style="color:var(--success); font-size:0.74rem;"><i class="fa-solid fa-download"></i> ${m.downloads || 0} downloads</div>
            </div>
          </div>
        </div>

        <div class="material-actions">
          <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleMaterialBookmark(${m.id})" title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Material'}">
            <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-star"></i>
          </button>
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="openStudentPreviewModal(${m.id})">
            <i class="fa-solid fa-book-open"></i> Read Notes
          </button>
          <button class="btn btn-secondary btn-sm" onclick="downloadStudentStudyMaterial(${m.id})" title="Download File">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupStudentMaterialFilters() {
  const searchInput = document.getElementById('student-material-search');
  if (searchInput) {
    searchInput.addEventListener('input', applyStudentMaterialFilters);
  }

  // Subject Pills
  const subjectPills = document.querySelectorAll('#student-subject-pills .filter-pill');
  subjectPills.forEach(pill => {
    pill.addEventListener('click', () => {
      subjectPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      studentActiveSubjectFilter = pill.getAttribute('data-subject') || 'ALL';
      applyStudentMaterialFilters();
    });
  });

  // Format Pills
  const formatPills = document.querySelectorAll('#student-format-pills .format-pill');
  formatPills.forEach(pill => {
    pill.addEventListener('click', () => {
      formatPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      studentActiveFormatFilter = pill.getAttribute('data-format') || 'ALL';
      applyStudentMaterialFilters();
    });
  });
}

function applyStudentMaterialFilters() {
  const searchInput = document.getElementById('student-material-search');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const bookmarks = getBookmarkedMaterialIds();

  const filtered = allStudentMaterials.filter(m => {
    const matchesQuery = !query ||
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      (m.subjectCode && m.subjectCode.toLowerCase().includes(query)) ||
      (m.subjectName && m.subjectName.toLowerCase().includes(query)) ||
      (m.facultyName && m.facultyName.toLowerCase().includes(query)) ||
      (m.unit && m.unit.toLowerCase().includes(query)) ||
      (m.topics && m.topics.some(t => t.toLowerCase().includes(query)));

    const matchesSubject = studentActiveSubjectFilter === 'ALL' || m.subjectCode === studentActiveSubjectFilter;
    const matchesFormat = studentActiveFormatFilter === 'ALL' || (m.format && m.format.toUpperCase() === studentActiveFormatFilter.toUpperCase());
    const matchesBookmark = !studentBookmarkedOnly || bookmarks.includes(m.id);

    return matchesQuery && matchesSubject && matchesFormat && matchesBookmark;
  });

  renderStudentMaterials(filtered);
}

window.toggleStudentBookmarkFilter = function() {
  studentBookmarkedOnly = !studentBookmarkedOnly;
  const btn = document.getElementById('student-filter-bookmarked-btn');
  const icon = document.getElementById('bookmark-filter-icon');

  if (btn) {
    if (studentBookmarkedOnly) {
      btn.classList.add('active');
      if (icon) icon.className = 'fa-solid fa-star';
    } else {
      btn.classList.remove('active');
      if (icon) icon.className = 'fa-regular fa-star';
    }
  }

  applyStudentMaterialFilters();
};

window.toggleMaterialBookmark = function(materialId) {
  let bookmarks = getBookmarkedMaterialIds();
  const index = bookmarks.indexOf(materialId);

  if (index >= 0) {
    bookmarks.splice(index, 1);
    showToast('Removed from Bookmarks ⭐', 'info');
  } else {
    bookmarks.push(materialId);
    showToast('Saved to My Bookmarks ⭐', 'success');
  }

  saveBookmarkedMaterialIds(bookmarks);
  updateStudentMaterialsUI();
};

window.resetStudentMaterialFilters = function() {
  const searchInput = document.getElementById('student-material-search');
  if (searchInput) searchInput.value = '';

  studentActiveSubjectFilter = 'ALL';
  studentActiveFormatFilter = 'ALL';
  studentBookmarkedOnly = false;

  document.querySelectorAll('#student-subject-pills .filter-pill').forEach((p, idx) => {
    if (idx === 0) p.classList.add('active');
    else p.classList.remove('active');
  });

  document.querySelectorAll('#student-format-pills .format-pill').forEach((p, idx) => {
    if (idx === 0) p.classList.add('active');
    else p.classList.remove('active');
  });

  const btn = document.getElementById('student-filter-bookmarked-btn');
  const icon = document.getElementById('bookmark-filter-icon');
  if (btn) btn.classList.remove('active');
  if (icon) icon.className = 'fa-regular fa-star';

  applyStudentMaterialFilters();
};

window.openStudentPreviewModal = function(id) {
  const material = allStudentMaterials.find(m => m.id === id);
  if (!material) return;

  const modal = document.getElementById('student-material-preview-modal');
  const fmt = getMaterialFormatDetails(material.format);

  const iconEl = document.getElementById('stu-preview-icon');
  if (iconEl) {
    iconEl.className = `material-format-icon ${fmt.css}`;
    iconEl.innerHTML = `<i class="${fmt.icon}"></i>`;
  }

  const titleEl = document.getElementById('stu-preview-title');
  if (titleEl) titleEl.textContent = material.title;

  const subtitleEl = document.getElementById('stu-preview-subtitle');
  if (subtitleEl) subtitleEl.textContent = `${material.subjectCode} - ${material.subjectName} • ${material.unit} • By ${material.facultyName}`;

  const tagsEl = document.getElementById('stu-preview-tags');
  if (tagsEl) {
    tagsEl.innerHTML = `
      <span class="badge badge-primary">${material.subjectCode}</span>
      <span class="badge badge-info">${material.unit}</span>
      <span class="badge badge-warning">${material.tag || 'Course Material'}</span>
      <span class="badge badge-success"><i class="fa-solid fa-file"></i> ${material.fileSize || '3.5 MB'}</span>
      <span class="badge badge-secondary"><i class="fa-solid fa-user-tie"></i> ${material.facultyName}</span>
    `;
  }

  const bodyEl = document.getElementById('stu-preview-document-body');
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

  const metaLeftEl = document.getElementById('stu-preview-meta-left');
  if (metaLeftEl) {
    metaLeftEl.innerHTML = `<span>Uploaded: ${new Date(material.uploadDate || Date.now()).toLocaleDateString()} • ${material.downloads || 0} Downloads</span>`;
  }

  const filesizeSpan = document.getElementById('stu-preview-filesize');
  if (filesizeSpan) filesizeSpan.textContent = material.fileSize || '3.5 MB';

  const downloadBtn = document.getElementById('stu-preview-download-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => downloadStudentStudyMaterial(material.id);
  }

  const askAiBtn = document.getElementById('stu-preview-ask-ai-btn');
  if (askAiBtn) {
    askAiBtn.onclick = () => {
      closeStudentPreviewModal();
      askAiQuick(`Explain the key concepts and formulas from "${material.title}" for ${material.subjectName} (${material.subjectCode}).`);
    };
  }

  modal?.classList.add('active');
};

window.closeStudentPreviewModal = function() {
  document.getElementById('student-material-preview-modal')?.classList.remove('active');
};

window.downloadStudentStudyMaterial = function(id) {
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

  const materials = typeof getStoredStudyMaterials === 'function' ? getStoredStudyMaterials() : [];
  const mat = materials.find(m => Number(m.id) === Number(id) || String(m.id) === String(id));
  if (!mat) {
    showToast('Download started...', 'info');
    loadStudentMaterials();
    return;
  }

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

NOTES & EXCERPTS:
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
  loadStudentMaterials();
};

// Listen for cross-tab download synchronization
window.addEventListener('storage', (e) => {
  if (e.key === 'campusai_study_materials' || e.key === 'campusai_faculty_uploaded_materials') {
    if (typeof loadStudentMaterials === 'function') {
      loadStudentMaterials();
    }
  }
});

window.addEventListener('campusai_material_downloaded', () => {
  if (typeof loadStudentMaterials === 'function') {
    loadStudentMaterials();
  }
});

window.addEventListener('campusai:material_published', () => {
  if (typeof loadStudentMaterials === 'function') {
    loadStudentMaterials();
  }
});

window.addEventListener('campusai:update', (e) => {
  if (e.detail && e.detail.tabKey === 'materials') {
    if (typeof loadStudentMaterials === 'function') {
      loadStudentMaterials();
    }
  }
});





