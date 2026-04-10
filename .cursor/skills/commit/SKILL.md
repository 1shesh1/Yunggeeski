---
name: commit
description: >-
  Stages every change in the working tree and creates a git commit on the
  current branch with a clear message derived from the diff. Use when the user
  invokes /commit, asks to commit all changes, or wants everything committed on
  the current branch without switching branches.
---

# Commit all changes (current branch)

## When this applies

User intent: **one commit** that includes **all** local modifications (tracked + untracked), on **whatever branch is checked out** — no branch switch unless they ask.

## Steps

1. **Confirm repo and branch** (from project root):
   - `git status`
   - `git branch --show-current`
   - If there is nothing to commit, say so and stop.

2. **Stage everything**:
   - `git add -A`

3. **Draft the message** from staged diff:
   - `git diff --cached --stat`
   - `git diff --cached` (enough to see what changed; not necessarily full huge blobs)
   - Use a **Conventional Commits**-style subject, imperative mood, ~72 chars:
     - `feat: …` `fix: …` `chore: …` `docs: …` `refactor: …` `style: …` `test: …`
   - Add a short body if multiple concerns or non-obvious rationale.

4. **Commit**:
   - `git commit -m "subject" -m "optional body"`
   - On Windows PowerShell, avoid unclosed quotes; escape inner `"` or use single-quoted outer strings where safe.

5. **Verify**:
   - `git status` — working tree clean (or only leftover ignored files).

## Do not

- Switch branches or create a new branch unless the user asked.
- `git push` unless they explicitly want a push.
- `--amend` or `--force` unless they explicitly ask.
- Commit if the user is on the wrong branch **and** they expressed a branch preference — then clarify first.

## If something blocks the commit

- **Pre-commit hook failure**: show hook output; fix issues or tell the user what failed.
- **Merge conflict / unmerged paths**: do not force-commit; explain and stop.
- **Large/binary or sensitive files** staged unexpectedly: call it out before committing.
