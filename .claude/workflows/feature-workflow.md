# Feature Workflow

## Overview
Complete workflow for implementing a new feature from idea to merge.

---

## Flow

```
Idea
  ↓
1. Business Analysis
  ↓
2. Architecture Design
  ↓
3. Database Design
  ↓
4. API Development
  ↓
5. Frontend Development
  ↓
6. Testing
  ↓
7. Documentation
  ↓
8. Code Review
  ↓
9. Merge to Main
```

---

## Step 1: Business Analysis
**Agent:** business-analyst

- [ ] Write user story
- [ ] Define acceptance criteria
- [ ] Identify edge cases
- [ ] Document business rules
- [ ] Create feature spec

**Output:** User story with acceptance criteria

---

## Step 2: Architecture Design
**Agent:** architect

- [ ] Design system integration
- [ ] Define module boundaries
- [ ] Plan API contracts
- [ ] Identify dependencies
- [ ] Create ADR if needed

**Output:** Architecture decision and design

---

## Step 3: Database Design
**Agent:** database

- [ ] Design ERD changes
- [ ] Create Prisma schema
- [ ] Define indexes
- [ ] Plan migration
- [ ] Create seed data

**Output:** Prisma migration

---

## Step 4: API Development
**Agent:** backend

- [ ] Create module structure
- [ ] Implement DTOs
- [ ] Implement service
- [ ] Implement controller
- [ ] Add guards/interceptors

**Output:** Working API endpoints

---

## Step 5: Frontend Development
**Agent:** frontend

- [ ] Create pages
- [ ] Create components
- [ ] Implement forms
- [ ] Add state management
- [ ] Handle loading/error states

**Output:** Working UI

---

## Step 6: Testing
**Agent:** qa, test-writer

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests (critical flows)
- [ ] Manual testing
- [ ] Regression testing

**Output:** Test suite

---

## Step 7: Documentation
**Agent:** documentation

- [ ] Update README if needed
- [ ] Document API endpoints
- [ ] Update architecture docs
- [ ] Add inline comments

**Output:** Updated documentation

---

## Step 8: Code Review
**Subagents:** code-reviewer, api-reviewer, product-reviewer

- [ ] Code quality review
- [ ] API conventions review
- [ ] Business rule review
- [ ] Security review
- [ ] Performance review

**Output:** Review approval

---

## Step 9: Merge
**Agent:** devops

- [ ] CI passes (lint, test, build)
- [ ] PR approved by 1 teammate
- [ ] No merge conflicts
- [ ] Branch up to date with main
- [ ] Merge to main
- [ ] Delete feature branch

**Output:** Feature merged to main
