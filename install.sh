#!/usr/bin/env bash
set -e

CMD="${1:-install}"

# 检测包管理器
 detect_pkg() {
  if command -v pnpm &>/dev/null; then echo "pnpm"; return; fi
  if command -v bun &>/dev/null; then echo "bun"; return; fi
  if command -v npm &>/dev/null; then echo "npm"; return; fi
  echo "❌ 未检测到包管理器（pnpm / bun / npm）"; exit 1
}

PKG=$(detect_pkg)
BUILD_CMD="build"
[ "$PKG" = "bun" ] && BUILD_CMD="build:bun"

# 判断是否已全局安装
is_linked() {
  command -v 9router >/dev/null 2>&1 && \
    (which 9router | grep -q "Library/pnpm\|\.bun/bin\|node_modules/.bin\|npm-global" >/dev/null 2>&1)
}

case "$CMD" in
  install)
    echo "🚀 9Router 安装"
    echo "=============="

    if is_linked; then
      echo "✅ 9router 已全局安装"
      echo "   如需重新构建，运行: ./install.sh rebuild"
      echo "   如需卸载，运行: ./install.sh uninstall"
      exit 0
    fi

    # 环境变量
    [ ! -f ".env.local" ] && [ -f ".env.example" ] && cp .env.example .env.local && echo "✅ .env.local 已创建"

    # 安装 + 构建
    echo "📦 安装依赖..."
    $PKG install
    echo "🔨 构建..."
    $PKG run $BUILD_CMD

    # 注册全局命令
    echo "🔗 注册全局命令..."
    if [ "$PKG" = "pnpm" ]; then pnpm link --global
    elif [ "$PKG" = "bun" ]; then bun link
    else npm link; fi

    echo ""
    echo "🎉 完成！运行 9router 启动"
    ;;

  rebuild)
    echo "🔨 9Router 重建"
    echo "=============="

    echo "🧹 清理..."
    rm -rf .next/standalone

    echo "🔨 构建..."
    $PKG run $BUILD_CMD

    echo "✅ 完成！运行 9router 启动"
    ;;

  dev)
    echo "🛠️  开发模式"
    echo "==========="

    [ ! -f ".env.local" ] && [ -f ".env.example" ] && cp .env.example .env.local
    [ ! -d "node_modules" ] && echo "📦 安装依赖..." && $PKG install

    export PORT=20128
    export NEXT_PUBLIC_BASE_URL=http://localhost:20128

    echo "🚀 热重载启动 http://localhost:20128"
    [ "$PKG" = "bun" ] && bun run dev:bun || $PKG run dev
    ;;

  uninstall)
    echo "🗑️  卸载"
    echo "======="

    if [ "$PKG" = "pnpm" ]; then pnpm unlink --global 2>/dev/null || true
    elif [ "$PKG" = "bun" ]; then bun unlink 2>/dev/null || true
    else npm uninstall -g 9router-app 2>/dev/null || npm unlink -g 2>/dev/null || true; fi

    echo "✅ 已卸载"
    ;;

  *)
    echo "用法: ./install.sh [install | rebuild | dev | uninstall]"
    echo ""
    echo "  ./install.sh           首次安装（默认）"
    echo "  ./install.sh rebuild   重新构建"
    echo "  ./install.sh dev       开发模式（热重载）"
    echo "  ./install.sh uninstall 卸载全局命令"
    exit 1
    ;;
esac
