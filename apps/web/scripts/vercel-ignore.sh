#!/usr/bin/env bash
# Ignored Build Step for Vercel.
#
# Vercel convention: exit 0 = ignore (skip deploy), exit 1 = build.
# We skip the deploy when *no* apps/web/ files changed.

set -euo pipefail

PREVIOUS="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"
CURRENT="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# On merge commits the shallow clone may not have the previous SHA.
# git diff exits non-zero when a SHA is missing; || true prevents a crash.
CHANGED_FILES=$(git diff --name-only "$PREVIOUS" "$CURRENT" 2>/dev/null || true)

if [ -z "$CHANGED_FILES" ]; then
  echo "Could not determine changed files — building to be safe"
  exit 1   # build
fi

if echo "$CHANGED_FILES" | grep -q "^apps/web/"; then
  echo "Frontend changes detected — building"
  exit 1   # build
else
  echo "No frontend changes — skipping Vercel deploy"
  exit 0   # ignore (skip)
fi
