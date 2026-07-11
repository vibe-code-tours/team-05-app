# Bug Workflow

## Overview
Complete workflow for fixing a bug from report to resolution.

---

## Flow

```
Bug Report
  ↓
1. Reproduce
  ↓
2. Root Cause Analysis
  ↓
3. Fix Implementation
  ↓
4. Regression Testing
  ↓
5. Code Review
  ↓
6. Merge to Main
```

---

## Step 1: Reproduce
**Agent:** qa

- [ ] Confirm bug exists
- [ ] Document reproduction steps
- [ ] Identify affected environment
- [ ] Capture screenshots/logs
- [ ] Determine severity

**Output:** Reproduction steps and severity

---

## Step 2: Root Cause Analysis
**Agent:** code-reviewer

- [ ] Identify root cause
- [ ] Check for related issues
- [ ] Assess impact scope
- [ ] Plan fix approach

**Output:** Root cause and fix plan

---

## Step 3: Fix Implementation
**Agent:** backend/frontend (depending on bug)

- [ ] Implement fix
- [ ] Follow coding standards
- [ ] Handle edge cases
- [ ] Add/update tests

**Output:** Bug fix code

---

## Step 4: Regression Testing
**Agent:** qa, test-writer

- [ ] Verify bug is fixed
- [ ] Run existing tests
- [ ] Test related functionality
- [ ] Check edge cases

**Output:** Test results

---

## Step 5: Code Review
**Subagents:** code-reviewer

- [ ] Review fix quality
- [ ] Check for side effects
- [ ] Verify tests

**Output:** Review approval

---

## Step 6: Merge
**Agent:** devops

- [ ] CI passes
- [ ] PR approved
- [ ] Merge to main

**Output:** Fix merged to main
