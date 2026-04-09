// =============================================
// App Module — Main Entry Point
// =============================================

import { Sessions } from './sessions.js';
import { Steps } from './steps.js';
import { Chat } from './chat.js';
import { Export } from './export.js';

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
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const overlaySettings = document.getElementById('settings-overlay');
  
  const elProfile = document.getElementById('setting-profile');
  const elProfileName = document.getElementById('setting-profile-name');
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const btnDeleteProfile = document.getElementById('btn-delete-profile');
  
  function getProfiles() {
    return JSON.parse(localStorage.getItem('brainstorm_profiles') || '[]');
  }
  
  function saveProfiles(profiles) {
    localStorage.setItem('brainstorm_profiles', JSON.stringify(profiles));
  }
  
  function renderProfiles() {
    const profiles = getProfiles();
    const activeId = localStorage.getItem('brainstorm_active_profile');
    
    if (elProfile) {
      elProfile.innerHTML = '<option value="">自定义配置</option>';
      profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        elProfile.appendChild(opt);
      });
      
      if (activeId && profiles.find(p => p.id === activeId)) {
        elProfile.value = activeId;
        elProfileName.value = profiles.find(p => p.id === activeId).name;
        btnDeleteProfile.style.display = 'block';
      } else {
        elProfile.value = '';
        elProfileName.value = '';
        btnDeleteProfile.style.display = 'none';
        localStorage.removeItem('brainstorm_active_profile');
      }
    }
  }

  function openSettings() {
    renderProfiles();
    const config = JSON.parse(localStorage.getItem('brainstorm_settings') || '{}');
    document.getElementById('setting-api-key').value = config.apiKey || '';
    document.getElementById('setting-base-url').value = config.baseUrl || '';
    document.getElementById('setting-model').value = config.model || '';
    overlaySettings.classList.remove('hidden');
    // On mobile, close sidebar when opening settings
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      closeMobileSidebar();
    }
  }

  function closeSettings() {
    overlaySettings.classList.add('hidden');
  }

  // Handle profile change
  if (elProfile) {
    elProfile.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) {
        // Custom
        elProfileName.value = '';
        btnDeleteProfile.style.display = 'none';
        localStorage.removeItem('brainstorm_active_profile');
        return;
      }
      
      const profiles = getProfiles();
      const p = profiles.find(x => x.id === val);
      if (p) {
        document.getElementById('setting-api-key').value = p.apiKey || '';
        document.getElementById('setting-base-url').value = p.baseUrl || '';
        document.getElementById('setting-model').value = p.model || '';
        elProfileName.value = p.name || '';
        btnDeleteProfile.style.display = 'block';
        localStorage.setItem('brainstorm_active_profile', p.id);
      }
    });
  }
  
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', () => {
      let name = elProfileName.value.trim();
      if (!name) name = '未命名配置';
      
      const apiKey = document.getElementById('setting-api-key').value.trim();
      const baseUrl = document.getElementById('setting-base-url').value.trim();
      const model = document.getElementById('setting-model').value.trim();
      
      let profiles = getProfiles();
      let activeId = elProfile.value;
      
      if (activeId) {
        // Update existing
        const idx = profiles.findIndex(p => p.id === activeId);
        if (idx >= 0) {
          profiles[idx] = { ...profiles[idx], name, apiKey, baseUrl, model };
        }
      } else {
        // Create new
        activeId = Date.now().toString();
        profiles.push({ id: activeId, name, apiKey, baseUrl, model });
      }
      
      saveProfiles(profiles);
      localStorage.setItem('brainstorm_active_profile', activeId);
      renderProfiles();
      showToast('配置集已保存，请点击"保存配置"生效');
    });
  }
  
  if (btnDeleteProfile) {
    btnDeleteProfile.addEventListener('click', () => {
      const activeId = elProfile.value;
      if (!activeId) return;
      
      let profiles = getProfiles();
      profiles = profiles.filter(p => p.id !== activeId);
      saveProfiles(profiles);
      localStorage.removeItem('brainstorm_active_profile');
      renderProfiles();
      showToast('配置集已删除');
    });
  }

  const btnSaveSettings = document.getElementById('btn-save-settings');
  function saveSettings() {
    const apiKey = document.getElementById('setting-api-key').value.trim();
    const baseUrl = document.getElementById('setting-base-url').value.trim();
    const model = document.getElementById('setting-model').value.trim();

    localStorage.setItem('brainstorm_settings', JSON.stringify({
      apiKey, baseUrl, model
    }));

    closeSettings();
    showToast('设置生效并已保存');
  }

  if (btnSettings) btnSettings.addEventListener('click', openSettings);
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);
  if (overlaySettings) overlaySettings.addEventListener('click', (e) => {
    if (e.target === overlaySettings) closeSettings();
  });

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
