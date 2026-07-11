---
name: shadcn
description: shadcn/ui component library rules — component usage, customization, and integration with Next.js
---

# shadcn/ui Skill

## Component Library

CrossMart uses **shadcn/ui** for all UI components. Never build custom components when shadcn has them.

---

## Available Components

| Component | Import |
|---|---|
| Button | `@/components/ui/button` |
| Card | `@/components/ui/card` |
| Dialog | `@/components/ui/dialog` |
| Dropdown Menu | `@/components/ui/dropdown-menu` |
| Form | `@/components/ui/form` |
| Input | `@/components/ui/input` |
| Label | `@/components/ui/label` |
| Select | `@/components/ui/select` |
| Table | `@/components/ui/table` |
| Tabs | `@/components/ui/tabs` |
| Badge | `@/components/ui/badge` |
| Avatar | `@/components/ui/avatar` |
| Separator | `@/components/ui/separator` |
| Sheet | `@/components/ui/sheet` |
| Toast | `@/components/ui/toast` |
| Tooltip | `@/components/ui/tooltip` |
| Skeleton | `@/components/ui/skeleton` |

---

## Usage Rules

**Always:**
- Import from `@/components/ui/`
- Use TypeScript props
- Follow shadcn patterns
- Customize via CSS variables

**Never:**
- Build custom buttons, inputs, cards
- Use raw HTML elements for interactive components
- Skip accessibility features
- Override shadcn internals

---

## Adding New Components

```bash
npx shadcn-ui@latest add [component]
```

## Customization

Modify `components/ui/` files directly for project-specific needs.
Use TailwindCSS classes for styling variations.
