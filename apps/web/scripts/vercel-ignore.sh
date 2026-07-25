#!/usr/bin/env bash
# Skips Vercel deploy if no frontend (apps/web/) files changed.
# Exit 0 = deploy, exit 1 = skip

set -euo pipefail

# Use Vercel-provided SHAs if available, otherwise compare against HEAD~1
PREVIOUS="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"
CURRENT="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# On merge commits the shallow clone may not have the previous SHA.
# git diff returns non-zero exit when a SHA is missing, so || true
# handles that gracefully by falling through to "deploy" below.
CHANGED_FILES=$(git diff --name-only "$PREVIOUS" "$CURRENT" 2>/dev/null || true)

if [ -z "$CHANGED_FILES" ]; then
  echo "Could not determine changed files — deploying to be safe"
  exit 0
fi

# Check if any changed files are inside apps/web/
if echo "$CHANGED_FILES" | grep -q "^apps/web/"; then
  echo "Frontend changes detected — deploying"
  exit 0
else
  echo "No frontend changes — skipping Vercel deploy"
  exit 1
fi
