---
name: pr
description: >-
  Pushes the current branch, opens a GitHub pull request into the default base
  branch (usually main), and relies on repository CI to run lint, typecheck, and
  build on the PR. Use when the user invokes /pr, asks to open a pull request,
  or wants CI to run against their branch on GitHub.
---

# Open a PR (push + GitHub CLI + CI)

## When this applies

User wants a **new pull request** from the **current branch** and expects **GitHub Actions CI** to run on that PR.

## Prerequisites

- **Remote**: `origin` points at GitHub.
- **GitHub CLI**: `gh` installed and authenticated (`gh auth status`).
- **Branch**: Commits exist to push (or push is a no-op if already up to date).

## Workflow (run from repo root)

1. **Sync state**
   - `git status`
   - `git branch --show-current`
   - If there are **uncommitted** changes the user cares about, stop and use the **commit** skill (or ask) before continuing — a PR should not omit intentional work unless they say otherwise.

2. **Mirror CI locally (recommended)**  
   Same checks as `.github/workflows/ci.yml`:
   - `npm ci`
   - `npm test`  
   If this fails, fix issues before opening the PR so the PR isn’t red on arrival.

3. **Push the branch**
   - `git push -u origin HEAD`  
   Or use the repo helper: `sh scripts/git-pr.sh` only pushes then runs `gh pr create` — see step 4.

4. **Create the PR**
   - Preferred: `gh pr create --base main --head "$(git branch --show-current)" --fill`  
     (`--fill` uses the latest commit subject/body when possible.)
   - Or with explicit title:  
     `gh pr create --base main --title "feat: short title" --body "What changed and why."`
   - First-time branch: `git push -u origin HEAD` must succeed before `gh pr create`.

5. **Confirm CI**
   - Output the PR URL from `gh`.
   - Note that **CI runs automatically** on `pull_request` to `main` (see `.github/workflows/ci.yml`).
   - Optional: `gh pr checks watch` or open the **Checks** tab on the PR.

## Do not

- Force-push or `--force` unless the user explicitly asks.
- Merge the PR unless asked.
- Change the base branch away from what the user requested (default **main**).

## If something fails

- **`gh` not found**: install from https://cli.github.com/ and `gh auth login`.
- **Push rejected**: pull/rebase or resolve with the user; do not force-push by default.
- **CI fails on GitHub**: read the failing job log, fix, commit, push — checks re-run on the same PR.
