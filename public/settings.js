// =============================================
// Settings Module — LLM API Configuration Manager
// =============================================

export const Settings = (function () {
  // Provider presets metadata
  const PROVIDER_PRESETS = {
    'DeepSeek': {
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com',
      defaultModel: 'deepseek-chat',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
      color: '#0066FF'
    },
    'OpenAI': {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o',
      models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>`,
      color: '#10A37F'
    },
    'Anthropic': {
      name: 'Anthropic (Claude)',
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3-5-sonnet-20001022',
      models: ['claude-3-5-sonnet-20001022', 'claude-3-5-haiku-20241022'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      color: '#D97757'
    },
    '智谱 (Zhipu)': {
      name: '智谱 AI (GLM)',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      defaultModel: 'glm-4-flash',
      models: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
      color: '#3B82F6'
    },
    '通义千问 (Qwen)': {
      name: '通义千问 (Qwen)',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      defaultModel: 'qwen-max',
      models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3"/></svg>`,
      color: '#6366F1'
    },
    'SenseNova': {
      name: 'SenseNova (商汤日日新)',
      baseUrl: 'https://token.sensenova.cn/v1',
      defaultModel: 'deepseek-v4-flash',
      models: ['deepseek-v4-flash'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z"/></svg>`,
      color: '#E60012'
    },
    'NVIDIA': {
      name: 'NVIDIA NIM (AI Foundation)',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      defaultModel: 'z-ai/glm-5.2',
      models: ['z-ai/glm-5.2'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="22" y1="8.5" x2="12" y2="12"/><line x1="2" y1="8.5" x2="12" y2="12"/></svg>`,
      color: '#76B900'
    },
    'Ollama': {
      name: 'Ollama (本地/远程)',
      baseUrl: 'http://localhost:11434/v1',
      defaultModel: 'llama3.3',
      models: ['llama3.3', 'qwen2.5-coder', 'deepseek-r1'],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      color: '#8B5CF6'
    },
    '自定义': {
      name: '自定义',
      baseUrl: '',
      defaultModel: '',
      models: [],
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      color: '#64748B'
    }
  };

  const STORAGE_CONFIGS_KEY = 'brainstorm_configs';
  const STORAGE_ACTIVE_ID_KEY = 'brainstorm_active_config_id';
  const STORAGE_SETTINGS_KEY = 'brainstorm_settings'; // Legacy/Active sync key

  let currentView = 'list'; // 'list' | 'editor'
  let currentEditingId = null;

  // DOM Elements
  let overlayEl, modalEl, titleEl, subtitleEl, btnCloseEl, btnBackEl;
  let listSectionEl, listContainerEl, btnAddConfigEl, emptyStateEl;
  let editorSectionEl, inputIdEl, selectProviderEl, inputModelEl, modelTagsEl, inputBaseUrlEl, inputApiKeyEl, btnToggleKeyEl, inputEnabledEl, inputRemarkEl, inputTavilyKeyEl, testResultEl;
  let footerEl, btnCancelEditorEl, btnTestEl, btnSaveEl, btnCloseModalFooterEl;

  // Initialize data and migrate if needed
  function getConfigs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CONFIGS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveConfigs(configs) {
    localStorage.setItem(STORAGE_CONFIGS_KEY, JSON.stringify(configs));
  }

  function getActiveConfigId() {
    return localStorage.getItem(STORAGE_ACTIVE_ID_KEY) || null;
  }

  function setActiveConfigId(id) {
    if (id) {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
    }
    syncActiveConfigToSettings();
  }

  function syncActiveConfigToSettings() {
    const configs = getConfigs();
    const activeId = getActiveConfigId();
    const activeConfig = configs.find(c => c.id === activeId) || configs.find(c => c.enabled) || configs[0] || null;

    if (activeConfig) {
      const payload = {
        apiKey: activeConfig.apiKey || '',
        baseUrl: activeConfig.baseUrl || '',
        model: activeConfig.model || '',
        provider: activeConfig.provider || 'OpenAI',
        remark: activeConfig.remark || activeConfig.name || ''
      };
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(payload));
      updateSidebarActiveIndicator(activeConfig);
    } else {
      // Clear legacy
      const legacyRaw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (parsed.apiKey) {
            updateSidebarActiveIndicator(parsed);
            return;
          }
        } catch {}
      }
      updateSidebarActiveIndicator(null);
    }
  }

  function migrateLegacySettings() {
    const configs = getConfigs();
    const legacyRaw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (configs.length === 0 && legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw);
        if (parsed.apiKey || parsed.baseUrl || parsed.model) {
          const newConfig = {
            id: 'cfg_' + Date.now(),
            provider: parsed.provider || 'OpenAI',
            remark: parsed.remark || '我的默认 API 配置',
            model: parsed.model || 'gpt-4o',
            baseUrl: parsed.baseUrl || '',
            apiKey: parsed.apiKey || '',
            enabled: true
          };
          saveConfigs([newConfig]);
          setActiveConfigId(newConfig.id);
        }
      } catch (e) {
        console.warn('Migration error:', e);
      }
    }
  }

  function updateSidebarActiveIndicator(config) {
    let indicatorEl = document.getElementById('sidebar-active-model');
    const settingsBtn = document.getElementById('btn-settings');
    if (!settingsBtn) return;

    if (!indicatorEl) {
      indicatorEl = document.createElement('div');
      indicatorEl.id = 'sidebar-active-model';
      indicatorEl.className = 'sidebar-active-model';
      settingsBtn.parentNode.insertBefore(indicatorEl, settingsBtn);
    }

    if (config && (config.apiKey || config.model)) {
      const providerName = config.provider || 'AI';
      const modelName = config.model || '默认模型';
      indicatorEl.innerHTML = `
        <span class="status-dot green"></span>
        <span class="active-model-text" title="${providerName}: ${modelName}">${providerName} · ${modelName}</span>
      `;
      indicatorEl.style.display = 'flex';
    } else {
      indicatorEl.innerHTML = `
        <span class="status-dot amber"></span>
        <span class="active-model-text">未配置 API Key</span>
      `;
      indicatorEl.style.display = 'flex';
    }
  }

  // Bind DOM elements
  function initDOM() {
    overlayEl = document.getElementById('settings-overlay');
    modalEl = document.getElementById('settings-modal');
    titleEl = document.getElementById('settings-modal-title');
    subtitleEl = document.getElementById('settings-modal-subtitle');
    btnCloseEl = document.getElementById('btn-close-settings');
    btnBackEl = document.getElementById('btn-back-settings');

    listSectionEl = document.querySelector('.config-list-section');
    listContainerEl = document.getElementById('config-list');
    btnAddConfigEl = document.getElementById('btn-add-config');
    emptyStateEl = document.getElementById('config-empty');

    editorSectionEl = document.getElementById('config-editor');
    inputIdEl = document.getElementById('editing-config-id');
    selectProviderEl = document.getElementById('setting-provider');
    inputModelEl = document.getElementById('setting-model');
    modelTagsEl = document.getElementById('model-quick-tags');
    inputBaseUrlEl = document.getElementById('setting-base-url');
    inputApiKeyEl = document.getElementById('setting-api-key');
    btnToggleKeyEl = document.getElementById('btn-toggle-key');
    inputEnabledEl = document.getElementById('setting-enabled');
    inputRemarkEl = document.getElementById('setting-remark');
    inputTavilyKeyEl = document.getElementById('setting-tavily-key');
    testResultEl = document.getElementById('test-result');

    footerEl = document.getElementById('settings-footer');
    btnCancelEditorEl = document.getElementById('btn-cancel-editor');
    btnTestEl = document.getElementById('btn-test-connection');
    btnSaveEl = document.getElementById('btn-save-settings');
    btnCloseModalFooterEl = document.getElementById('btn-close-modal-footer');

    bindEvents();
    migrateLegacySettings();
    syncActiveConfigToSettings();
  }

  function bindEvents() {
    if (btnCloseEl) btnCloseEl.addEventListener('click', close);
    if (btnCloseModalFooterEl) btnCloseModalFooterEl.addEventListener('click', close);
    if (overlayEl) {
      overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl) close();
      });
    }

    if (btnAddConfigEl) {
      btnAddConfigEl.addEventListener('click', () => openEditor(null));
    }

    if (btnBackEl) {
      btnBackEl.addEventListener('click', () => switchView('list'));
    }

    if (btnCancelEditorEl) {
      btnCancelEditorEl.addEventListener('click', () => switchView('list'));
    }

    if (selectProviderEl) {
      selectProviderEl.addEventListener('change', handleProviderChange);
    }

    if (btnToggleKeyEl) {
      btnToggleKeyEl.addEventListener('click', toggleApiKeyVisibility);
    }

    if (btnTestEl) {
      btnTestEl.addEventListener('click', handleTestConnection);
    }

    if (btnSaveEl) {
      btnSaveEl.addEventListener('click', handleSaveConfig);
    }
  }

  function handleProviderChange() {
    const val = selectProviderEl.value;
    const preset = PROVIDER_PRESETS[val] || PROVIDER_PRESETS['自定义'];

    // Update Base URL if empty or matching another preset default
    if (preset.baseUrl) {
      inputBaseUrlEl.value = preset.baseUrl;
    } else if (val === '自定义') {
      inputBaseUrlEl.value = '';
    }

    // Update Model if empty
    if (preset.defaultModel && (!inputModelEl.value || Object.values(PROVIDER_PRESETS).some(p => p.models.includes(inputModelEl.value)))) {
      inputModelEl.value = preset.defaultModel;
    }

    renderModelQuickTags(preset.models);
  }

  function renderModelQuickTags(models) {
    if (!modelTagsEl) return;
    if (!models || models.length === 0) {
      modelTagsEl.innerHTML = '';
      return;
    }

    modelTagsEl.innerHTML = models.map(m => `
      <button type="button" class="model-tag ${inputModelEl.value === m ? 'active' : ''}" data-model="${m}">${m}</button>
    `).join('');

    modelTagsEl.querySelectorAll('.model-tag').forEach(tagBtn => {
      tagBtn.addEventListener('click', (e) => {
        e.preventDefault();
        inputModelEl.value = tagBtn.dataset.model;
        modelTagsEl.querySelectorAll('.model-tag').forEach(b => b.classList.remove('active'));
        tagBtn.classList.add('active');
      });
    });
  }

  function toggleApiKeyVisibility() {
    const iconEye = btnToggleKeyEl.querySelector('.icon-eye');
    const iconEyeOff = btnToggleKeyEl.querySelector('.icon-eye-off');

    if (inputApiKeyEl.type === 'password') {
      inputApiKeyEl.type = 'text';
      if (iconEye) iconEye.classList.add('hidden');
      if (iconEyeOff) iconEyeOff.classList.remove('hidden');
    } else {
      inputApiKeyEl.type = 'password';
      if (iconEye) iconEye.classList.remove('hidden');
      if (iconEyeOff) iconEyeOff.classList.add('hidden');
    }
  }

  function switchView(view) {
    currentView = view;
    if (view === 'list') {
      if (titleEl) titleEl.textContent = '大模型 API 设置';
      if (subtitleEl) subtitleEl.textContent = '管理并选择您的 AI 模型服务商与 API 凭证';
      if (btnBackEl) btnBackEl.classList.add('hidden');
      if (listSectionEl) listSectionEl.classList.remove('hidden');
      if (editorSectionEl) editorSectionEl.classList.add('hidden');

      if (btnCancelEditorEl) btnCancelEditorEl.style.display = 'none';
      if (btnTestEl) btnTestEl.style.display = 'none';
      if (btnSaveEl) btnSaveEl.style.display = 'none';
      if (btnCloseModalFooterEl) btnCloseModalFooterEl.style.display = 'inline-flex';

      renderList();
    } else if (view === 'editor') {
      if (titleEl) titleEl.textContent = currentEditingId ? '编辑 API 配置' : '新增 API 配置';
      if (subtitleEl) subtitleEl.textContent = '配置 OpenAI 兼容协议的服务商凭证及 Base URL';
      if (btnBackEl) btnBackEl.classList.remove('hidden');
      if (listSectionEl) listSectionEl.classList.add('hidden');
      if (editorSectionEl) editorSectionEl.classList.remove('hidden');

      if (btnCancelEditorEl) btnCancelEditorEl.style.display = 'inline-flex';
      if (btnTestEl) btnTestEl.style.display = 'inline-flex';
      if (btnSaveEl) btnSaveEl.style.display = 'inline-flex';
      if (btnCloseModalFooterEl) btnCloseModalFooterEl.style.display = 'none';

      hideTestResult();
    }
  }

  function renderList() {
    const configs = getConfigs();
    const activeId = getActiveConfigId();

    if (configs.length === 0) {
      if (listContainerEl) listContainerEl.innerHTML = '';
      if (emptyStateEl) emptyStateEl.classList.remove('hidden');
      return;
    }

    if (emptyStateEl) emptyStateEl.classList.add('hidden');

    if (listContainerEl) {
      listContainerEl.innerHTML = configs.map(config => {
        const isActive = config.id === activeId;
        const preset = PROVIDER_PRESETS[config.provider] || PROVIDER_PRESETS['自定义'];
        const maskedKey = config.apiKey ? (config.apiKey.length > 10 ? `${config.apiKey.slice(0, 4)}••••••••${config.apiKey.slice(-4)}` : '••••••••') : '未配置 Key';
        const displayRemark = config.remark || `${config.provider} (${config.model || '默认'})`;

        return `
          <div class="config-card ${isActive ? 'active' : ''}" data-id="${config.id}">
            <div class="card-header">
              <div class="provider-badge" style="color: ${preset.color}">
                <span class="provider-icon">${preset.icon}</span>
                <span class="provider-name">${config.provider}</span>
              </div>
              <div class="card-status-badges">
                ${isActive ? '<span class="status-tag active"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 当前使用</span>' : ''}
                <label class="toggle-switch-sm" title="启用/停用">
                  <input type="checkbox" class="toggle-config-enabled" data-id="${config.id}" ${config.enabled ? 'checked' : ''}>
                  <span class="toggle-slider-sm"></span>
                </label>
              </div>
            </div>

            <div class="card-title">${escapeHtml(displayRemark)}</div>

            <div class="card-meta">
              <div class="meta-item"><span class="meta-label">模型</span> <code class="meta-code">${escapeHtml(config.model || '默认')}</code></div>
              <div class="meta-item"><span class="meta-label">地址</span> <span class="meta-url" title="${escapeHtml(config.baseUrl || '服务器默认')}">${escapeHtml(truncateUrl(config.baseUrl || '服务器默认'))}</span></div>
              <div class="meta-item"><span class="meta-label">凭证</span> <span class="meta-key">${maskedKey}</span></div>
            </div>

            <div class="card-actions">
              ${!isActive ? `<button type="button" class="btn-card-action btn-activate" data-id="${config.id}">使用此配置</button>` : `<span class="active-indicator-text">已激活</span>`}
              <div class="action-right">
                <button type="button" class="btn-card-icon btn-test-card" data-id="${config.id}" title="测试连接">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </button>
                <button type="button" class="btn-card-icon btn-edit-card" data-id="${config.id}" title="编辑">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button type="button" class="btn-card-icon btn-delete-card danger" data-id="${config.id}" title="删除">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Add listeners to list buttons
      listContainerEl.querySelectorAll('.btn-activate').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          setActiveConfigId(btn.dataset.id);
          renderList();
          showToast('已切换至该大模型配置');
        });
      });

      listContainerEl.querySelectorAll('.btn-edit-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditor(btn.dataset.id);
        });
      });

      listContainerEl.querySelectorAll('.btn-delete-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteConfig(btn.dataset.id);
        });
      });

      listContainerEl.querySelectorAll('.btn-test-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          testSingleCardConnection(btn.dataset.id, btn);
        });
      });

      listContainerEl.querySelectorAll('.toggle-config-enabled').forEach(chk => {
        chk.addEventListener('change', (e) => {
          e.stopPropagation();
          toggleConfigEnabled(chk.dataset.id, chk.checked);
        });
      });
    }
  }

  function toggleConfigEnabled(id, enabled) {
    let configs = getConfigs();
    const target = configs.find(c => c.id === id);
    if (target) {
      target.enabled = enabled;
      saveConfigs(configs);
      syncActiveConfigToSettings();
    }
  }

  function deleteConfig(id) {
    let configs = getConfigs();
    configs = configs.filter(c => c.id !== id);
    saveConfigs(configs);
    if (getActiveConfigId() === id) {
      const nextActive = configs.find(c => c.enabled) || configs[0] || null;
      setActiveConfigId(nextActive ? nextActive.id : null);
    } else {
      syncActiveConfigToSettings();
    }
    renderList();
    showToast('配置已删除');
  }

  function openEditor(id = null) {
    currentEditingId = id;
    const configs = getConfigs();
    const editingConfig = id ? configs.find(c => c.id === id) : null;

    if (editingConfig) {
      inputIdEl.value = editingConfig.id;
      selectProviderEl.value = editingConfig.provider || 'OpenAI';
      inputModelEl.value = editingConfig.model || '';
      inputBaseUrlEl.value = editingConfig.baseUrl || '';
      inputApiKeyEl.value = editingConfig.apiKey || '';
      inputEnabledEl.checked = editingConfig.enabled !== false;
      inputRemarkEl.value = editingConfig.remark || '';
      if (inputTavilyKeyEl) inputTavilyKeyEl.value = editingConfig.tavilyApiKey || '';
    } else {
      // New config defaults
      inputIdEl.value = '';
      selectProviderEl.value = 'DeepSeek';
      const preset = PROVIDER_PRESETS['DeepSeek'];
      inputModelEl.value = preset.defaultModel;
      inputBaseUrlEl.value = preset.baseUrl;
      inputApiKeyEl.value = '';
      inputEnabledEl.checked = true;
      inputRemarkEl.value = '';
      if (inputTavilyKeyEl) inputTavilyKeyEl.value = '';
    }

    const preset = PROVIDER_PRESETS[selectProviderEl.value] || PROVIDER_PRESETS['自定义'];
    renderModelQuickTags(preset.models);
    switchView('editor');
  }

  function handleSaveConfig() {
    const provider = selectProviderEl.value;
    const model = inputModelEl.value.trim();
    const baseUrl = inputBaseUrlEl.value.trim();
    const apiKey = inputApiKeyEl.value.trim();
    const enabled = inputEnabledEl.checked;
    const remark = inputRemarkEl.value.trim();
    const tavilyApiKey = inputTavilyKeyEl ? inputTavilyKeyEl.value.trim() : '';
    const id = inputIdEl.value;

    if (!apiKey) {
      showTestResult(false, '请输入 API Key');
      showToast('请先填写 API Key');
      return;
    }

    let configs = getConfigs();

    if (id) {
      // Update
      const idx = configs.findIndex(c => c.id === id);
      if (idx >= 0) {
        configs[idx] = { ...configs[idx], provider, model, baseUrl, apiKey, tavilyApiKey, enabled, remark };
      }
    } else {
      // New
      const newId = 'cfg_' + Date.now();
      configs.push({ id: newId, provider, model, baseUrl, apiKey, tavilyApiKey, enabled, remark });
      currentEditingId = newId;
    }

    saveConfigs(configs);

    // If enabled or no active config, set active
    if (enabled || !getActiveConfigId()) {
      setActiveConfigId(currentEditingId || id || configs[configs.length - 1].id);
    } else {
      syncActiveConfigToSettings();
    }

    showToast('配置已保存并生效');
    switchView('list');
  }

  async function handleTestConnection() {
    const apiKey = inputApiKeyEl.value.trim();
    const baseUrl = inputBaseUrlEl.value.trim();
    const model = inputModelEl.value.trim();

    if (!apiKey) {
      showTestResult(false, '请先输入 API Key 再进行测试');
      return;
    }

    showTestLoading(true);

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, baseUrl, model })
      });

      const data = await res.json();
      showTestLoading(false);

      if (res.ok && data.success) {
        showTestResult(true, `连接成功！模型 "${data.model}" 响应正常 · 耗时 ${data.latency}ms`);
      } else {
        showTestResult(false, data.message || '连接失败，请检查配置');
      }
    } catch (err) {
      showTestLoading(false);
      showTestResult(false, '网络请求失败，请确保服务器正在正常运行');
    }
  }

  async function testSingleCardConnection(id, btnEl) {
    const configs = getConfigs();
    const config = configs.find(c => c.id === id);
    if (!config) return;

    const originalHTML = btnEl.innerHTML;
    btnEl.innerHTML = `<span class="btn-spinner"></span>`;
    btnEl.disabled = true;

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model
        })
      });

      const data = await res.json();
      btnEl.innerHTML = originalHTML;
      btnEl.disabled = false;

      if (res.ok && data.success) {
        showToast(`⚡ ${config.provider} 连接成功 (${data.latency}ms)`);
      } else {
        showToast(`❌ 连接失败: ${data.message || '格式错误'}`);
      }
    } catch (e) {
      btnEl.innerHTML = originalHTML;
      btnEl.disabled = false;
      showToast('❌ 网络错误，未响应');
    }
  }

  function showTestLoading(isLoading) {
    if (!btnTestEl) return;
    const labelEl = btnTestEl.querySelector('.btn-test-label');
    const iconEl = btnTestEl.querySelector('.btn-test-icon');

    if (isLoading) {
      btnTestEl.disabled = true;
      if (labelEl) labelEl.textContent = '测试中...';
      if (iconEl) iconEl.classList.add('spinning');
    } else {
      btnTestEl.disabled = false;
      if (labelEl) labelEl.textContent = '测试连接';
      if (iconEl) iconEl.classList.remove('spinning');
    }
  }

  function showTestResult(isSuccess, message) {
    if (!testResultEl) return;
    testResultEl.classList.remove('hidden', 'success', 'error');
    testResultEl.classList.add(isSuccess ? 'success' : 'error');

    const icon = isSuccess
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    testResultEl.innerHTML = `
      <span class="test-icon">${icon}</span>
      <span class="test-msg">${escapeHtml(message)}</span>
    `;
  }

  function hideTestResult() {
    if (testResultEl) {
      testResultEl.classList.add('hidden');
      testResultEl.innerHTML = '';
    }
  }

  function open() {
    initDOM();
    switchView('list');
    if (overlayEl) overlayEl.classList.remove('hidden');
  }

  function close() {
    if (overlayEl) overlayEl.classList.add('hidden');
  }

  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function truncateUrl(url) {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init: initDOM,
    open,
    close,
    syncActiveConfigToSettings
  };
})();
