// =============================================
// Chat Module — Send, receive, stream, render
// =============================================

import { Sessions } from './sessions.js';
import { Steps } from './steps.js';

let isStreaming = false;
let abortController = null;

function getConfig() {
  try {
    const raw = localStorage.getItem('brainstorm_settings');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ===== Markdown Rendering =====

function renderMarkdown(text) {
  // Remove step markers before rendering
  const clean = text.replace(/<!--\s*step:\s*\d\s*-->/g, '');
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    return marked.parse(clean);
  }
  // Fallback: basic escaping
  return clean.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

// ===== Message Rendering =====

function createMessageEl(role, content, streaming = false) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'assistant' ? 'AI' : '你';

  const body = document.createElement('div');
  body.className = 'message-body';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  if (streaming) {
    contentEl.classList.add('streaming-cursor');
    contentEl.innerHTML = '';
  } else {
    contentEl.innerHTML = role === 'assistant' ? renderMarkdown(content) : escapeHtml(content);
  }

  body.appendChild(contentEl);
  msg.appendChild(avatar);
  msg.appendChild(body);

  return { msg, contentEl };
}

function createTypingIndicator() {
  const msg = document.createElement('div');
  msg.className = 'message assistant';
  msg.id = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = 'AI';

  const body = document.createElement('div');
  body.className = 'message-body';

  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  body.appendChild(typing);
  msg.appendChild(avatar);
  msg.appendChild(body);

  return msg;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function scrollToBottom() {
  const chatArea = document.getElementById('chat-area');
  if (chatArea) {
    requestAnimationFrame(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    });
  }
}

// ===== Render All Messages =====

function renderMessages(messages) {
  const container = document.getElementById('chat-messages');
  const welcome = document.getElementById('welcome-screen');

  if (!messages || messages.length === 0) {
    container.innerHTML = '';
    if (welcome) welcome.style.display = '';
    return;
  }

  if (welcome) welcome.style.display = 'none';
  container.innerHTML = '';

  messages.forEach(msg => {
    const { msg: el } = createMessageEl(msg.role, msg.content);
    container.appendChild(el);
  });

  scrollToBottom();
}

// ===== Send Message =====

async function sendMessage(content) {
  if (isStreaming || !content.trim()) return;

  const session = Sessions.getActiveSession();
  if (!session) return;

  const welcome = document.getElementById('welcome-screen');
  if (welcome) welcome.style.display = 'none';

  // Add user message
  session.messages.push({ role: 'user', content: content.trim() });
  Sessions.updateSession({ messages: session.messages });

  const container = document.getElementById('chat-messages');
  const { msg: userEl } = createMessageEl('user', content.trim());
  container.appendChild(userEl);
  scrollToBottom();

  // Show typing indicator
  const typingEl = createTypingIndicator();
  container.appendChild(typingEl);
  scrollToBottom();

  // Prepare API call
  isStreaming = true;
  updateSendButton();
  abortController = new AbortController();

  const config = getConfig();
  const apiMessages = session.messages.map(m => ({ role: m.role, content: m.content }));

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages, config }),
      signal: abortController.signal,
    });

    // Remove typing indicator
    typingEl.remove();

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      showError(err.error || `HTTP ${res.status}`);
      isStreaming = false;
      updateSendButton();
      return;
    }

    // Create streaming message element
    const { msg: assistantEl, contentEl } = createMessageEl('assistant', '', true);
    container.appendChild(assistantEl);
    scrollToBottom();

    // Stream response
    let fullContent = '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();

        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            showError(parsed.error);
            continue;
          }
          if (parsed.content) {
            fullContent += parsed.content;
            contentEl.innerHTML = renderMarkdown(fullContent);
            scrollToBottom();
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    // Finalize
    contentEl.classList.remove('streaming-cursor');
    contentEl.innerHTML = renderMarkdown(fullContent);

    // Save assistant message
    session.messages.push({ role: 'assistant', content: fullContent });

    // Detect step change
    const step = Steps.detectStep(fullContent);
    if (step !== null) {
      Steps.setStep(step);
      session.step = step;
    }

    Sessions.updateSession({ messages: session.messages, step: session.step });

  } catch (err) {
    typingEl.remove();
    if (err.name !== 'AbortError') {
      showError(err.message);
    }
  } finally {
    isStreaming = false;
    abortController = null;
    updateSendButton();
  }
}

function showError(message) {
  const container = document.getElementById('chat-messages');
  const errorEl = document.createElement('div');
  errorEl.className = 'message error assistant';
  errorEl.innerHTML = `
    <div class="message-avatar" style="color: var(--error); background: transparent;">!</div>
    <div class="message-body">
      <div class="message-content">
        ⚠️ ${escapeHtml(message)}
      </div>
    </div>
  `;
  container.appendChild(errorEl);
  scrollToBottom();
}

function stopStreaming() {
  if (abortController) {
    abortController.abort();
  }
}

function updateSendButton() {
  const btn = document.getElementById('btn-send');
  const input = document.getElementById('chat-input');
  if (btn) {
    btn.disabled = isStreaming || !input?.value.trim();
  }
}

function getIsStreaming() {
  return isStreaming;
}

export const Chat = {
  sendMessage,
  renderMessages,
  stopStreaming,
  updateSendButton,
  getIsStreaming,
  scrollToBottom,
};
