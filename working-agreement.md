# Working Agreement — CrossMart

> How this team works together. Agreed by all members. Sensible defaults — edit to fit,
> but keep each section answered.

## Communication
- Main channel: <!-- your team chat -->
- Async **standup** daily: post *yesterday / today / blockers*.
- Weekly **planning** (30–60 min) + a short **retro** each week.
- Expected response time on a mention: ~24h.

## Decisions
- Default: consensus. If stuck, the week's **Anchor** decides and records it as an ADR
  (`docs/decisions/`).
- Big choices (framework, DB, AI model, hosting) get a one-line ADR.

## Code & reviews
- **GitHub Flow:** branch off `main` (`feat/…` / `fix/…`) → PR → **1 review from a
  teammate (not the author)** → merge. **No direct push to `main`. No self-merge.**
- Keep PRs small (< ~300 lines). Open a **Draft PR** early.
- CI (`ci`) must be green. Never commit secrets or `.env`.
- Pull `main` daily to avoid merge conflicts.

## UAT & Bug Fixing Phase (Current Phase)
- **Current State**: The application's core infrastructure (Frontend, Backend, and DB connection configs) is **STABLE**.
- **Manual Testing**: We are now conducting UAT (User Acceptance Testing). The app must be reviewed manually by the team.
- **Reporting Issues**: All bugs and issues must be listed on Git/GitHub with clear steps to reproduce.
- **Fixing Issues (CRITICAL RULE)**: When fixing issues, team members are **NOT ALLOWED** to touch or modify infrastructure code, frontend configuration, backend configuration, or DB configuration. Only modify application logic and UI to fix the reported bugs.
- **Standard Git Workflow for Bug Fixes**:
  1. **Create Branch**: Create a new branch from `main` for each specific issue from the Git issue list (e.g., `git checkout -b fix/issue-name`).
  2. **Fix Issue**: Implement the fix locally.
  3. **Sync with Main**: After fixing the issue, pull the latest changes from main (`git pull origin main`) into your branch to resolve any conflicts locally.
  4. **Commit & Push**: Commit your resolved changes and push the branch.
  5. **Create PR**: Open a Pull Request.
  6. **Check CI**: Verify the Continuous Integration (CI) status on the PR.
  7. **Resolve Issues**: If there are merge conflicts on the PR or if the CI fails, fix them directly on your current branch, then commit and push again.

## Roles (rotate weekly)
- **Anchor** — owns the board + `main` health + unblocking. (this week: ____)
- **Driver / Navigator** — pair on hard issues, swap who types.
- **Reviewer of the week** — first to review open PRs. (this week: ____)

## When someone is stuck or absent
- Say so early — being blocked is normal, staying silent is the problem.
- Pair with the Anchor or a teammate. Use `good-first-issue` labels for newer members.
- If a member goes quiet 3+ days, the Anchor checks in privately first.

---

_Signed (all members):_
-
