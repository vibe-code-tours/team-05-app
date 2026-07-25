# CrossMart Home Page Redesign

## Overview

After reading the README, docs, and analyzing all home components, I have a thorough understanding of **CrossMart** — Myanmar's trusted cross-border marketplace. The platform handles **In Stock**, **Cargo** (from Bangkok), and **Promotion** products with real-time tracking, verified sellers, and local payment methods (KPay, WavePay).

The current home page already has a good structure but needs significant visual elevation. The docs specifically call for:
- **WOW Factor** — premium quality aesthetic, not a "budget MVP"
- **Deep energetic indigo/purple** `HSL(250, 85%, 60%)` as primary accent (current is red `#e11d48`)
- **Glassmorphism** on headers, modals, toast
- **Micro-animations** — smooth hover effects, stagger-in, badge pop
- **Trust signals** — verified seller badges, cargo tracking showcase

## Current State Analysis

The home is structured as:
1. `HeroBanner` — 3-slide carousel with floating cards (already well built)
2. `FeaturedProducts` — 8-product grid
3. `PromoBanner` (free shipping)
4. `CategoryGrid` — icon-based category browsing
5. `WhyChooseUs` — 6-feature grid
6. `NewArrivals` — horizontal scroll carousel
7. `Testimonials` — single testimonial carousel + stats
8. `PromoBanner` (referral)

## Issues to Solve

- Primary color is generic red — needs to shift toward indigo/purple per UI/UX guidelines
- `WhyChooseUs` CTA section has plain, generic styling
- `Testimonials` stats area lacks visual drama
- `CategoryGrid` cards are flat/minimal — need depth and glassmorphism
- The home page `page.tsx` has no Myanmar/cargo-specific section to highlight the cross-border USP
- Missing a **"How It Works"** or **"Cargo Tracking"** section that showcases the platform's unique value

## Proposed Redesign Plan

### Section Additions (in `page.tsx`)
1. Add a **Cargo Showcase Section** — A premium dark-mode strip showing the Bangkok → Myanmar cargo journey with step-by-step visual tracking progress
2. Add a **Stats Strip** — Animated counters for sellers, products, orders (currently buried in testimonials)

### Component Redesigns

#### [MODIFY] `globals.css`
- Update primary color tokens: shift from rose red to vibrant indigo `HSL(250, 85%, 60%)`
- Add new keyframe animations: `count-up`, `slide-in-left`, `cargo-path`
- Add glassmorphism utilities

#### [MODIFY] `category-grid.tsx`
- Replace flat icon cards with gradient glassmorphic tiles
- Add emoji flags for cross-border categories (🇹🇭 Thailand, 🇯🇵 Japan, 🇰🇷 Korea)
- Add subtle hover glow and `translate-y` lift
- Section background: sleek mesh gradient

#### [MODIFY] `why-choose-us.tsx`
- Redesign as a two-column layout: left text block + right feature grid
- Feature cards with animated gradient icon backgrounds
- Replace plain CTA banner with a premium dark gradient card

#### [MODIFY] `testimonials.tsx`
- Switch from single-card carousel to a 3-column masonry grid (visible all at once on desktop)
- Stats strip redesigned as a glowing counter row with indigo accent

#### [NEW] `cargo-showcase.tsx`
- New section: dark navy background with animated step-progress bar (Bangkok → Customs → Yangon)
- 3-step visual journey using gradient icons and dotted connecting line
- CTA: "Track Your Order" button

#### [MODIFY] `page.tsx`
- Add `CargoShowcase` between `CategoryGrid` and `WhyChooseUs`
- Add stats strip above `Testimonials`

## Color Palette Change

> [!IMPORTANT]
> The UI/UX guidelines specify indigo/purple `HSL(250, 85%, 60%)` as primary accent. The current codebase uses rose red `#e11d48`. The redesign will update the primary color to align with the documented guidelines. All components that use `text-primary` / `bg-primary` will automatically update.

## Verification Plan

### Manual Verification
- Start dev server `npm run dev` in `apps/web`
- Review home page in browser at `localhost:3000`
- Check on mobile viewport (375px) for responsive layout

## Open Questions

> [!NOTE]
> Should the primary color be changed from red to indigo/purple as documented in the UI/UX guidelines? The current implementation uses `#e11d48` (rose red) but the docs specify `HSL(250, 85%, 60%)`. I'll proceed with the documented color unless you prefer to keep the existing red theme.
