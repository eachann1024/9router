#!/bin/zsh
source ~/.zshrc 2>/dev/null
pnpm build && 9router

# Verify service actually started
sleep 1
if lsof -Pi :20128 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "✅ 9router is running: http://127.0.0.1:20128"
else
  echo "❌ 9router failed to start. Check $HOME/.9router/launchd.err.log"
  exit 1
fi
