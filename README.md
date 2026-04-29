<div align="center">
  <img src="./images/9router.png?1" alt="9Router Dashboard" width="800"/>

  # 9Router - AI 路由 & Token 节省器

  **用 RTK 节省 20-40% Token，自动降级到免费/低价模型，永不停码。**

  **连接所有 AI 编程工具（Claude Code、Cursor、Codex、Cline...）到 40+ 提供商 & 100+ 模型。**

  [![npm](https://img.shields.io/npm/v/9router.svg)](https://www.npmjs.com/package/9router)
  [![Downloads](https://img.shields.io/npm/dm/9router.svg)](https://www.npmjs.com/package/9router)
  [![License](https://img.shields.io/npm/l/9router.svg)](https://github.com/decolua/9router/blob/main/LICENSE)

  [🚀 快速开始](#快速开始) • [💡 功能](#核心功能) • [🌐 官网](https://9router.com)
</div>

---

## 它能做什么

- ✅ **RTK Token 节省** — 自动压缩 tool_result 内容，每请求节省 20-40% Token
- ✅ **智能三级降级** — 订阅 → 低价 → 免费，零中断
- ✅ **额度追踪** — 实时监控用量，到期前用完每一滴
- ✅ **多账户轮询** — 同提供商支持多账户自动切换
- ✅ **格式转换** — OpenAI ↔ Claude ↔ Gemini ↔ Cursor 等任意转换

## 工作原理

```
你的 CLI 工具 (Claude Code / Cursor / Codex / Cline...)
         │
         ▼ http://localhost:20128/v1
  ┌─────────────────────────────┐
  │  9Router (智能路由)          │
  │  • RTK Token 节省            │
  │  • 格式转换                  │
  │  • 额度追踪                  │
  │  • Token 自动刷新            │
  └──────────┬──────────────────┘
             │
    ├─→ 订阅层 (Claude Code / Codex / Copilot)
    │   ↓ 额度用完
    ├─→ 低价层 (GLM $0.6/1M / MiniMax $0.2/1M)
    │   ↓ 预算用完
    └─→ 免费层 (Kiro / OpenCode Free / Vertex)
```

## 快速开始

**方式一：npm 全局安装（推荐）**

```bash
npm install -g 9router
9router
```

打开 `http://localhost:20128/dashboard`，连接 **Kiro AI**（免费 Claude 无限用）或 **OpenCode Free**（无需登录），即可开始。

**方式二：源码运行**

```bash
git clone https://github.com/decolua/9router.git
cd 9router
./install.sh          # 安装 → 构建 → 注册全局命令
9router               # 随处启动
```

改代码后：`./install.sh rebuild && 9router`

**连接 CLI 工具：**

```
Endpoint: http://localhost:20128/v1
API Key:  [Dashboard 中复制]
Model:    kr/claude-sonnet-4.5
```

## 支持的 CLI 工具

Claude Code · OpenClaw · Codex · OpenCode · Cursor · Antigravity · Cline · Continue · Droid · Roo · Copilot · Kilo Code

## 支持的提供商

| 类型 | 提供商 |
|------|--------|
| **OAuth** | Claude Code · Codex · GitHub Copilot · Cursor |
| **免费** | Kiro AI（无限 Claude 4.5）· OpenCode Free（免登录）· Vertex AI（$300 额度） |
| **低价** | GLM（$0.6/1M）· MiniMax（$0.2/1M）· Kimi（$9/月） |
| **API Key** | OpenRouter · OpenAI · Anthropic · Gemini · DeepSeek · Groq · xAI · Mistral 等 40+ |

## 核心功能

| 功能 | 说明 |
|------|------|
| 🚀 RTK Token 节省 | 自动压缩 git diff / grep / ls 等输出，每请求省 20-40% |
| 🎯 三级智能降级 | 订阅 → 低价 → 免费，自动切换 |
| 📊 实时额度追踪 | 用量统计 + 重置倒计时 |
| 🔄 格式转换 | OpenAI / Claude / Gemini / Cursor / Kiro 任意互转 |
| 👥 多账户轮询 | 同提供商多账户负载均衡 |
| 🔄 Token 自动刷新 | OAuth 自动续期，无需手动登录 |
| 🎨 自定义组合 | 无限创建模型组合，个性化降级链 |
| 📝 请求日志 | 调试模式查看完整请求/响应 |
| 💾 云端同步 | 跨设备同步配置 |
| 📊 用量分析 | Token / 成本 / 趋势追踪 |
| 🌐 随处部署 | 本地 / VPS / Docker / Cloudflare Workers |

## 费用一览

| 层级 | 提供商 | 费用 | 重置周期 |
|------|--------|------|---------|
| 🚀 Token 节省 | RTK（内置）| **免费** | 永久开启 |
| 💳 订阅 | Claude Code / Codex / Copilot / Cursor | $10-200/月 | 5h / 周 / 月 |
| 💰 低价 | GLM / MiniMax / Kimi | $0.2-9/月 | 5h / 日 / 月 |
| 🆓 免费 | Kiro AI / OpenCode Free / Vertex | **$0** | 无限 |

💡 **省钱组合**：RTK + Kiro AI + OpenCode Free = **$0 + 省 20-40% Token**

## 常见场景

**场景一：最大化订阅价值**
```
组合：premium-coding
  1. cc/claude-opus-4-7    （订阅主力）
  2. glm/glm-5.1            （低价备用）
  3. kr/claude-sonnet-4.5   （免费兜底）
```

**场景二：零成本**
```
组合：free-forever
  1. kr/claude-sonnet-4.5   （免费 Claude）
  2. kr/glm-5               （免费 GLM）
  3. oc/<auto>              （免登录 OpenCode）
成本：$0/月
```

**场景三：7×24 不中断**
```
组合：always-on
  1. cc/claude-opus-4-7
  2. cx/gpt-5.5
  3. glm/glm-5.1
  4. minimax/MiniMax-M2.7
  5. kr/claude-sonnet-4.5
结果：5 层兜底 = 零停机
```

## 常见问题

**Q：Dashboard 显示费用很高？**  
A：那是「如果按付费 API 计算的参考费用」，实际使用免费提供商时费用为 $0。它是你的「省钱追踪器」。

**Q：9Router 会向我收费吗？**  
A：不会。9Router 是免费开源软件，永远不会收费。你只向订阅/低价提供商直接付费。

**Q：免费提供商真的无限吗？**  
A：是的。Kiro AI、OpenCode Free、Vertex（新用户 $300 额度）目前均为免费。9Router 仅负责路由，不额外收费。

## CLI 工具接入

**Claude Code：** `~/.claude/config.json` 中设置 `anthropic_api_base: http://localhost:20128/v1`

**Codex：** `export OPENAI_BASE_URL=http://localhost:20128`

**Cursor：** Settings → Models → Advanced → OpenAI API Base URL

**Cline / Continue / RooCode：** Provider: OpenAI Compatible，Base URL 同上

## 部署

```bash
# Docker
docker build -t 9router .
docker run -d -p 20128:20128 --env-file ./.env 9router

# VPS（先执行 ./install.sh）
9router --no-browser
```

关键环境变量：`JWT_SECRET`、`INITIAL_PASSWORD`、`PORT`、`DATA_DIR`。详见 `.env.example`。

## 可用模型

**订阅：** `cc/claude-opus-4-7` · `cx/gpt-5.5` · `gh/gpt-5.4` · `cu/claude-4.6-opus-max`  
**低价：** `glm/glm-5.1` · `minimax/MiniMax-M2.7` · `kimi/kimi-k2.5`  
**免费：** `kr/claude-sonnet-4.5` · `kr/glm-5` · `vertex/gemini-3.1-pro-preview`

## API 示例

```bash
POST http://localhost:20128/v1/chat/completions
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "model": "cc/claude-opus-4-6",
  "messages": [{"role": "user", "content": "..."}],
  "stream": true
}
```

## 技术栈

Node.js 20+ · Next.js 16 · React 19 · Tailwind CSS 4 · LowDB · SSE · OAuth 2.0 + JWT

## 许可证

MIT License

---

<div align="center">
  <sub>Built with ❤️ for developers who code 24/7</sub>
</div>
