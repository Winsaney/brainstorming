// =============================================
// App Module — Main Entry Point
// =============================================

import { Sessions } from './sessions.js';
import { Steps } from './steps.js';
import { Chat } from './chat.js';
import { Export } from './export.js';
import { Settings } from './settings.js';

// ===== UI Logic =====

function initUI() {
  // --- Sidebar Toggle (Mobile) ---
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  let overlay = document.querySelector('.sidebar-overlay');

  if (!overlay && sidebar) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');

  // Load saved state
  const isCollapsed = localStorage.getItem('brainstorm_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }

  function toggleMobileSidebar() {
    // If we're on mobile, slide in
    if (window.innerWidth <= 768) {
      sidebar.classList.add('open');
      overlay.classList.add('show');
    } else {
      // If we're on desktop, this button expands the sidebar
      sidebar.classList.remove('collapsed');
      localStorage.setItem('brainstorm_sidebar_collapsed', 'false');
    }
  }

  function collapseSidebarDesktop() {
    sidebar.classList.add('collapsed');
    localStorage.setItem('brainstorm_sidebar_collapsed', 'true');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  if (btnSidebarToggle) btnSidebarToggle.addEventListener('click', toggleMobileSidebar);
  if (btnCollapseSidebar) btnCollapseSidebar.addEventListener('click', collapseSidebarDesktop);
  if (overlay) overlay.addEventListener('click', closeMobileSidebar);

  // --- Settings Modal ---
  Settings.init();
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      Settings.open();
      if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        closeMobileSidebar();
      }
    });
  }

  // --- Export Modal ---
  const btnExport = document.getElementById('btn-export');
  const btnCloseExport = document.getElementById('btn-close-export');
  const overlayExport = document.getElementById('export-overlay');
  const btnDownloadExport = document.getElementById('btn-download-export');
  const btnCopyExport = document.getElementById('btn-copy-export');
  const exportPreview = document.getElementById('export-preview');

  let currentExportMarkdown = '';

  function openExport() {
    const session = Sessions.getActiveSession();
    if (!session || session.messages.length === 0) {
      showToast('当前没有可以导出的内容');
      return;
    }

    currentExportMarkdown = Export.generateMarkdown(session);
    
    // Render preview
    if (typeof marked !== 'undefined') {
      marked.setOptions({ breaks: true, gfm: true });
      exportPreview.innerHTML = marked.parse(currentExportMarkdown);
    } else {
      exportPreview.textContent = currentExportMarkdown;
    }

    overlayExport.classList.remove('hidden');
  }

  function closeExport() {
    overlayExport.classList.add('hidden');
  }

  if (btnExport) btnExport.addEventListener('click', openExport);
  if (btnCloseExport) btnCloseExport.addEventListener('click', closeExport);
  if (overlayExport) overlayExport.addEventListener('click', (e) => {
    if (e.target === overlayExport) closeExport();
  });

  if (btnDownloadExport) btnDownloadExport.addEventListener('click', () => {
    const session = Sessions.getActiveSession();
    const name = session ? session.title : 'design-doc';
    Export.downloadMarkdown(currentExportMarkdown, `${name}.md`);
    showToast('已下载设计文档');
  });

  if (btnCopyExport) btnCopyExport.addEventListener('click', async () => {
    await Export.copyToClipboard(currentExportMarkdown);
    showToast('已复制到剪贴板');
  });

  // --- New Session ---
  const btnNewSession = document.getElementById('btn-new-session');
  if (btnNewSession) btnNewSession.addEventListener('click', () => {
    Sessions.createSession();
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      closeMobileSidebar();
    }
  });

  // --- Chat Input ---
  const chatInput = document.getElementById('chat-input');
  const btnSend = document.getElementById('btn-send');

  function resizeInput() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
  }

  if (chatInput) {
    chatInput.addEventListener('input', () => {
      resizeInput();
      Chat.updateSendButton();
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.isComposing || e.keyCode === 229) {
        return; // 中文输入法正在拼写时，忽略回车事件
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Auto focus
    setTimeout(() => chatInput.focus(), 100);
  }

  if (btnSend) {
    btnSend.addEventListener('click', handleSend);
  }

  function handleSend() {
    const val = chatInput.value.trim();
    if (!val || Chat.getIsStreaming()) return;
    
    chatInput.value = '';
    resizeInput();
    Chat.sendMessage(val);
  }

  // --- Web Search Toggle ---
  const btnToggleSearch = document.getElementById('btn-toggle-search');
  if (btnToggleSearch) {
    Chat.updateSearchToggleButton();
    btnToggleSearch.addEventListener('click', () => {
      const active = Chat.toggleWebSearch();
      showToast(active ? '已开启联网搜索 (Tool Use)' : '已关闭联网搜索');
    });
  }

  // --- Welcome Suggestions ---
  document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      if (chatInput && !Chat.getIsStreaming()) {
        chatInput.value = btn.dataset.prompt;
        resizeInput();
        handleSend();
      }
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== Initialization =====

function init() {
  Sessions.setOnChange((session) => {
    if (session) {
      Steps.setStep(session.step || 1);
      Chat.renderMessages(session.messages);
    } else {
      // Create new session if none exists
      Sessions.createSession();
    }
  });

  Sessions.load();
  if (Sessions.getActiveSession()) {
    Sessions.renderSessionList();
    const session = Sessions.getActiveSession();
    Steps.setStep(session.step || 1);
    Chat.renderMessages(session.messages);
  } else {
    Sessions.createSession();
  }

  initUI();
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
