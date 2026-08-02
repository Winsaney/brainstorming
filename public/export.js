// =============================================
// Export Module — Generate Markdown design doc
// =============================================

function generateMarkdown(session) {
  if (!session || !session.messages || session.messages.length === 0) {
    return '# 设计规格文档\n\n暂无内容。';
  }

  // Extract only assistant messages
  const assistantMessages = session.messages.filter(m => m.role === 'assistant');

  if (assistantMessages.length === 0) {
    return '# 设计规格文档\n\n暂无 AI 生成的文档内容。';
  }

  // 优先查找包含阶段 5 标记或以大标题开头的末条回复
  const reverseAssistantMsgs = [...assistantMessages].reverse();
  const step5Msg = reverseAssistantMsgs.find(m => m.content.includes('<!-- step:5 -->'));
  const headerMsg = reverseAssistantMsgs.find(m => m.content.includes('# ') && m.content.length > 150);
  const targetMsg = step5Msg || headerMsg || reverseAssistantMsgs[0];

  return extractFinalDoc(targetMsg.content);
}

function extractFinalDoc(text) {
  let clean = cleanStepMarkers(text);

  // 如果大标题 # 之前有开场客套话（例如："完美的资料！现在我将整合所有信息..."），自动裁切掉开场白
  const headingIndex = clean.indexOf('# ');
  if (headingIndex > 0) {
    const introText = clean.slice(0, headingIndex).trim();
    if (introText.length < 300) {
      clean = clean.slice(headingIndex).trim();
    }
  }

  return clean;
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
