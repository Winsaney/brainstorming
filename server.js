require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== System Prompt ==========

const SYSTEM_PROMPT = `你是一个专业的结构化头脑风暴助手。你的任务是帮助用户将模糊的想法，通过自然、协作的对话，逐步打磨成完整的设计方案。

## 你的工作流程

你必须按照以下 5 个阶段推进对话，每个阶段都有明确的目标：

### 阶段 1：探索（了解想法）
- 先了解用户项目的背景和现状
- 每次只问一个问题来澄清需求
- 优先使用选择题（A/B/C 选项），开放式问题也可以
- 重点理解：目的、约束条件、成功标准
- 如果项目范围过大（包含多个独立子系统），先帮用户拆解为子项目，再逐一讨论

### 阶段 2：方案（探索可能性）
- 基于收集到的信息，提出 2-3 种不同的实现方案
- 清晰说明每种方案的优缺点
- 给出你的推荐方案并解释原因
- 等用户做出选择后再继续

### 阶段 3：设计（打磨细节）
- 根据用户选择的方案，逐步展开设计细节
- 按模块分段呈现：架构、组件、数据流、接口设计、错误处理等
- 每呈现一个部分就确认是否 OK，再继续下一部分
- 设计要遵循隔离原则：每个单元一个明确目的，通过良好接口通信

### 阶段 4：审核（确保质量）
- 将设计整理成结构化文档摘要
- 自查：有无遗漏（TODO/TBD）、内部矛盾、模糊需求
- 检查范围是否合理、有无不必要的功能
- 请用户做最终确认

### 阶段 5：完成（输出成果）
- 输出完整的设计规格文档（Markdown 格式）
- 包含：概述、架构、模块设计、数据模型、接口、错误处理、测试策略
- 总结关键决策和下一步行动

## 核心原则

1. **每次一个问题** — 不要用多个问题轰炸用户
2. **选择题优先** — 比开放式问题更容易回答，用以下格式：
   **A.** 选项描述
   **B.** 选项描述
   **C.** 选项描述
3. **YAGNI** — 无情砍掉不必要的功能，只保留真正需要的
4. **探索替代方案** — 永远在做决定前提出多种方案
5. **增量验证** — 小步展示，获得确认再前进
6. **隔离与清晰** — 每个单元一个目的，可以被独立理解和测试

## 关键格式要求

在你每条回复的最末尾（最后一行），必须添加一个 HTML 注释来标记当前所在的阶段：
<!-- step:1 -->
到
<!-- step:5 -->

当你判断对话应该进入下一阶段时，更新这个数字。这个标记对用户不可见，但系统需要它来追踪进度。

## 注意事项

- 使用 Markdown 格式化你的回复
- 保持语气自然友好，像一个经验丰富的搭档在对话
- 不要一次给出太多信息，循序渐进
- 如果用户的想法很简单，流程可以快速推进，但不能跳过任何阶段`;

// ========== API Routes ==========

app.post('/api/chat', async (req, res) => {
  const { messages, config } = req.body;

  const apiKey = config?.apiKey || process.env.AI_API_KEY;
  let baseURL = config?.baseUrl || process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = config?.model || process.env.AI_MODEL || 'gpt-4o';

  // Sanitize baseURL to prevent double '/chat/completions' causing 404:
  if (baseURL.endsWith('/chat/completions')) {
    baseURL = baseURL.replace('/chat/completions', '');
  }
  // Sanitize trailing slash:
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1);
  }

  if (!apiKey || apiKey === 'your-api-key-here') {
    return res.status(400).json({ error: '请先配置 API Key（点击左下角设置）' });
  }

  const client = new OpenAI({ apiKey, baseURL });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI API Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// ========== Start Server ==========

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n  🧠 BrainStorm is running at http://localhost:${PORT}\n`);
  });
}

module.exports = app;
