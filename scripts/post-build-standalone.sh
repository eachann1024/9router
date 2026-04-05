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

  # Symlink src/mitm so standalone/src/mitm/server.js can resolve sibling modules
  # (Next.js file tracing only copies server.js, not logger.js / config.js / etc.)
  MITM_STANDALONE="$STANDALONE_DIR/src/mitm"
  MITM_SRC="$PROJECT_ROOT/src/mitm"
  if [ -d "$MITM_STANDALONE" ] && [ ! -L "$MITM_STANDALONE" ]; then
    rm -rf "$MITM_STANDALONE"
    ln -s "$MITM_SRC" "$MITM_STANDALONE"
    echo "✓ Replaced standalone/src/mitm -> src/mitm"
  fi

  echo "✓ Standalone symlinks ready"
else
  echo "⚠ No standalone build found, skipping symlinks"
fi
