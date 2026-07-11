---
name: tailwind
description: TailwindCSS styling rules — utility classes, responsive design, design tokens, and consistent spacing
---

# TailwindCSS Skill

## Design Tokens

### Colors
```css
--primary: #E11D48;        /* Rose 600 */
--primary-light: #FB7185;  /* Rose 400 */
--primary-dark: #BE123C;   /* Rose 700 */
--secondary: #0F172A;      /* Slate 900 */
--accent: #F59E0B;         /* Amber 500 */
--success: #10B981;        /* Emerald 500 */
--warning: #F59E0B;        /* Amber 500 */
--error: #EF4444;          /* Red 500 */
```

### Spacing (4px grid)
```
p-1: 4px    p-2: 8px    p-3: 12px   p-4: 16px
p-5: 20px   p-6: 24px   p-8: 32px   p-10: 40px
p-12: 48px  p-16: 64px
```

### Border Radius
```
rounded-sm: 4px    rounded-md: 8px    rounded-lg: 12px
rounded-xl: 16px   rounded-2xl: 24px  rounded-full: 9999px
```

---

## Responsive Breakpoints

```
sm: 640px    (mobile landscape)
md: 768px    (tablet)
lg: 1024px   (desktop)
xl: 1280px   (large desktop)
2xl: 1536px  (extra large)
```

### Mobile-First Pattern
```tsx
<div className="
  w-full                    // mobile: full width
  md:w-1/2                  // tablet: half width
  lg:w-1/3                  // desktop: third width
  p-4 md:p-6 lg:p-8        // responsive padding
">
```

---

## Common Patterns

### Card
```tsx
<div className="rounded-xl border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

### Flex Center
```tsx
<div className="flex items-center justify-center">
```

---

## Rules

**Always:**
- Use utility classes
- Mobile-first responsive
- Use design tokens
- Consistent spacing (4px grid)

**Never:**
- Write custom CSS when Tailwind works
- Use arbitrary values without reason
- Skip responsive design
- Mix spacing systems
