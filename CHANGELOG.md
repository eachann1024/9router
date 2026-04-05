# 更新日志

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
