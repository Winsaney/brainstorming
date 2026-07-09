// =============================================
// Sessions Module — Create, switch, delete, persist
// =============================================

const STORAGE_KEY = 'brainstorm_sessions';
const ACTIVE_KEY = 'brainstorm_active_session';

let sessions = [];
let activeSessionId = null;
let onSessionChange = null;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    sessions = raw ? JSON.parse(raw) : [];
  } catch {
    sessions = [];
  }
  activeSessionId = localStorage.getItem(ACTIVE_KEY);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  if (activeSessionId) {
    localStorage.setItem(ACTIVE_KEY, activeSessionId);
  }
}

function createSession() {
  const session = {
    id: generateId(),
    title: '新的头脑风暴',
    messages: [],
    step: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.unshift(session);
  activeSessionId = session.id;
  save();
  renderSessionList();
  if (onSessionChange) onSessionChange(session);
  return session;
}

function getActiveSession() {
  return sessions.find(s => s.id === activeSessionId) || null;
}

function switchSession(id) {
  const session = sessions.find(s => s.id === id);
  if (!session) return;
  activeSessionId = id;
  save();
  renderSessionList();
  if (onSessionChange) onSessionChange(session);
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  if (activeSessionId === id) {
    activeSessionId = sessions.length > 0 ? sessions[0].id : null;
  }
  save();
  renderSessionList();
  const active = getActiveSession();
  if (onSessionChange) onSessionChange(active);
}

function updateSession(updates) {
  const session = getActiveSession();
  if (!session) return;
  Object.assign(session, updates, { updatedAt: Date.now() });
  // Auto-title from first user message
  if (session.title === '新的头脑风暴' && session.messages.length > 0) {
    const firstUserMsg = session.messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      session.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '…' : '');
    }
  }
  save();
  renderSessionList();
}

function renderSessionList() {
  const container = document.getElementById('session-list');
  if (!container) return;

  container.innerHTML = sessions.map(s => `
    <div class="session-item ${s.id === activeSessionId ? 'active' : ''}" data-id="${s.id}">
      <span class="session-icon">💡</span>
      <span class="session-title">${escapeHtml(s.title)}</span>
      <button class="session-delete" data-delete-id="${s.id}" title="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');

  // Bind events
  container.querySelectorAll('.session-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.session-delete')) return;
      switchSession(el.dataset.id);
      // Auto-close sidebar on mobile after switching
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
      }
    });
  });

  container.querySelectorAll('.session-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(btn.dataset.deleteId);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export const Sessions = {
  load,
  save,
  createSession,
  getActiveSession,
  switchSession,
  deleteSession,
  updateSession,
  renderSessionList,
  setOnChange(fn) { onSessionChange = fn; },
};
