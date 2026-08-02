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

function sanitizeBaseUrl(url) {
  let u = (url || 'https://api.openai.com/v1').trim();

  // Strip trailing /chat/completions or /chat/completions/
  if (u.endsWith('/chat/completions')) {
    u = u.replace(/\/chat\/completions$/, '');
  } else if (u.endsWith('/chat/completions/')) {
    u = u.replace(/\/chat\/completions\/$/, '');
  }

  // Strip trailing slash
  if (u.endsWith('/')) {
    u = u.slice(0, -1);
  }

  // Auto-fix missing /v1 for common endpoints if missing
  if (u === 'https://integrate.api.nvidia.com') {
    u = 'https://integrate.api.nvidia.com/v1';
  } else if (u === 'https://token.sensenova.cn') {
    u = 'https://token.sensenova.cn/v1';
  } else if (u === 'https://api.openai.com') {
    u = 'https://api.openai.com/v1';
  } else if (u === 'https://api.deepseek.com/v1') {
    u = 'https://api.deepseek.com';
  }

  return u;
}

// ========== Tool Use & Web Search Engine ==========

const WEB_SEARCH_TOOL = {
  type: 'function',
  function: {
    name: 'web_search',
    description: '当用户寻求最新的实时信息、背景资料、技术文档、版本发布或事实校验时调用此工具进行网页检索。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '用于搜索引擎检索的关键词或关键短语',
        },
      },
      required: ['query'],
    },
  },
};

async function performWebSearch(query, config) {
  const tavilyKey = config?.tavilyApiKey || process.env.TAVILY_API_KEY;

  // 1. Tavily API (如果配置了 Key)
  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tavilyKey, query, max_results: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map(r => ({
            title: r.title,
            snippet: r.content,
            url: r.url,
          }));
        }
      }
    } catch (e) {
      console.warn('Tavily search error, fallback to DuckDuckGo:', e.message);
    }
  }

  // 2. DuckDuckGo 免 Key 检索
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });
    const html = await res.text();
    const results = [];
    const linkRegex = /<a class="result__a"[^>]*href="([^"]+)">([\s\S]*?)<\/a>/g;
    const snippetRegex = /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null && results.length < 5) {
      let rawUrl = linkMatch[1];
      let url = rawUrl;
      const uMatch = rawUrl.match(/uddg=([^&]+)/);
      if (uMatch) url = decodeURIComponent(uMatch[1]);
      const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      results.push({ title, url, snippet: '' });
    }

    let snippetMatch;
    let i = 0;
    while ((snippetMatch = snippetRegex.exec(html)) !== null && i < results.length) {
      results[i].snippet = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
      i++;
    }

    const filtered = results.filter(r => r.title && r.snippet);
    if (filtered.length > 0) return filtered;
  } catch (err) {
    console.error('DuckDuckGo search error:', err.message);
  }

  return [{ title: '网页搜索未获取到直接结果', snippet: `关于 "${query}" 的未匹配到明确的开放网页摘要。`, url: '' }];
}

