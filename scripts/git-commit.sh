#!/usr/bin/env sh
set -e
root=$(git rev-parse --show-toplevel)
git -C "$root" add -A
if [ "$#" -eq 0 ]; then
  git -C "$root" commit
else
  git -C "$root" commit "$@"
fi
