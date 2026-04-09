// =============================================
// Export Module — Generate Markdown design doc
// =============================================

function generateMarkdown(session) {
  if (!session || !session.messages || session.messages.length === 0) {
    return '# 设计文档\n\n暂无内容。';
  }

  const title = session.title || '设计文档';
  const date = new Date(session.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  let md = `# ${title}\n\n`;
  md += `> 生成时间：${date}  \n`;
  md += `> 工具：BrainStorm AI 头脑风暴\n\n---\n\n`;

  // Extract only assistant messages as the design content
  const assistantMessages = session.messages.filter(m => m.role === 'assistant');

  if (assistantMessages.length === 0) {
    md += '暂无 AI 回复内容。\n';
    return md;
  }

  // Find the last long message (likely the final design doc)
  const lastLongMsg = [...assistantMessages].reverse().find(m => m.content.length > 500);

  if (lastLongMsg) {
    md += '## 设计方案\n\n';
    md += cleanStepMarkers(lastLongMsg.content);
    md += '\n\n---\n\n';
  }

  // Append conversation summary
  md += '## 对话记录\n\n';
  session.messages.forEach(msg => {
    const role = msg.role === 'user' ? '👤 用户' : '🤖 AI';
    const content = cleanStepMarkers(msg.content);
    md += `### ${role}\n\n${content}\n\n---\n\n`;
  });

  return md;
}

function cleanStepMarkers(text) {
  return text.replace(/<!--\s*step:\s*\d\s*-->/g, '').trim();
}

function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'design-doc.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

export const Export = {
  generateMarkdown,
  downloadMarkdown,
  copyToClipboard,
};
