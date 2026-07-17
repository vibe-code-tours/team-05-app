#!/usr/bin/env bash
# Skips Vercel deploy if no frontend (apps/web/) files changed.
# Exit 0 = deploy, exit 1 = skip

set -euo pipefail

CHANGED_FILES=$(git diff --name-only "${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}" "${VERCEL_GIT_COMMIT_SHA:-HEAD}" 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo "No changes detected — deploying"
  exit 0
fi

# Check if any changed files are inside apps/web/
WEB_CHANGED=$(echo "$CHANGED_FILES" | grep -c "^apps/web/" || true)

if [ "$WEB_CHANGED" -gt 0 ]; then
  echo "Frontend changes detected — deploying"
  exit 0
else
  echo "No frontend changes — skipping Vercel deploy"
  exit 1
fi
