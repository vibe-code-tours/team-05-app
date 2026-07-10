# Speckit Workflow

## Overview

Specification-driven development workflow. Write a spec → validate → implement → verify.

---

## Flow

```
1. Write Spec
   ↓
2. Validate Spec
   ↓
3. Plan Implementation
   ↓
4. Generate Code
   ↓
5. Verify Against Spec
   ↓
6. Deliver
```

---

## Step 1: Write Spec

**Agent:** business-analyst (assists with spec writing)

- [ ] Problem statement defined
- [ ] User story written
- [ ] Acceptance criteria listed (min 3)
- [ ] API endpoints designed
- [ ] Database changes defined
- [ ] UI described
- [ ] Business rules documented
- [ ] Edge cases considered

**Template:** Use `.claude/templates/spec.md`

**Output:** Complete spec file

---

## Step 2: Validate Spec

**Agent:** architect + product-owner

- [ ] Problem is clear and solvable
- [ ] User story follows format (role + action + benefit)
- [ ] Acceptance criteria are testable
- [ ] API follows REST conventions
- [ ] Database design is normalized
- [ ] No conflicts with existing features
- [ ] Dependencies identified
- [ ] Scope is manageable (not too large)

**If invalid:** Return to Step 1 with feedback
**If valid:** Proceed to Step 3

**Output:** Validated spec

---

## Step 3: Plan Implementation

**Agent:** architect

- [ ] Map spec sections → files to create/modify
- [ ] Identify which agents to invoke
- [ ] Identify which skills to load
- [ ] Estimate complexity
- [ ] Define implementation order

**Routing from spec:**
| Spec Section | Agent | Skill |
|---|---|---|
| API | backend | nestjs |
| Database | database | prisma, postgres |
| UI | frontend | nextjs, shadcn, tailwind |
| Rules | backend | (domain skill) |
| Testing | qa | testing |

**Output:** Implementation plan

---

## Step 4: Generate Code

**Agents:** Based on implementation plan

### 4a. Database First
- Agent: `database`
- Skill: `prisma`
- Creates: Schema, migration

### 4b. Backend
- Agent: `backend`
- Skill: `nestjs` + domain skill
- Creates: Module, controller, service, DTOs, repository

### 4c. Frontend
- Agent: `frontend`
- Skill: `nextjs` + `shadcn` + `tailwind`
- Creates: Pages, components, hooks

### 4d. Tests
- Agent: `qa`
- Skill: `testing`
- Creates: Unit, integration, E2E tests

**Output:** Working implementation

---

## Step 5: Verify Against Spec

**Subagents:** All relevant reviewers

- [ ] Every acceptance criterion met
- [ ] Every API endpoint works
- [ ] Every database change applied
- [ ] Every UI component renders
- [ ] Every business rule enforced
- [ ] Every edge case handled
- [ ] Every test passes

**Verification matrix:**
| Spec Section | Verified | Notes |
|---|---|---|
| Acceptance Criteria | ☐ | |
| API | ☐ | |
| Database | ☐ | |
| UI | ☐ | |
| Rules | ☐ | |
| Edge Cases | ☐ | |

**If failures:** Return to Step 4 with specific fixes
**If all pass:** Proceed to Step 6

**Output:** Verification report

---

## Step 6: Deliver

**Agent:** devops (if deployment needed)

- [ ] Code committed
- [ ] PR created
- [ ] CI passes
- [ ] Documentation updated
- [ ] Spec marked as "Implemented"

**Output:** Deliverable ready for review

---

## Example: Full Speckit Run

### Input (Spec)
```
Feature: Product Search
Problem: Users can't find products
API: GET /api/v1/products?q=&category=&brand=&page=&limit=
DB: Full-text search, indexes on category_id, brand_id
UI: Search bar + filter sidebar + product grid
Rules: Min 2 chars, max 20 per page, sort by relevance
```

### Process
1. business-analyst validates spec ✓
2. architect plans: search module + Prisma full-text + Next.js page
3. database creates: indexes, search query
4. backend creates: GET /api/v1/products with search/filter/pagination
5. frontend creates: search bar, filter sidebar, product grid
6. qa creates: search tests, filter tests, pagination tests
7. code-reviewer verifies everything

### Output
- `src/modules/product/` — full module
- `app/(main)/products/` — search page
- `prisma/migrations/` — search indexes
- `__tests__/product/` — test suite
- All verified against spec ✓
