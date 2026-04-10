#!/usr/bin/env sh
set -e
root=$(git rev-parse --show-toplevel)
cd "$root" || exit 1

if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) is required. Install: https://cli.github.com/" >&2
  exit 1
fi

current=$(git branch --show-current)
if [ -z "$current" ]; then
  echo "Not on a branch." >&2
  exit 1
fi

git push -u origin "$current"
exec gh pr create "$@"
