# Brainstorming

一个面向产品设计与软件研发场景的结构化头脑风暴 Agent Harness。它通过一套明确的对话流程，把模糊想法逐步收敛为可评审、可导出的设计规格文档。

> 项目目前处于早期阶段，欢迎试用、反馈与共建。

## DeepSeek Harness 内测招募

如果你是 **Agent Harness 相关开源项目的开发者**，希望参加 **DeepSeek Harness** 的内测，可以回复或私信联系我。请附上：

- GitHub ID
- 一个或多个开源代表作及链接
- 你正在探索的 Agent Harness 方向（可选）

也可以通过本仓库的 [Issues](https://github.com/Winsaney/brainstorming/issues) 留言。

## 为什么做这个项目

生成代码并不总是最难的环节。很多项目真正的问题发生在实施之前：目标没有说清、约束没有识别、方案没有比较、设计没有经过确认，Agent 就直接开始写代码。

Brainstorming 为创意工作增加了一层轻量 Harness，通过阶段、规则、状态和交互界面约束 Agent 的行为，让它先理解问题，再形成方案，最后输出规格。

## 工作流程

项目将一次头脑风暴拆分为五个阶段：

1. **探索**：了解背景、目标、约束与成功标准，每次只澄清一个关键问题。
2. **方案**：提出 2–3 种可选路径，说明取舍并给出推荐。
3. **设计**：逐步展开架构、组件、数据流、接口与异常处理。
4. **审核**：检查遗漏、矛盾、模糊表述和不必要的范围。
5. **完成**：整理并导出 Markdown 设计规格文档。

界面会根据模型回复中的阶段标记同步展示当前进度。

## 功能特性

- 结构化五阶段对话流程
- OpenAI-compatible API 接入
- 流式响应（Server-Sent Events）
- 多模型配置集管理与快速切换
- 多会话创建、切换、删除与本地持久化
- 自动追踪头脑风暴阶段
- 设计结果预览、复制与 Markdown 下载
- 桌面端与移动端响应式界面
- 中文输入法兼容

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- 一个兼容 OpenAI Chat Completions API 的模型服务

### 安装

```bash
git clone https://github.com/Winsaney/brainstorming.git
cd brainstorming
npm install
cp .env.example .env
```

编辑 `.env`：

```env
AI_API_KEY=your-api-key-here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o
PORT=3000
```

启动服务：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 模型配置

Brainstorming 支持兼容 OpenAI Chat Completions 接口的模型服务。你可以通过两种方式配置：

- **服务端配置**：在 `.env` 中设置默认 API Key、Base URL 和模型名称。
- **浏览器配置**：点击界面左下角的“大模型设置”，创建并切换多个配置集。

如果 Base URL 以 `/chat/completions` 结尾，服务端会自动移除该路径；建议直接填写 API 根地址。

> 安全提示：浏览器配置会保存在当前浏览器的 `localStorage` 中，并随聊天请求发送到本项目服务端。共享设备或公网部署时，建议使用服务端环境变量，不要在浏览器中保存敏感凭证，也不要提交真实的 `.env` 文件。

## 项目结构

```text
.
├── public/
│   ├── index.html       # 应用页面
│   ├── index.css        # 响应式界面样式
│   ├── app.js           # 前端入口与交互
│   ├── chat.js          # 对话与流式响应
│   ├── sessions.js      # 会话管理与持久化
│   ├── steps.js         # 阶段状态管理
│   └── export.js        # Markdown 规格导出
├── server.js            # Express 服务与 Agent 系统提示词
├── package.json
└── .env.example
```

## 技术栈

- Node.js
- Express
- OpenAI JavaScript SDK
- 原生 HTML、CSS 与 JavaScript
- Marked（Markdown 渲染）
- SSE（流式输出）
- LocalStorage（会话与配置持久化）

## 适用场景

- 新产品或新功能的需求澄清
- Agent、Web 应用与内部工具的方案设计
- 技术选型与架构方案比较
- 从创意讨论生成 PRD、设计规格或实施前文档
- 研究不同模型在受约束 Agent 工作流中的表现

## 当前边界

- 会话与模型配置仅保存在当前浏览器中，暂不支持跨设备同步。
- 当前 Harness 主要由系统提示词、阶段标记和前端状态共同实现。
- 项目输出是设计规格，不直接执行代码修改或部署操作。
- 不同 OpenAI-compatible 服务对参数和流式协议的支持可能存在差异。

## 参与贡献

欢迎提交 Issue 或 Pull Request，尤其期待以下方向：

- 更可靠的阶段识别与状态机
- 可组合的 Harness / Skill / Prompt 模块
- 规格文档模板与质量评估
- 多模型兼容性与评测
- 会话导入、导出与持久化
- 测试、可观测性与安全改进
- Agent Harness 的真实项目案例

提交 PR 前，请尽量说明问题背景、设计取舍、验证方式以及界面变化截图（如适用）。

## 反馈

如果你发现问题或有功能建议，请前往 [GitHub Issues](https://github.com/Winsaney/brainstorming/issues)。

---

如果这个项目对你有帮助，欢迎 Star。也欢迎 Agent Harness 开发者联系参与 DeepSeek Harness 内测。
