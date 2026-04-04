#!/bin/bash
# Post-build script: symlink public and .next/static into standalone directory
# Required for standalone Next.js server to serve static files

STANDALONE_DIR=".next/standalone"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_ROOT"

if [ -d "$STANDALONE_DIR" ]; then
  # Symlink public directory
  if [ ! -e "$STANDALONE_DIR/public" ]; then
    ln -s "$PROJECT_ROOT/public" "$STANDALONE_DIR/public"
    echo "✓ Linked public -> standalone/public"
  fi

  # Symlink .next/static directory
  if [ ! -e "$STANDALONE_DIR/.next/static" ]; then
    ln -s "$PROJECT_ROOT/.next/static" "$STANDALONE_DIR/.next/static"
    echo "✓ Linked .next/static -> standalone/.next/static"
  fi

  echo "✓ Standalone symlinks ready"
else
  echo "⚠ No standalone build found, skipping symlinks"
fi
