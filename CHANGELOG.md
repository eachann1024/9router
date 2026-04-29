# 更新日志


## 2026-04-27

🌈 本次更新重点：Provider 连接现在有了健康状态自动管理和每小时用量限制，出问题的连接会自动避开，不会再拖慢你的使用。

✨ 新功能
• Provider 详情页的每个连接新增「小时配额」设置，填一个数字就能限制每小时最多使用次数，到了上限会自动切换到其他连接
• 连接现在会自动追踪健康状态——连续失败 5 次进入冷却，10 次后自动标记为「已失败」不再使用，恢复正常使用后状态自动清零
• Provider 详情页新增配额进度条（绿→橙→红），让你一眼看到每个连接的用量情况

🪐 优化
• Codex 登录后 Token 过期会自动续期，不再需要重新登录
• 连续失败次数、冷却倒计时、池状态徽章现在直接显示在 Provider 详情页的连接行里
• 删除了页面里重复的组件代码和无用的 div 标签，页面加载更快

🐛 修复
• 某些工具调用缺少 ID 时会导致请求报错，现在会自动补上随机 ID 保证不出错
• 之前 Header 组件有一个多余的闭合标签、Sidebar 有重复变量声明，已清理干净

---

## 2026-04-23

🌈 本次更新重点：现在 `free` 这个组合可以直接接管 OpenRouter 的免费长上下文模型，打开开关后会自己保持最新。打开 OpenRouter 页面时，也会直接看到最新的免费模型列表，不用再自己一条条补。

✨ 新功能
• 现在打开 `Combos` 页里的 `free` 组合，可以直接打开 `OpenRouter Free` 开关，让免费模型自动同步进这个组合里。
• 现在每天早上 6 点会自动刷新 `free` 组合里的 OpenRouter 免费模型，最新发布的模型会排在最前面。

🪐 优化
• 现在打开 OpenRouter 提供商页面时，免费长上下文模型会直接出现在可用模型列表里，切换更快。
• 现在 `free` 组合里会优先看到最新发布的免费模型，不用自己手动调整顺序。

🐛 修复
• 之前 OpenRouter 的免费模型只是建议列表，还要手动添加；现在打开页面就能直接用。
• 之前 `free` 组合里的免费模型不会自己更新；现在打开开关后会自动跟上最新列表。

## [2026-04-19 00:28:38]

🌈 本次更新重点：服务商详情页里，调整连接排列顺序更方便了，右键即可一键移到最前或最后。

✨ 新功能
• 右键点击上移箭头，连接直接跳到列表最前面
• 右键点击下移箭头，连接直接跳到列表最后面

🪐 优化
• 之前要一条一条点很多次才能把某个连接挪到想要的位子，现在右键一步到位

## [2026-04-18 11:34:14]

🌈 本次更新重点：用量页面大升级，新增定时刷新额度功能，服务提供商页面更清爽

✨ 新功能
• 现在可以开启「定时刷新额度」，每隔 5 小时自动帮你预热一次用量，不用再手动操作
• 每个服务提供商都可以单独开关定时刷新，也可以一键手动触发
• 用量页面新增时间轴，直接看到当前窗口、下次刷新时间和倒计时
• 新增 Kimi 用量显示，GLM（智谱）用量信息更丰富（剩余额度、百分比、重置时间一目了然）

🪐 优化
• 服务提供商页面：已配置的提供商置顶显示，不再和长列表混在一起，找起来更快
• 用量卡片上直接显示刷新状态（正在刷新、刷新成功、刷新失败），不用猜
• 主题色跟随系统切换更流畅，浏览器标题栏颜色也会跟着变
• 中文界面新增定时刷新相关标签，中文用户操作更直观

🐛 修复
• GLM（智谱）之前需要填很多额外字段才能查到用量，现在有 API Key 就行，设置更简单
• 之前自动刷新有时会一直显示「刷新中」卡住不动，现在状态更新更准确
• Kimi 之前会假装支持额度查询，现在会给出明确的提示信息

## [2026-04-05 01:00:00]

🌈 本次更新重点：Dashboard 全面开启中文界面，打包和翻译更稳定

✨ 新功能
• 现在打开 Dashboard 各页面都能看到完整的中文界面，不再中英混杂
• README 中文文档重写，安装和使用步骤更清晰好懂

🪐 优化
• 翻译加载失败时不再让页面报错，改为安全降级
• 打包后 standalone 版本现在能正确找到 MITM 服务各模块，不再缺文件

🐛 修复
• 路径计算错误导致部分环境 MITM 找不到，现在无论开发还是打包都能正确定位

# Unreleased

# v0.4.8 (2026-04-28)