app.post('/api/chat', async (req, res) => {
  const { messages, config } = req.body;

  const apiKey = config?.apiKey || process.env.AI_API_KEY;
  const baseURL = sanitizeBaseUrl(config?.baseUrl || process.env.AI_BASE_URL);
  const model = config?.model || process.env.AI_MODEL || 'gpt-4o';
  const enableWebSearch = Boolean(config?.enableWebSearch);

  if (!apiKey || apiKey === 'your-api-key-here') {
    return res.status(400).json({ error: '请先配置 API Key（点击左下角设置）' });
  }

  const client = new OpenAI({ apiKey, baseURL, timeout: 45000 });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const fullMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

  try {
    if (enableWebSearch) {
      // 检查模型是否需要传厂商原生的 extra_body 参数 (如 Qwen)
      const extraBody = {};
      if (model.toLowerCase().includes('qwen') || config?.provider === '通义千问 (Qwen)') {
        extraBody.enable_search = true;
      }

      // 第一轮请求：加入 tools 判断是否需要搜索
      let firstRes;
      try {
        firstRes = await client.chat.completions.create({
          model,
          messages: fullMessages,
          tools: [WEB_SEARCH_TOOL],
          tool_choice: 'auto',
          ...(Object.keys(extraBody).length ? { extra_body: extraBody } : {}),
        });
      } catch (toolErr) {
        console.warn('Tool calling not directly supported by model or endpoint, falling back to streaming:', toolErr.message);
      }

      const choiceMsg = firstRes?.choices?.[0]?.message;
      if (choiceMsg?.tool_calls && choiceMsg.tool_calls.length > 0) {
        const toolCall = choiceMsg.tool_calls[0];
        if (toolCall.function?.name === 'web_search') {
          let query = '';
          try {
            const args = JSON.parse(toolCall.function.arguments || '{}');
            query = args.query || '';
          } catch (e) {
            query = toolCall.function.arguments || '';
          }

          // 通知前端：开始工具调用
          res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: 'web_search', query })}\n\n`);

          const searchResults = await performWebSearch(query, config);

          // 通知前端：工具调用完成
          res.write(`data: ${JSON.stringify({ type: 'tool_end', tool: 'web_search', query, results: searchResults })}\n\n`);

          // 构造包含 tool 调用的消息历史
          const secondStream = await client.chat.completions.create({
            model,
            messages: [
              ...fullMessages,
              choiceMsg,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(searchResults),
              },
            ],
            stream: true,
          });

          for await (const chunk of secondStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }

          res.write('data: [DONE]\n\n');
          return res.end();
        }
      }

      // 如果模型第一轮有直接生成的文字文本，先输出
      if (choiceMsg?.content) {
        res.write(`data: ${JSON.stringify({ content: choiceMsg.content })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
    }

    // 默认或未发起工具调用的流式回答
    const stream = await client.chat.completions.create({
      model,
      messages: fullMessages,
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
    console.error('AI API Error:', err.status || '', err.message);
    if (!res.headersSent) {
      res.status(err.status || 500).json({ error: err.message || 'AI 服务请求失败' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// ========== Test Connection ==========

app.post('/api/test-connection', async (req, res) => {
  const { apiKey, baseUrl, model } = req.body;

  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API Key 不能为空' });
  }

  const sanitizedUrl = sanitizeBaseUrl(baseUrl);
  const testModel = model || 'gpt-4o';
  const client = new OpenAI({ apiKey, baseURL: sanitizedUrl, timeout: 15000 });
  const startTime = Date.now();

  try {
    await client.chat.completions.create({
      model: testModel,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    });

    const latency = Date.now() - startTime;
    res.json({
      success: true,
      message: '连接成功',
      model: testModel,
      latency,
    });
  } catch (err) {
    console.error('Test connection error:', err.status || '', err.message);

    let message = err.message || '连接失败';
    const status = err.status || err.statusCode;
    const code = err.code;

    if (status === 401 || status === 403) {
      if (sanitizedUrl.includes('nvidia')) {
        message = 'NVIDIA API Key 无效或未授权（注意：NVIDIA Key 需以 nvapi- 开头）';
      } else {
        message = 'API Key 无效或已过期 (401/403)';
      }
    } else if (status === 404) {
      message = `模型 "${testModel}" 或 Endpoint 路径不存在 (404)`;
    } else if (status === 422) {
      message = `请求格式或模型参数不受支持 (422 Unprocessable Entity)`;
    } else if (status === 429) {
      message = 'API 请求频率超限，请稍后再试 (429 Rate Limit)';
    } else if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
      message = `Base URL 无法连接或网络域名不存在: ${sanitizedUrl}`;
    } else if (code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT' || err.message.includes('timeout')) {
      message = '网络连接超时，请检查网络环境或 Base URL 是否正确';
    } else if (code === 'ERR_INVALID_URL') {
      message = 'Base URL 格式无效，请输入正确的 URL (如 https://integrate.api.nvidia.com/v1)';
    }

    res.status(status || 500).json({ success: false, message });
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
