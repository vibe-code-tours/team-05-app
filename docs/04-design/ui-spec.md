# UI Specification

## 1. Design Tokens

### 1.1 Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#E11D48` (Rose 600) | Primary accent, CTAs, active states |
| `--primary-hover` | `#BE123C` (Rose 700) | Hover state for primary elements |
| `--primary-light` | `#FFF1F2` (Rose 50) | Light backgrounds, subtle highlights |
| `--background` | `HSL(0, 0%, 98%)` | Page background (light mode) |
| `--background-dark` | `HSL(220, 20%, 10%)` | Page background (dark mode) |
| `--success` | `HSL(160, 70%, 45%)` | Verified badges, success states |
| `--warning` | `HSL(35, 90%, 55%)` | Promo badges, warnings |
| `--muted` | `HSL(240, 5%, 96%)` | Muted backgrounds, disabled states |
| `--muted-foreground` | `HSL(240, 4%, 46%)` | Secondary text, placeholders |
| `--border` | `HSL(240, 6%, 90%)` | Default borders |
| `--ring` | `#E11D48` | Focus rings |

### 1.2 Typography

| Token | Font | Weight | Size | Line Height | Usage |
|-------|------|--------|------|-------------|-------|
| `--font-sans` | Inter / Outfit | 400-700 | 16px base | 1.5 | Body text |
| `--font-mono` | JetBrains Mono | 400 | 14px | 1.6 | Code, tracking numbers |
| `heading-1` | Inter | 700 | 2rem (32px) | 1.2 | Page titles |
| `heading-2` | Inter | 600 | 1.5rem (24px) | 1.3 | Section headings |
| `heading-3` | Inter | 600 | 1.125rem (18px) | 1.4 | Card titles |
| `body` | Inter | 400 | 1rem (16px) | 1.5 | Body copy |
| `body-sm` | Inter | 400 | 0.875rem (14px) | 1.5 | Captions, metadata |
| `price` | Inter | 700 | 1.25rem (20px) | 1.2 | Prices (high legibility) |

### 1.3 Spacing (4px grid)

All spacing values are multiples of 4px:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing (icon gaps) |
| `--space-2` | 8px | Inline spacing, small gaps |
| `--space-3` | 12px | Compact padding |
| `--space-4` | 16px | Standard padding, card gaps |
| `--space-5` | 20px | Section spacing |
| `--space-6` | 24px | Card padding, group gaps |
| `--space-8` | 32px | Section margins |
| `--space-10` | 40px | Large section spacing |
| `--space-12` | 48px | Page section gaps |
| `--space-16` | 64px | Major section breaks |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small chips |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals, large cards |
| `--radius-2xl` | 16px | Product cards (rounded-2xl) |
| `--radius-full` | 9999px | Avatars, pills |

### 1.5 Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle lift on hover |
| `shadow-md` | Card default state |
| `shadow-lg` | Dropdown menus, popovers |
| `shadow-xl` | Modals |
| `glass` | Backdrop blur + semi-transparent bg (glassmorphism) |

## 2. Component Library: shadcn/ui

### 2.1 Base Components

The project uses [shadcn/ui](https://ui.shadcn.com) as the component foundation, with heavy theme customization via `tailwind.config.ts` to inject the CrossMart design tokens.

Core components in use:

| Component | Customization |
|-----------|---------------|
| `Button` | Primary rose accent, scale-105 hover, gradient shifts |
| `Input` / `Select` | Custom focus ring color, larger touch targets (min 44px height) |
| `Card` | `rounded-2xl`, layered shadows, edge-to-edge images |
| `Dialog` / `Sheet` | Glassmorphism overlay, backdrop-blur-md |
| `Badge` | Absolute-positioned pills for "Cargo", "In Stock", "Verified" |
| `Toast` | Animated slide-in with backdrop-blur |
| `Avatar` | Verified badge overlay |
| `Tabs` | Rose accent underline indicator |
| `DropdownMenu` | Soft shadow-lg, smooth open transition |

### 2.2 Custom Components

| Component | Description |
|-----------|-------------|
| `TrackingBar` | Dynamic progress fill animation for cargo tracking |
| `ProductCard` | Rounded-2xl card with image, price pill, status badge |
| `CartIcon` | Animated bounce/badge pulse on item add |
| `BottomNav` | Mobile-only fixed bottom navigation bar |
| `SidebarNav` | Desktop-only fixed sidebar navigation |
| `CargoTimeline` | Step-by-step cargo tracking with animated connectors |
| `PriceDisplay` | Formatted price with currency, high legibility |

## 3. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| `xs` | 0-479px | Small phones, stacked layout |
| `sm` | 480-767px | Large phones, bottom nav |
| `md` | 768-1023px | Tablets, bottom nav |
| `lg` | 1024-1279px | Small desktops, sidebar nav |
| `xl` | 1280px+ | Large desktops, sidebar nav |

Mobile-first approach: base styles target mobile, `sm:` / `md:` / `lg:` / `xl:` prefixes add complexity for larger screens.

## 4. Touch Targets

- Minimum touch target size: **44px x 44px** (per WCAG 2.2 and Apple HIG)
- Bottom nav items: 48px height minimum
- Buttons: min-height 44px, min-width 44px
- Tap area padding extends beyond visible bounds for small icons

## 5. Glassmorphism

- Applied to sticky headers, modal overlays, and notification toasts
- CSS: `backdrop-blur-md bg-background/80`
- Light mode: `bg-white/80` with subtle border
- Dark mode: `bg-slate-900/80` with subtle border

## 6. Micro-Animations

| Element | Animation | Tailwind |
|---------|-----------|----------|
| Button hover | Scale up + gradient shift | `hover:scale-105 transition-all duration-300` |
| Page transitions | Soft fade-in | `animate-in fade-in` |
| Cart icon | Bounce/pulse on add | `animate-bounce` (one-shot) |
| Tracking bar | Dynamic fill on mount | CSS animation, width transition |
| Card hover | Shadow lift | `hover:shadow-lg transition-shadow duration-200` |

## 7. Dark Mode

- Implemented via CSS custom properties and Tailwind `dark:` variant
- Toggle in user settings and system preference detection
- All design tokens have dark-mode variants
- Shadows replaced with border highlights in dark mode for depth
