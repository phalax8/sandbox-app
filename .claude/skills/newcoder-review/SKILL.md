---
name: newcoder-review
description: Review code changes with newcoder and handle its findings. Use before finishing any coding task.
---

Review the current changes with newcoder before finishing a task.

1. Run `newcoder review --format markdown` (add a branch or commit to review something else).
2. Read every finding. Fix the real ones; for false positives, run
   `newcoder findings dismiss <id> --reason "<why>"` instead of ignoring them.
3. Never weaken or skip tests to make a finding disappear.
