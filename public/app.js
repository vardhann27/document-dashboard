// ─── CONNECT TO SERVER FOR REAL-TIME NOTIFICATIONS (SSE) ───
const eventSource = new EventSource('/events');
eventSource.onmessage = (e) => {
  const notification = JSON.parse(e.data);
  showToast(notification.message);
  addNotificationToPanel(notification);
  updateBadge();
};

// ─── ON PAGE LOAD ───
window.onload = () => {
  loadFiles();
  loadNotifications();
};

// ─── FILE INPUT & DRAG DROP ───
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

// ─── HANDLE FILES ───
function handleFiles(files) {
  if (!files.length) return;

  const progressList = document.getElementById('progressList');

  // If more than 3 files show toast immediately
  if (files.length > 3) {
    showToast(`Upload in progress — processing ${files.length} files in background`);
  }

  // Create progress bar for each file
  Array.from(files).forEach(file => {
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.id = 'progress-' + file.name.replace(/\s/g, '_');
    item.innerHTML = `
      <div class="file-info">
        <span>📄 ${file.name} (${formatSize(file.size)})</span>
        <span class="status-tag status-uploading" id="status-${file.name.replace(/\s/g, '_')}">Uploading</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" id="bar-${file.name.replace(/\s/g, '_')}"></div>
      </div>
    `;
    progressList.appendChild(item);
  });

  // Upload all files
  uploadFiles(files);
}

// ─── UPLOAD FILES ───
function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('files', file));

  const xhr = new XMLHttpRequest();

  // Track upload progress
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      // Update all bars together (XHR tracks total progress)
      Array.from(files).forEach(file => {
        const bar = document.getElementById('bar-' + file.name.replace(/\s/g, '_'));
        if (bar) bar.style.width = percent + '%';
      });
    }
  });

  // When upload is complete
  xhr.addEventListener('load', () => {
    Array.from(files).forEach(file => {
      const status = document.getElementById('status-' + file.name.replace(/\s/g, '_'));
      if (status) {
        status.textContent = 'Complete';
        status.className = 'status-tag status-complete';
      }
      const bar = document.getElementById('bar-' + file.name.replace(/\s/g, '_'));
      if (bar) bar.style.width = '100%';
    });
    loadFiles(); // Refresh file table
  });

  // If upload fails
  xhr.addEventListener('error', () => {
    Array.from(files).forEach(file => {
      const status = document.getElementById('status-' + file.name.replace(/\s/g, '_'));
      if (status) {
        status.textContent = 'Failed';
        status.className = 'status-tag status-failed';
      }
    });
  });

  xhr.open('POST', '/upload');
  xhr.send(formData);
}

// ─── LOAD FILES INTO TABLE ───
function loadFiles() {
  fetch('/files')
    .then(res => res.json())
    .then(files => {
      const tbody = document.getElementById('fileTableBody');
      if (!files.length) {
        tbody.innerHTML = '<tr><td colspan="5">No files uploaded yet</td></tr>';
        return;
      }
      tbody.innerHTML = files.map(file => `
        <tr>
          <td>📄 ${file.originalname}</td>
          <td>${formatSize(file.size)}</td>
          <td>${formatDate(file.uploaddate)}</td>
          <td><span class="status-tag status-complete">Complete</span></td>
          <td>
            <button class="download-btn" onclick="downloadFile('${file.filename}')">⬇ Download</button>
            <button class="delete-btn" onclick="deleteFile(${file.id})">🗑 Delete</button>
          </td>
        </tr>
      `).join('');
    });
}

// ─── DOWNLOAD FILE ───
function downloadFile(filename) {
  // Use a temporary anchor with `download` to force a direct file download
  const a = document.createElement('a');
  a.href = '/download/' + encodeURIComponent(filename);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ─── LOAD NOTIFICATIONS ───
function loadNotifications() {
  fetch('/notifications')
    .then(res => res.json())
    .then(notifications => {
      const list = document.getElementById('notifList');
      if (!notifications.length) {
        list.innerHTML = '<p class="empty-msg">No notifications yet</p>';
        updateBadge();
        return;
      }
      list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.isread ? '' : 'unread'}" id="notif-${n.id}">
          <div>
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${formatDate(n.timestamp)}</div>
          </div>
          ${!n.isread ? `<button class="mark-read-btn" onclick="markRead(${n.id})">Mark read</button>` : ''}
        </div>
      `).join('');
      updateBadge();
    });
}

// ─── ADD SINGLE NOTIFICATION TO PANEL (from SSE) ───
function addNotificationToPanel(notification) {
  const list = document.getElementById('notifList');
  const emptyMsg = list.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  const item = document.createElement('div');
  item.className = 'notif-item unread';
  item.id = 'notif-' + notification.id;
  item.innerHTML = `
    <div>
      <div class="notif-msg">${notification.message}</div>
      <div class="notif-time">${formatDate(notification.timestamp)}</div>
    </div>
    <button class="mark-read-btn" onclick="markRead(${notification.id})">Mark read</button>
  `;
  list.prepend(item);
}

// ─── MARK ONE NOTIFICATION AS READ ───
function markRead(id) {
  fetch(`/notifications/${id}/read`, { method: 'PUT' })
    .then(() => {
      const item = document.getElementById('notif-' + id);
      if (item) {
        item.classList.remove('unread');
        const btn = item.querySelector('.mark-read-btn');
        if (btn) btn.remove();
      }
      updateBadge();
    });
}

// ─── MARK ALL AS READ ───
function markAllRead() {
  fetch('/notifications/read-all', { method: 'PUT' })
    .then(() => {
      document.querySelectorAll('.notif-item').forEach(item => {
        item.classList.remove('unread');
        const btn = item.querySelector('.mark-read-btn');
        if (btn) btn.remove();
      });
      updateBadge();
    });
}

// ─── UPDATE BADGE COUNT ───
function updateBadge() {
  const unread = document.querySelectorAll('.notif-item.unread').length;
  const badge = document.getElementById('badge');
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

// ─── TOGGLE NOTIFICATION DROPDOWN ───
function toggleNotifications() {
  const dropdown = document.getElementById('notifDropdown');
  dropdown.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notifDropdown');
  const bell = document.querySelector('.bell-wrapper');
  if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// ─── SHOW TOAST ───
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ─── HELPERS ───
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

// ─── DELETE FILE ───
function deleteFile(id) {
  if (!confirm('Delete this file?')) return;
  fetch(`/files/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => loadFiles())
    .catch(err => {
      console.error('Delete error', err);
      showToast('Failed to delete file');
    });
}