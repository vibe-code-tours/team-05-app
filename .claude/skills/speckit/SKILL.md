---
name: speckit
description: Specification-driven development — write specs, generate code, reduce iteration cycles
---

# Speckit Skill

## What is Speckit

Speckit is a **specification-first development framework**. You write a detailed spec, and Claude generates the full implementation from it.

**Core principle:** Get the spec right, and the code writes itself.

---

## Why Use Speckit

| Problem | Speckit Solution |
|---|---|
| Vague requirements → wrong code | Structured spec forces clarity |
| Multiple back-and-forth iterations | One good spec = one correct implementation |
| Inconsistent implementations | Spec is the single source of truth |
| Missing edge cases | Spec template enforces completeness |
| No documentation | Spec IS the documentation |

---

## How It Works

```
1. WRITE SPEC
   User describes feature in structured spec format
   ↓
2. VALIDATE SPEC
   Claude reviews spec for completeness
   ↓
3. PLAN IMPLEMENTATION
   Claude maps spec → agents, skills, files
   ↓
4. GENERATE CODE
   Claude implements from spec using .claude/ agents + skills
   ↓
5. VERIFY
   Claude validates implementation against spec
   ↓
6. DELIVER
   Code + tests + docs generated from single spec
```

---

## Spec Format

See [spec-format.md](./spec-format.md) for the complete spec format reference.

### Quick Example

```markdown
# Feature: Product Search

## Problem
Users can't find products quickly. Need search with filters.

## User Story
As a client, I want to search products by name, category, and brand
so that I can find what I'm looking for quickly.

## API
- GET /api/v1/products?q=search&category=uuid&brand=uuid&page=1&limit=20

## Database
- Full-text search on Product.name and Product.description
- Index on category_id, brand_id

## UI
- Search bar with autocomplete
- Filter sidebar (category, brand, price range, rating)
- Product grid with pagination

## Rules
- Min 2 characters to search
- Max 20 results per page
- Sort by relevance by default
```

---

## Spec vs Traditional Requirements

| Traditional | Speckit |
|---|---|
| "Add search functionality" | Full spec with API, DB, UI, rules |
| Ambiguous, needs clarification | Clear, implementable immediately |
| Scattered across tickets | Single file, single source |
| No validation | Spec validation before coding |
| Code diverges from requirements | Code generated FROM spec |

---

## Integration with .claude/ Framework

Speckit works WITH your existing agents and skills:

```
SPEC
  ↓
Agent Router (CLAUDE.md)
  ↓
┌─────────────────────────────────────┐
│ architect    → system design        │
│ database     → schema + migration   │
│ backend      → API + service        │
│ frontend     → pages + components   │
│ qa           → tests                │
│ documentation → docs update         │
└─────────────────────────────────────┘
  ↓
SUBAGENTS
  ↓
┌─────────────────────────────────────┐
│ code-reviewer  → quality check      │
│ api-reviewer   → REST conventions   │
│ migration-reviewer → DB safety      │
└─────────────────────────────────────┘
  ↓
DELIVERABLE
```

---

## When to Use Speckit

### Use Speckit When:
- ✅ New feature implementation
- ✅ Complex business logic
- ✅ Multi-step workflows
- ✅ API + Database + UI all needed
- ✅ Multiple agents involved
- ✅ Feature has clear acceptance criteria

### Skip Speckit When:
- ❌ Simple bug fix
- ❌ Typo correction
- ❌ Config change
- ❌ Quick one-liner

---

## Spec Quality Checklist

Before generating code, validate the spec:

- [ ] Problem statement clear
- [ ] User story with role, action, benefit
- [ ] API endpoints defined (method, path, params)
- [ ] Database changes defined (models, indexes)
- [ ] UI components described
- [ ] Business rules listed
- [ ] Acceptance criteria specific
- [ ] Edge cases considered
- [ ] Error handling defined
- [ ] Dependencies identified

---

## Rules

**Always:**
- Write spec BEFORE code
- Validate spec completeness
- Map spec to agents automatically
- Generate code from spec
- Verify implementation matches spec

**Never:**
- Skip spec for complex features
- Start coding without spec
- Modify spec after code generation without re-generating
- Ignore edge cases in spec
