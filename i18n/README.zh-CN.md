<div align="center">
  <img src="../images/9router.png?1" alt="9Router Dashboard" width="800"/>

  # 9Router - 免费 AI 路由器

  **永不停歇的编程体验。智能回退，自动路由到免费和廉价的 AI 模型。**

  **将各类 AI 编程工具（Claude Code、Cursor、Antigravity、Copilot、Codex、Gemini、OpenCode、Cline、OpenClaw……）对接 40+ AI 提供商和 100+ 模型。**

  [![npm](https://img.shields.io/npm/v/9router.svg)](https://www.npmjs.com/package/9router)
  [![Downloads](https://img.shields.io/npm/dm/9router.svg)](https://www.npmjs.com/package/9router)
  [![License](https://img.shields.io/npm/l/9router.svg)](https://github.com/decolua/9router/blob/main/LICENSE)

  [🚀 快速开始](#-快速开始) • [💡 核心特性](#-核心特性) • [📖 设置指南](#-设置指南) • [🌐 网站](https://9router.com)

  [🇻🇳 Tiếng Việt](./README.vi.md) • [🇨🇳 中文](./README.zh-CN.md) • [🇯🇵 日本語](./README.ja-JP.md)
</div>

---

## 🤔 为什么选择 9Router？

**别再浪费钱、别再被限额卡住：**

- ❌ 订阅配额每月未使用即过期
- ❌ 编程中途遭遇速率限制
- ❌ 每个提供商每月 $20-50 的昂贵 API
- ❌ 手动在各提供商之间切换

**9Router 帮你解决：**

- ✅ **最大化订阅价值** — 追踪配额，重置前用尽每一分
- ✅ **自动回退** — 订阅 → 廉价 → 免费，零停机
- ✅ **多账户** — 每提供商账户间轮询
- ✅ **通用兼容** — 适用于 Claude Code、Codex、Gemini CLI、Cursor、Cline 等任意 CLI 工具

---

## 🔄 工作原理

```
┌─────────────┐
│  你的 CLI   │  (Claude Code、Codex、Gemini CLI、OpenClaw、Cursor、Cline……)
│   工具       │
└──────┬──────┘
       │ http://localhost:20128/v1
       ↓
┌─────────────────────────────────────────┐
│           9Router（智能路由器）            │
│  • 格式转换（OpenAI ↔ Claude）              │
│  • 配额追踪                                │
│  • 自动 Token 刷新                        │
└──────┬──────────────────────────────────┘
       │
       ├─→ [第 1 层：订阅] Claude Code、Codex、Gemini CLI
       │   ↓ 配额用尽
       ├─→ [第 2 层：廉价] GLM ($0.6/1M)、MiniMax ($0.2/1M)
       │   ↓ 达到预算上限
       └─→ [第 3 层：免费] iFlow、Qwen、Kiro（无限制）

结果：编程永不停歇，成本最小化
```

---

## ⚡ 快速开始

**1. 全局安装：**

```bash
npm install -g 9router
9router
```

🎉 仪表板将在 `http://localhost:20128` 自动打开

**2. 连接免费提供商（无需注册）：**

仪表板 → 提供商 → 连接 **Claude Code** 或 **Antigravity** → OAuth 登录 → 完成！

**3. 在你的 CLI 工具中配置：**

```
Claude Code / Codex / Gemini CLI / OpenClaw / Cursor / Cline 设置：
  端点：http://localhost:20128/v1
  API Key：[从仪表板复制]
  模型：if/kimi-k2-thinking
```

**搞定！** 开始使用免费 AI 模型编程。

**替代方案：从源码运行（本仓库）：**

本仓库包为私有（`9router-app`），因此源码 / Docker 方式是预期的本地开发路径。

```bash
cp .env.example .env
npm install
PORT=20128 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run dev
```

生产模式：

```bash
npm run build
PORT=20128 HOSTNAME=0.0.0.0 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run start
```

默认 URL：
- 仪表板：`http://localhost:20128/dashboard`
- OpenAI 兼容 API：`http://localhost:20128/v1`

---

## 🎥 视频教程

<div align="center">

### 📺 完整设置指南 — 9Router + Claude Code 免费

[![9Router + Claude Code Setup](https://img.youtube.com/vi/raEyZPg5xE0/maxresdefault.jpg)](https://www.youtube.com/watch?v=raEyZPg5xE0)

**🎬 观看完整分步教程：**
- ✅ 9Router 安装与设置
- ✅ 免费 Claude Sonnet 4.5 配置
- ✅ Claude Code 集成
- ✅ 实际编程演示

**⏱️ 时长：** 20 分钟 | **👥 作者：** 开发者社区

[▶️ 在 YouTube 上观看](https://www.youtube.com/watch?v=o3qYCyjrFYg)

</div>

---

## 🛠️ 支持的 CLI 工具

9Router 与所有主流 AI 编程工具无缝协作：

<div align="center">
  <table>
    <tr>
      <td align="center" width="120">
        <img src="../public/providers/claude.png" width="60" alt="Claude Code"/><br/>
        <b>Claude Code</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/openclaw.png" width="60" alt="OpenClaw"/><br/>
        <b>OpenClaw</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/codex.png" width="60" alt="Codex"/><br/>
        <b>Codex</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/opencode.png" width="60" alt="OpenCode"/><br/>
        <b>OpenCode</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/cursor.png" width="60" alt="Cursor"/><br/>
        <b>Cursor</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/antigravity.png" width="60" alt="Antigravity"/><br/>
        <b>Antigravity</b>
      </td>
    </tr>
    <tr>
      <td align="center" width="120">
        <img src="../public/providers/cline.png" width="60" alt="Cline"/><br/>
        <b>Cline</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/continue.png" width="60" alt="Continue"/><br/>
        <b>Continue</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/droid.png" width="60" alt="Droid"/><br/>
        <b>Droid</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/roo.png" width="60" alt="Roo"/><br/>
        <b>Roo</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/copilot.png" width="60" alt="Copilot"/><br/>
        <b>Copilot</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/kilocode.png" width="60" alt="Kilo Code"/><br/>
        <b>Kilo Code</b>
      </td>
    </tr>
  </table>
</div>

---

## 🌐 支持的提供商

### 🔐 OAuth 提供商

<div align="center">
  <table>
    <tr>
      <td align="center" width="120">
        <img src="../public/providers/claude.png" width="60" alt="Claude Code"/><br/>
        <b>Claude Code</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/antigravity.png" width="60" alt="Antigravity"/><br/>
        <b>Antigravity</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/codex.png" width="60" alt="Codex"/><br/>
        <b>Codex</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/github.png" width="60" alt="GitHub"/><br/>
        <b>GitHub</b>
      </td>
      <td align="center" width="120">
        <img src="../public/providers/cursor.png" width="60" alt="Cursor"/><br/>
        <b>Cursor</b>
      </td>
    </tr>
  </table>
</div>

### 🆓 免费提供商

<div align="center">
  <table>
    <tr>
      <td align="center" width="150">
        <img src="../public/providers/iflow.png" width="70" alt="iFlow"/><br/>
        <b>iFlow AI</b><br/>
        <sub>8+ 模型 · 无限制</sub>
      </td>
      <td align="center" width="150">
        <img src="../public/providers/qwen.png" width="70" alt="Qwen"/><br/>
        <b>Qwen Code</b><br/>
        <sub>3+ 模型 · 无限制</sub>
      </td>
      <td align="center" width="150">
        <img src="../public/providers/gemini-cli.png" width="70" alt="Gemini CLI"/><br/>
        <b>Gemini CLI</b><br/>
        <sub>每月 180K 免费</sub>
      </td>
      <td align="center" width="150">
        <img src="../public/providers/kiro.png" width="70" alt="Kiro"/><br/>
        <b>Kiro AI</b><br/>
        <sub>Claude · 无限制</sub>
      </td>
    </tr>
  </table>
</div>

### 🔑 API Key 提供商（40+）

<div align="center">
  <table>
    <tr>
      <td align="center" width="100">
        <img src="../public/providers/openrouter.png" width="50" alt="OpenRouter"/><br/>
        <sub>OpenRouter</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/glm.png" width="50" alt="GLM"/><br/>
        <sub>GLM</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/kimi.png" width="50" alt="Kimi"/><br/>
        <sub>Kimi</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/minimax.png" width="50" alt="MiniMax"/><br/>
        <sub>MiniMax</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/openai.png" width="50" alt="OpenAI"/><br/>
        <sub>OpenAI</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/anthropic.png" width="50" alt="Anthropic"/><br/>
        <sub>Anthropic</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="100">
        <img src="../public/providers/gemini.png" width="50" alt="Gemini"/><br/>
        <sub>Gemini</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/deepseek.png" width="50" alt="DeepSeek"/><br/>
        <sub>DeepSeek</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/groq.png" width="50" alt="Groq"/><br/>
        <sub>Groq</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/xai.png" width="50" alt="xAI"/><br/>
        <sub>xAI</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/mistral.png" width="50" alt="Mistral"/><br/>
        <sub>Mistral</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/perplexity.png" width="50" alt="Perplexity"/><br/>
        <sub>Perplexity</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="100">
        <img src="../public/providers/together.png" width="50" alt="Together"/><br/>
        <sub>Together AI</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/fireworks.png" width="50" alt="Fireworks"/><br/>
        <sub>Fireworks</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/cerebras.png" width="50" alt="Cerebras"/><br/>
        <sub>Cerebras</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/cohere.png" width="50" alt="Cohere"/><br/>
        <sub>Cohere</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/nvidia.png" width="50" alt="NVIDIA"/><br/>
        <sub>NVIDIA</sub>
      </td>
      <td align="center" width="100">
        <img src="../public/providers/siliconflow.png" width="50" alt="SiliconFlow"/><br/>
        <sub>SiliconFlow</sub>
      </td>
    </tr>
  </table>
  <p><i>……以及 20+ 更多提供商（包括 Nebius、Chutes、Hyperbolic）和自定义 OpenAI / Anthropic 兼容端点</i></p>
</div>

---

## 💡 核心特性

| 特性 | 功能 | 为什么重要 |
|---------|--------------|----------------|
| 🎯 **智能 3 层回退** | 自动路由：订阅 → 廉价 → 免费 | 编程永不停歇，零停机 |
| 📊 **实时配额追踪** | 实时 Token 计数 + 重置倒计时 | 最大化订阅价值 |
| 🔄 **格式转换** | OpenAI ↔ Claude ↔ Gemini 无缝切换 | 适配任意 CLI 工具 |
| 👥 **多账户支持** | 每提供商支持多个账户 | 负载均衡 + 冗余 |
| 🔄 **自动 Token 刷新** | OAuth Token 自动续期 | 无需重新登录 |
| 🎨 **自定义组合** | 创建无限模型搭配 | 按需求定制回退策略 |
| 📝 **请求日志** | 调试模式记录完整请求 / 响应 | 轻松排查问题 |
| 💾 **云端同步** | 跨设备同步配置 | 所有设备同一套设置 |
| 📊 **用量分析** | 追踪 Token、成本、趋势 | 优化支出 |
| 🌐 **随处部署** | 本地 / VPS / Docker / Cloudflare Workers | 灵活部署方式 |

<details>
<summary><b>📖 特性详情</b></summary>

### 🎯 智能 3 层回退

创建带自动回退的组合：

```
组合："my-coding-stack"
  1. cc/claude-opus-4-6        （你的订阅）
  2. glm/glm-4.7               （廉价备份，$0.6/1M）
  3. if/kimi-k2-thinking       （免费回退）

→ 配额用尽或出错时自动切换
```

### 📊 实时配额追踪

- 每提供商 Token 消耗
- 重置倒计时（5 小时、每日、每周）
- 付费层成本估算
- 月度支出报告

### 🔄 格式转换

格式间无缝转换：
- **OpenAI** ↔ **Claude** ↔ **Gemini** ↔ **OpenAI Responses**
- CLI 工具发送 OpenAI 格式 → 9Router 转换 → 提供商接收原生格式
- 适配任意支持自定义 OpenAI 端点的工具

### 👥 多账户支持

- 每提供商添加多个账户
- 自动轮询或基于优先级的路由
- 某账户达到配额时回退到下一账户

### 🔄 自动 Token 刷新

- OAuth Token 在过期前自动刷新
- 无需手动重新认证
- 所有提供商无缝体验

### 🎨 自定义组合

- 创建无限模型组合
- 混合订阅、廉价和免费层
- 为组合命名，便于调用
- 通过云端同步跨设备共享

### 📝 请求日志

- 启用调试模式，获取完整请求 / 响应日志
- 追踪 API 调用、标头和载荷
- 排查集成问题
- 导出日志供分析

### 💾 云端同步

- 跨设备同步提供商、组合和设置
- 自动后台同步
- 安全加密存储
- 随时访问你的配置

#### 云端运行说明

- 生产环境优先使用服务端云变量：
  - `BASE_URL`（同步调度器使用的内部回调 URL）
  - `CLOUD_URL`（云端同步端点地址）
- `NEXT_PUBLIC_BASE_URL` 和 `NEXT_PUBLIC_CLOUD_URL` 仍为兼容旧版保留，但服务端运行时优先使用 `BASE_URL` / `CLOUD_URL`。
- 云端同步请求采用超时 + 快速失败策略，避免云端 DNS / 网络不可用时 UI 卡死。

### 📊 用量分析

- 按提供商和模型追踪 Token 使用
- 成本估算和支出趋势
- 月度报告与洞察
- 优化 AI 支出

> **💡 重要提示 — 理解仪表板成本：**
>
> 用量分析中显示的「成本」**仅用于追踪和比较**，
> 9Router 本身**绝不向你收费**，你只需直接向提供商付费（如使用付费服务）。
>
> **示例：** 使用 iFlow 模型时，仪表板显示「$290 总成本」，这代表
> 直接使用付费 API 需支付的金额。你的实际花费 = **$0**（iFlow 免费无限）。
>
> 可以把它看作「省钱追踪器」——显示你通过免费模型和 9Router 路由节省了多少！

### 🌐 随处部署

- 💻 **本地** — 默认，离线可用
- ☁️ **VPS / 云** — 跨设备共享
- 🐳 **Docker** — 一键部署
- 🚀 **Cloudflare Workers** — 全球边缘网络

</details>

---

## 💰 定价一览

| 层级 | 提供商 | 成本 | 配额重置 | 适合谁 |
|------|----------|------|-------------|----------|
| **💳 订阅** | Claude Code (Pro) | $20/月 | 5 小时 + 每周 | 已订阅用户 |
| | Codex (Plus/Pro) | $20-200/月 | 5 小时 + 每周 | OpenAI 用户 |
| | Gemini CLI | **免费** | 每月 180K + 每日 1K | 所有人！ |
| | GitHub Copilot | $10-19/月 | 每月 | GitHub 用户 |
| **💰 廉价** | GLM-4.7 | $0.6/1M | 每天 10:00 AM | 预算备份 |
| | MiniMax M2.1 | $0.2/1M | 5 小时滚动 | 最便宜选项 |
| | Kimi K2 | $9/月固定 | 每月 10M Token | 成本可预测 |
| **🆓 免费** | iFlow | $0 | 无限制 | 8 个模型免费 |
| | Qwen | $0 | 无限制 | 3 个模型免费 |
| | Kiro | $0 | 无限制 | Claude 免费 |

**💡 省钱技巧：** 从 Gemini CLI（每月 180K 免费）+ iFlow（无限免费）组合开始 = $0 成本！

---

### 📊 理解 9Router 的费用与计费

**9Router 计费说明：**

✅ **9Router 软件 = 永远免费**（开源，从不收费）
✅ **仪表板「成本」= 仅展示 / 追踪**（非真实账单）
✅ **你直接向提供商付费**（订阅或 API 费用）
✅ **免费提供商永远免费**（iFlow、Kiro、Qwen = $0 无限制）
❌ **9Router 从不发送发票**，也不会扣你的款

**成本显示逻辑：**

仪表板显示的**估算成本**是按直接使用付费 API 计算的。这**不是真实计费**，而是对比工具，让你看到自己省了多少。

**示例场景：**
```
仪表板显示：
• 总请求数：1,662
• 总 Token 数：47M
• 显示成本：$290

实际情况：
• 提供商：iFlow（免费无限制）
• 实际支付：$0.00
• $290 含义：你通过使用免费模型节省的金额！
```

**付费规则：**
- **订阅提供商**（Claude Code、Codex）：通过其官网直接付费
- **廉价提供商**（GLM、MiniMax）：直接向其付款，9Router 仅负责路由
- **免费提供商**（iFlow、Kiro、Qwen）：真正永久免费，无隐性收费
- **9Router**：从不收取任何费用

---

## 🎯 使用场景

### 场景一：「我有 Claude Pro 订阅」

**问题：** 配额未用尽就过期，重度编程时频频触限

**解决方案：**
```
组合："maximize-claude"
  1. cc/claude-opus-4-6        （充分利用订阅）
  2. glm/glm-4.7               （配额用完时的廉价备份）
  3. if/kimi-k2-thinking       （免费应急回退）

每月花费：$20（订阅）+ ~$5（备份）= 总计 $25
对比：$20 + 频繁触限 = 崩溃
```

### 场景二：「我想要零成本」

**问题：** 负担不起订阅，但需要可靠的 AI 编程

**解决方案：**
```
组合："free-forever"
  1. gc/gemini-3-flash         （每月 180K 免费）
  2. if/kimi-k2-thinking       （无限制免费）
  3. qw/qwen3-coder-plus       （无限制免费）

每月成本：$0
质量：可直接用于生产的模型
```

### 场景三：「我需要 24/7 编程，不能中断」

**问题：** 有截止日期，不能承受停机

**解决方案：**
```
组合："always-on"
  1. cc/claude-opus-4-6        （最佳质量）
  2. cx/gpt-5.2-codex          （第二个订阅）
  3. glm/glm-4.7               （廉价，每日重置）
  4. minimax/MiniMax-M2.1      （最便宜，5 小时重置）
  5. if/kimi-k2-thinking       （免费无限制）

结果：5 层回退 = 零停机
每月费用：$20-200（订阅）+ $10-20（备份）
```

### 场景四：「我想在 OpenClaw 中用免费 AI」

**问题：** 需要在即时通讯应用（WhatsApp、Telegram、Slack……）中使用 AI 助手，完全免费

**解决方案：**
```
组合："openclaw-free"
  1. if/glm-4.7                （无限制免费）
  2. if/minimax-m2.1           （无限制免费）
  3. if/kimi-k2-thinking       （无限制免费）

每月成本：$0
接入方式：WhatsApp、Telegram、Slack、Discord、iMessage、Signal……
```

---

## ❓ 常见问题

<details>
<summary><b>📊 为什么仪表板显示的成本很高？</b></summary>

仪表板追踪你的 Token 使用情况，显示的**估算成本**是按直接使用付费 API 来计算的。这**不是真实计费**——它仅作为参考，展示你通过使用免费模型或现有订阅节省了多少。

**示例：**
- **仪表板显示：**「$290 总成本」
- **实际情况：** 你使用的是 iFlow（免费无限制）
- **你的实际花费：** **$0.00**
- **$290 的含义：** 你通过免费模型替代付费 API **省下**的金额！

成本显示就是一个「省钱追踪器」，帮助你了解使用模式和优化空间。

</details>

<details>
<summary><b>💳 9Router 会向我收费吗？</b></summary>

**不会。** 9Router 是免费的开源软件，运行在你自己的电脑上，从不向你收费。

**你只需支付：**
- ✅ **订阅提供商**（Claude Code $20/月、Codex $20-200/月）→ 在其官网直接付费
- ✅ **廉价提供商**（GLM、MiniMax）→ 直接向其付款，9Router 仅负责路由
- ❌ **9Router 本身** → **从不收取任何费用，永远不会**

9Router 只是一个本地代理 / 路由器，没有你的信用卡信息，不能发送账单，也没有计费系统。完全免费的软件。

</details>

<details>
<summary><b>🆓 免费提供商真的无限制吗？</b></summary>

**是的！** 标记为免费（iFlow、Kiro、Qwen）的提供商是真正无限制的，**没有任何隐性收费**。

这些是各家公司提供的免费服务：
- **iFlow**：通过 OAuth 免费无限制访问 8+ 模型
- **Kiro**：通过 AWS Builder ID 免费无限制使用 Claude 模型
- **Qwen**：通过设备认证免费无限制使用 Qwen 模型

9Router 仅将你的请求路由到它们——没有「套路」或未来收费。它们就是真正的免费服务，9Router 让它们支持回退、更易使用。

**注意：** 部分订阅提供商（Antigravity、GitHub Copilot）可能设有免费预览期，未来可能转为付费，但这会由各提供商明确公告，而非 9Router。

</details>

<details>
<summary><b>💰 如何最小化实际 AI 成本？</b></summary>

**免费优先策略：**

1. **从 100% 免费组合开始：**
   ```
   1. gc/gemini-3-flash（Google 每月 180K 免费）
   2. if/kimi-k2-thinking（iFlow 无限制免费）
   3. qw/qwen3-coder-plus（Qwen 无限制免费）
   ```
   **成本：$0/月**

2. **仅在需要时添加廉价备份：**
   ```
   4. glm/glm-4.7（$0.6/1M Token）
   ```
   **额外费用：仅按实际使用量付费**

3. **最后才用订阅提供商：**
   - 前提是你已经拥有
   - 9Router 通过配额追踪帮你最大化其价值

**结果：** 大多数用户仅用免费层即可 $0/月运转！

</details>

<details>
<summary><b>📈 如果用量突然激增怎么办？</b></summary>

9Router 的智能回退机制可防止意外费用：

**场景：** 你在赶进度，配额快速耗尽

**没有 9Router：**
- ❌ 触限速限 → 工作停滞 → 沮丧
- ❌ 或者：意外产生巨额 API 账单

**有 9Router：**
- ✅ 订阅触限 → 自动回退到廉价层
- ✅ 廉价层太贵 → 自动回退到免费层
- ✅ 编程不停 → 成本可控

**你掌控全局：** 在仪表板中为每提供商设置支出上限，9Router 会遵守。

</details>

---

## 📖 设置指南

<details>
<summary><b>🔐 订阅提供商（最大化价值）</b></summary>

### Claude Code (Pro/Max)

```bash
仪表板 → 提供商 → 连接 Claude Code
→ OAuth 登录 → 自动刷新 Token
→ 5 小时 + 每周配额追踪

模型：
  cc/claude-opus-4-6
  cc/claude-sonnet-4-5-20250929
  cc/claude-haiku-4-5-20251001
```

**提示：** 复杂任务用 Opus，追求速度用 Sonnet。9Router 按模型单独追踪配额！

### OpenAI Codex (Plus/Pro)

```bash
仪表板 → 提供商 → 连接 Codex
→ OAuth 登录（端口 1455）
→ 5 小时 + 每周重置

模型：
  cx/gpt-5.2-codex
  cx/gpt-5.1-codex-max
```

### Gemini CLI（每月 180K 免费！）

```bash
仪表板 → 提供商 → 连接 Gemini CLI
→ Google OAuth
→ 每月 180K 补全 + 每日 1K

模型：
  gc/gemini-3-flash-preview
  gc/gemini-2.5-pro
```

**性价比最高：** 免费额度很大！在付费层之前先用它。

### GitHub Copilot

```bash
仪表板 → 提供商 → 连接 GitHub
→ 通过 GitHub OAuth
→ 每月重置（月初 1 号）

模型：
  gh/gpt-5
  gh/claude-4.5-sonnet
  gh/gemini-3-pro
```

</details>

<details>
<summary><b>💰 廉价提供商（备份）</b></summary>

### GLM-4.7（每日重置，$0.6/1M）

1. 注册：[智谱 AI](https://open.bigmodel.cn/)
2. 从 Coding Plan 获取 API Key
3. 仪表板 → 添加 API Key：
   - 提供商：`glm`
   - API Key：`your-key`

**使用：** `glm/glm-4.7`

**提示：** Coding Plan 以 1/7 的价格提供 3 倍配额！每天上午 10:00 重置。

### MiniMax M2.1（5 小时重置，$0.20/1M）

1. 注册：[MiniMax](https://www.minimax.io/)
2. 获取 API Key
3. 仪表板 → 添加 API Key

**使用：** `minimax/MiniMax-M2.1`

**提示：** 长上下文（1M Token）的最便宜选择！

### Kimi K2（$9/月固定）

1. 订阅：[月之暗面](https://platform.moonshot.ai/)
2. 获取 API Key
3. 仪表板 → 添加 API Key

**使用：** `kimi/kimi-latest`

**提示：** 固定 $9/月可获 10M Token，折合 $0.90/1M！

</details>

<details>
<summary><b>🆓 免费提供商（应急备份）</b></summary>

### iFlow（8 个免费模型）

```bash
仪表板 → 连接 iFlow
→ iFlow OAuth 登录
→ 无限制使用

模型：
  if/kimi-k2-thinking
  if/qwen3-coder-plus
  if/glm-4.7
  if/minimax-m2
  if/deepseek-r1
```

### Qwen（3 个免费模型）

```bash
仪表板 → 连接 Qwen
→ 设备码授权
→ 无限制使用

模型：
  qw/qwen3-coder-plus
  qw/qwen3-coder-flash
```

### Kiro（Claude 免费）

```bash
仪表板 → 连接 Kiro
→ AWS Builder ID 或 Google / GitHub 登录
→ 无限制使用

模型：
  kr/claude-sonnet-4.5
  kr/claude-haiku-4.5
```

</details>

<details>
<summary><b>🎨 创建组合</b></summary>

### 示例一：最大化订阅 → 廉价备份

```
仪表板 → 组合 → 创建新组合

名称：premium-coding
模型：
  1. cc/claude-opus-4-6（订阅优先）
  2. glm/glm-4.7（廉价备份，$0.6/1M）
  3. minimax/MiniMax-M2.1（最便宜回退，$0.20/1M）

CLI 中使用：premium-coding

月度成本示例（100M Token）：
  80M 通过 Claude（订阅）：$0 额外
  15M 通过 GLM：$9
  5M 通过 MiniMax：$1
  总计：$10 + 你的订阅费
```

### 示例二：仅免费（零成本）

```
名称：free-combo
模型：
  1. gc/gemini-3-flash-preview（每月 180K 免费）
  2. if/kimi-k2-thinking（无限制）
  3. qw/qwen3-coder-plus（无限制）

成本：永远 $0！
```

</details>

<details>
<summary><b>🔧 CLI 集成</b></summary>

### Cursor IDE

```
设置 → 模型 → 高级：
  OpenAI API 地址：http://localhost:20128/v1
  OpenAI API Key：[从 9Router 仪表板获取]
  模型：cc/claude-opus-4-6
```

或使用组合：`premium-coding`

### Claude Code

编辑 `~/.claude/config.json`：

```json
{
  "anthropic_api_base": "http://localhost:20128/v1",
  "anthropic_api_key": "your-9router-api-key"
}
```

### Codex CLI

```bash
export OPENAI_BASE_URL="http://localhost:20128/v1"
export OPENAI_API_KEY="your-9router-api-key"

codex "your prompt"
```

### OpenClaw

**方式一 — 仪表板（推荐）：**

```
仪表板 → CLI 工具 → OpenClaw → 选择模型 → 应用
```

**方式二 — 手动：** 编辑 `~/.openclaw/openclaw.json`：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "9router/if/glm-4.7"
      }
    }
  },
  "models": {
    "providers": {
      "9router": {
        "baseUrl": "http://127.0.0.1:20128/v1",
        "apiKey": "sk_9router",
        "api": "openai-completions",
        "models": [
          {
            "id": "if/glm-4.7",
            "name": "glm-4.7"
          }
        ]
      }
    }
  }
}
```

> **注意：** OpenClaw 仅支持本地 9Router。使用 `127.0.0.1` 而非 `localhost`，避免 IPv6 解析问题。

### Cline / Continue / RooCode

```
提供商：OpenAI Compatible
端点地址：http://localhost:20128/v1
API Key：[从仪表板获取]
模型：cc/claude-opus-4-6
```

</details>

<details>
<summary><b>🚀 部署</b></summary>

### VPS 部署

```bash
# 克隆并安装
git clone https://github.com/decolua/9router.git
cd 9router
npm install
npm run build

# 配置环境变量
export JWT_SECRET="your-secure-secret-change-this"
export INITIAL_PASSWORD="your-password"
export DATA_DIR="/var/lib/9router"
export PORT="20128"
export HOSTNAME="0.0.0.0"
export NODE_ENV="production"
export NEXT_PUBLIC_BASE_URL="http://localhost:20128"
export NEXT_PUBLIC_CLOUD_URL="https://9router.com"
export API_KEY_SECRET="endpoint-proxy-api-key-secret"
export MACHINE_ID_SALT="endpoint-proxy-salt"

# 启动
npm run start

# 或使用 PM2
npm install -g pm2
pm2 start npm --name 9router -- start
pm2 save
pm2 startup
```

### Docker

```bash
# 构建镜像（仓库根目录）
docker build -t 9router .

# 运行容器
docker run -d \
  --name 9router \
  -p 20128:20128 \
  --env-file ./.env \
  -v 9router-data:/app/data \
  -v 9router-usage:/root/.9router \
  9router
```

容器默认值：
- `PORT=20128`
- `HOSTNAME=0.0.0.0`

常用命令：

```bash
docker logs -f 9router
docker restart 9router
docker stop 9router && docker rm 9router
```

### 环境变量

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `JWT_SECRET` | `9router-default-secret-change-me` | 仪表板认证 Cookie 的 JWT 签名密钥（**生产环境请更改**） |
| `INITIAL_PASSWORD` | `123456` | 首次登录密码（无保存哈希时生效） |
| `DATA_DIR` | `~/.9router` | 主应用数据路径（`db.json`） |
| `PORT` | 框架默认值 | 服务端口（示例中 `20128`） |
| `HOSTNAME` | 框架默认值 | 绑定地址（Docker 默认 `0.0.0.0`） |
| `NODE_ENV` | 运行时默认值 | 部署时设为 `production` |
| `BASE_URL` | `http://localhost:20128` | 服务端内部地址，云同步任务使用 |
| `CLOUD_URL` | `https://9router.com` | 服务端云同步端点 |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | 向后兼容的公开地址（服务端优先使用 `BASE_URL`） |
| `NEXT_PUBLIC_CLOUD_URL` | `https://9router.com` | 向后兼容的云端地址（服务端优先使用 `CLOUD_URL`） |
| `API_KEY_SECRET` | `endpoint-proxy-api-key-secret` | 生成 API Key 的 HMAC 密钥 |
| `MACHINE_ID_SALT` | `endpoint-proxy-salt` | 机器 ID 哈希盐值 |
| `ENABLE_REQUEST_LOGS` | `false` | 启用请求 / 响应日志（`logs/` 目录） |
| `AUTH_COOKIE_SECURE` | `false` | 强制 `Secure` Cookie（HTTPS 反向代理后置 `true`） |
| `REQUIRE_API_KEY` | `false` | 对 `/v1/*` 路由强制 Bearer API Key（建议公网部署开启） |
| `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY` | 空 | 上游请求的出站代理 |

备注：
- 也支持小写代理变量：`http_proxy`、`https_proxy`、`all_proxy`、`no_proxy`。
- `.env` 不会打包进 Docker 镜像（`.dockerignore`）；使用 `--env-file` 或 `-e` 注入运行时配置。
- Windows 系统可使用 `APPDATA` 作为本地存储路径。
- `INSTANCE_NAME` 出现在旧文档 / 模板中，但当前运行时未使用。

### 运行时文件与存储

- 主应用状态：`${DATA_DIR}/db.json`（提供商、组合、别名、密钥、设置），由 `src/lib/localDb.js` 管理。
- 用量历史与日志：`~/.9router/usage.json` 和 `~/.9router/log.txt`，由 `src/lib/usageDb.js` 管理。
- 可选的请求 / 转换器日志：`ENABLE_REQUEST_LOGS=true` 时输出到 `<repo>/logs/...`。
- 用量存储路径固定为 `~/.9router`，独立于 `DATA_DIR`。

</details>

---

## 📊 可用模型

<details>
<summary><b>查看所有可用模型</b></summary>

**Claude Code（`cc/`）** — Pro/Max：
- `cc/claude-opus-4-6`
- `cc/claude-sonnet-4-5-20250929`
- `cc/claude-haiku-4-5-20251001`

**Codex（`cx/`）** — Plus/Pro：
- `cx/gpt-5.2-codex`
- `cx/gpt-5.1-codex-max`

**Gemini CLI（`gc/`）** — 免费：
- `gc/gemini-3-flash-preview`
- `gc/gemini-2.5-pro`

**GitHub Copilot（`gh/`）**：
- `gh/gpt-5`
- `gh/claude-4.5-sonnet`

**GLM（`glm/`）** — $0.6/1M：
- `glm/glm-4.7`

**MiniMax（`minimax/`）** — $0.2/1M：
- `minimax/MiniMax-M2.1`

**iFlow（`if/`）** — 免费：
- `if/kimi-k2-thinking`
- `if/qwen3-coder-plus`
- `if/deepseek-r1`

**Qwen（`qw/`）** — 免费：
- `qw/qwen3-coder-plus`
- `qw/qwen3-coder-flash`

**Kiro（`kr/`）** — 免费：
- `kr/claude-sonnet-4.5`
- `kr/claude-haiku-4.5`

</details>

---

## 🐛 故障排除

**「Language model did not provide messages」**
- 提供商配额耗尽 → 检查仪表板配额追踪器
- 解决方案：使用组合回退或切换到更便宜的层

**速率限制**
- 订阅配额用完 → 回退到 GLM / MiniMax
- 添加组合：`cc/claude-opus-4-6 → glm/glm-4.7 → if/kimi-k2-thinking`

**OAuth Token 过期**
- 9Router 自动刷新
- 如果问题持续：仪表板 → 提供商 → 重新连接

**高成本**
- 在仪表板中查看使用统计
- 将主模型切换为 GLM / MiniMax
- 非关键任务使用免费层（Gemini CLI、iFlow）

**仪表板在错误的端口打开**
- 设置 `PORT=20128` 且 `NEXT_PUBLIC_BASE_URL=http://localhost:20128`

**首次登录失败**
- 检查 `.env` 中的 `INITIAL_PASSWORD`
- 如未设置，默认密码为 `123456`

**`logs/` 下没有请求日志**
- 设置 `ENABLE_REQUEST_LOGS=true`

---

## 🛠️ 技术栈

- **运行时：** Node.js 20+
- **框架：** Next.js 16
- **UI：** React 19 + Tailwind CSS 4
- **数据库：** LowDB（JSON 文件）
- **流式：** Server-Sent Events (SSE)
- **认证：** OAuth 2.0 (PKCE) + JWT + API Keys

---

## 📝 API 参考

### 聊天补全

```bash
POST http://localhost:20128/v1/chat/completions
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "model": "cc/claude-opus-4-6",
  "messages": [
    {"role": "user", "content": "Write a function to..."}
  ],
  "stream": true
}
```

### 列出模型

```bash
GET http://localhost:20128/v1/models
Authorization: Bearer your-api-key

→ 以 OpenAI 格式返回所有模型和组合
```

## 📧 支持

- **网站：** [9router.com](https://9router.com)
- **GitHub：** [github.com/decolua/9router](https://github.com/decolua/9router)
- **问题反馈：** [github.com/decolua/9router/issues](https://github.com/decolua/9router/issues)

---

## 👥 贡献者

感谢所有帮助改进 9Router 的贡献者！

[![Contributors](https://contrib.rocks/image?repo=decolua/9router&max=150&columns=15&anon=1&v=20260309)](https://github.com/decolua/9router/graphs/contributors)

---

## 📊 Star 图表

[![Star Chart](https://starchart.cc/decolua/9router.svg?variant=adaptive)](https://starchart.cc/decolua/9router)

## 🔀 推荐分支

**[OmniRoute](https://github.com/diegosouzapw/OmniRoute)** — 9Router 的全功能 TypeScript 分支。新增 36+ 提供商、4 层自动回退、多模态 API（图像、嵌入向量、音频、TTS）、熔断器、语义缓存、LLM 评估功能和精心设计的仪表板。368+ 单元测试。支持 npm 和 Docker。

---

## 🙏 致谢

特别感谢 **CLIProxyAPI** —— 启发本 JavaScript 移植版本的原始 Go 实现。

---

## 📄 许可证

MIT 许可证 — 详见 [LICENSE](../LICENSE)。

---

<div align="center">
  <sub>为 24/7 编程的开发者倾心构建</sub>
</div>