## Features
- Add Web Search & Web Fetch providers with Combo support — chain multiple search/fetch providers as a single virtual provider
- Add Cloudflare AI provider support
- Add provider filter and expiry sorting to quota dashboard (#769)

## Improvements
- Proxy-aware token refresh across executors (Antigravity, Base, Default, Github, Kiro)

## Fixes
- Fix granular `reasoning_effort` handling for Claude models on Copilot & Anthropic backend (#791)
- Fix Antigravity INVALID_ARGUMENT errors and Copilot agent mode parity
- Fix quota reset timestamp parsing (#768)

# v0.4.6 (2026-04-25)

## Features
- Added API key visibility toggle (eye icon) to Endpoint dashboard page for improved UX and security.

## [2026-04-05 00:18:35]

🌈 本次更新重点：Dashboard 多语言覆盖 + 用量追踪与额度管理全面升级

✨ 新功能
• 打开用量页面可以开启自动额度刷新，系统每小时自动检查所有账号剩余额度
• 组合模型（Combos）现在可以单独开关轮询策略，还能拖拽调整模型优先顺序
• 用量统计支持按模型、账号、API Key 分组查看，切换「费用」和「Token」两种视角

🪐 优化
• 额度条现在会用颜色直观显示剩余量：绿色充足、黄色中等、红色告急
• 打开 Dashboard 各页面都能看到自己母语的界面，新增 30+ 种语言翻译
• 刷新额度和查看请求详情时状态反馈更及时，不再担心点击没反应

🐛 修复
• 之前部分页面文字混用中英文，现在完整跟随语言设置
• 额度刷新失败时会显示具体错误信息，不再只显示模糊的「出错了」

# v0.2.66 (2026-02-06)

## Features
- Added API key visibility toggle (eye icon) to Endpoint dashboard page for improved UX and security.

## Fixes
- Added Codex provider and Antigravity handling.


## Features
- Add Hermes CLI tool with settings management and integration
- Add in-app version update mechanism (appUpdater + /api/version/update)

## Improvements
- Strengthen CLI token validation for enhanced security
- Enhance Sidebar layout for CLI tools
- Update executors and runtime config

# v0.3.98 (2026-04-22)

## Features
- Add RTK — filter context (ls/grep/find/.....) before sending to LLM to save tokens

# v0.3.97 (2026-04-22)

## Features
- Add OpenCode Go provider and support for custom models
- Add Text To Image provider
- Support custom host URL for remote Ollama servers

## Fixes
- Fix copy to clipboard issue

# v0.3.96 (2026-04-17)

## Features
- Add marked package for Markdown rendering
- Enhance changelog styles

## Improvements
- Refactor error handling to config-driven approach with centralized error rules
- Refactor localDb structure
- Update Qwen executor for OAuth handling
- Enhance error formatting to include low-level cause details
- Refactor HeaderMenu to use MenuItem component
- Improve LanguageSwitcher to support controlled open state
- Update backoff configuration and improve CLI detection messages
- Add installation guides for manual configuration in tool cards (Droid, Claude, OpenClaw)

## Fixes
- Fix Codex image URL fetches to await before sending upstream (#575)
- Strip thinking/reasoning_effort for GitHub Copilot chat completions (#623)
- Enable Codex Apply/Reset buttons when CLI is installed (#591)
- Show manual config option when Claude CLI detection fails (#589)
- Show manual config option when OpenClaw detection fails (#579)
- Ensure LocalMutex acquire returns release callback correctly (#569)
- Strip enumDescriptions from tool schema in antigravity-to-openai (#566)
- Strip temperature parameter for gpt-5.4 model (#536)
- Add Blackbox AI as a supported provider (#599)
- Add multi-model support for Factory Droid CLI tool (#521)
- Add GLM-5 and MiniMax-M2.5 models to Kiro provider (#580)
- Fix usage tracking bug

# v0.3.91 (2026-04-15)

## Features
- Add Kiro AWS Identity Center device flow for provider OAuth
- Add TTS (Text-to-Speech) core handler and TTS models config
- Add media providers dashboard page
- Add suggested models API endpoint

## Improvements
- Refactor error handling to config-driven approach with centralized error rules
- Refactor localDb and usageDb for cleaner structure

## Fixes
- Fix usage tracking bug

# v0.3.90 (2026-04-14)

## Features
- Add proactive token refresh lead times for providers and Codex proxy management
- Enhance CodexExecutor with compact URL support

## Improvements
- Enhance Windows Tailscale installation with curl support and fallback to well-known Windows path
- Refactor execSync and spawn calls with windowsHide option for better Windows compatibility

## Fixes
- Fix noAuth support for providers and adjusted MITM restart settings
- Bug fixes

# v0.3.89 (2026-04-13)

## Improvements
- Improved dashboard access control by blocking tunnel/Tailscale access when disabled

# v0.3.87 (2026-04-13)

## Fixes
- Fix codex cache session id

# v0.3.86 (2026-04-13)

## Features
- Add provider models and thinking configurations for enhanced chat handling
- Add Vercel relay support to proxy functionality
- Add Vercel deploy endpoint for proxy pools management

## Improvements
- Enhance proxy functionality with new relay capabilities
- Streamline GitHub Actions Docker publish workflow
- Update Docker configuration and package management

## Fixes
- Remove obsolete 9remote installation/management APIs

# v0.3.83 (2026-04-08)

## Fixes
- Fix OpenRouter custom models not showing after being added

# Unreleased

## Features
- Added API key visibility toggle (eye icon) to Endpoint dashboard page for improved UX and security.

# v0.2.66 (2026-02-06)

## Features
- Added Cursor provider end-to-end support, including OAuth import flow and translator/executor integration (`137f315`, `0a026c7`).
- Enhanced auth/settings flow with `requireLogin` control and `hasPassword` state handling in dashboard/login APIs (`249fc28`).
- Improved usage/quota UX with richer provider limit cards, new quota table, and clearer reset/countdown display (`32aefe5`).
- Added model support for custom providers in UI/combos/model selection (`a7a52be`).
- Expanded model/provider catalog:
  - Codex updates: GPT-5.3 support, translation fixes, thinking levels (`127475d`)
  - Added Claude Opus 4.6 model (`e8aa3e2`)
  - Added MiniMax Coding (CN) provider (`7c609d7`)
  - Added iFlow Kimi K2.5 model (`9e357a7`)
  - Updated CLI tools with Droid/OpenClaw cards and base URL visibility improvements (`a2122e3`)
- Added auto-validation for provider API keys when saving settings (`b275dfd`).
- Added Docker/runtime deployment docs and architecture documentation updates (`5e4a15b`).

## Fixes
- Improved local-network compatibility by allowing auth cookie flow over HTTP deployments (`0a394d0`).
- Improved Antigravity quota/stream handling and Droid CLI compatibility behavior (`3c65e0c`, `c612741`, `8c6e3b8`).
- Fixed GitHub Copilot model mapping/selection issues (`95fd950`).
- Hardened local DB behavior with corrupt JSON recovery and schema-shape migration safeguards (`e6ef852`).
- Fixed logout/login edge cases:
  - Prevent unintended auto-login after logout (`49df3dc`)
  - Avoid infinite loading on failed `/api/settings` responses (`01c9410`)

# v0.2.56 (2026-02-04)

## Features
- Added Anthropic-compatible provider support across providers API/UI flow (`da5bdef`).
- Added provider icons to dashboard provider pages/lists (`60bd686`, `8ceb8f2`).
- Enhanced usage tracking pipeline across response handlers/streams with buffered accounting improvements (`a33924b`, `df0e1d6`, `7881db8`).

## Fixes
- Fixed usage conversion and related provider limits presentation issues (`e6e44ac`).

# v0.2.52 (2026-02-02)

## Features
- Implemented Codex Cursor compatibility and Next.js 16 proxy migration updates (`e9b0a73`, `7b864a9`, `1c6dd6d`).
- Added OpenAI-compatible provider nodes with CRUD/validation/test coverage in API and UI (`0a28f9f`).
- Added token expiration and key-validity checks in provider test flow (`686585d`).
- Added Kiro token refresh support in shared token refresh service (`f2ca6f0`).
- Added non-streaming response translation support for multiple formats (`63f2da8`).
- Updated Kiro OAuth wiring and auth-related UI assets/components (`31cc79a`).

## Fixes
- Fixed cloud translation/request compatibility path (`c7219d0`).
- Fixed Kiro auth modal/flow issues (`85b7bb9`).
- Included Antigravity stability fixes in translator/executor flow (`2393771`, `8c37b39`).

# v0.2.43 (2026-01-27)

## Fixes
- Fixed CLI tools model selection behavior (`a015266`).
- Fixed Kiro translator request handling (`d3dd868`).

# v0.2.36 (2026-01-19)

## Features
- Added the Usage dashboard page and related usage stats components (`3804357`).
- Integrated outbound proxy support in Open SSE fetch pipeline (`0943387`).
- Improved OpenAI compatibility and build stability across endpoint/profile/providers flows (`d9b8e48`).

## Fixes
- Fixed combo fallback behavior (`e6ca119`).
- Resolved SonarQube findings, Next.js image warnings, and build/lint cleanups (`7058b06`, `0848dd5`).

# v0.2.31 (2026-01-18)

## Fixes
- Fixed Kiro token refresh and executor behavior (`6b22b1f`, `1d481c2`).
- Fixed Kiro request translation handling (`eff52f7`, `da15660`).

# v0.2.27 (2026-01-15)

## Features
- Added Kiro provider support with OAuth flow (`26b61e5`).

## Fixes
- Fixed Codex provider behavior (`26b61e5`).

# v0.2.21 (2026-01-12)

## Changes
- README updates.
- Antigravity bug fixes.
