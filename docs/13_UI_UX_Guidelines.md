# UI/UX Guidelines

## 1. Design Philosophy
CrossMart must transcend the typical "budget MVP" look. The platform should immediately instill **Trust, Premium Quality, and Dynamism**. 
- **WOW Factor:** High-quality assets, smooth transitions, and a modern aesthetic.
- **Trust:** Clean interfaces, transparent tracking bars, and verified badges.

## 2. Aesthetics & Styling

### 2.1 Color Palette
Avoid generic `#FF0000` or `#00FF00`.
- **Primary Accent:** A vibrant, modern color (e.g., `HSL(250, 85%, 60%)` - a deep energetic indigo/purple) to signify premium service.
- **Background (Light Mode):** `HSL(0, 0%, 98%)` (Off-white, clean).
- **Background (Dark Mode):** `HSL(220, 20%, 10%)` (Sleek, deep slate).
- **Success/Verified:** A tailored teal or emerald `HSL(160, 70%, 45%)`.
- **Warning/Promo:** A warm, urgent amber `HSL(35, 90%, 55%)`.

### 2.2 Typography
- **Primary Font:** `Inter` or `Outfit` from Google Fonts. 
- Clean, highly legible sans-serif for numbers (prices) and dense information (cargo tracking).

### 2.3 Glassmorphism & Depth
- Use subtle backdrop-filters (`backdrop-blur-md`) on sticky headers, modal overlays, and notification toasts.
- Employ soft, multi-layered shadows (`box-shadow`) in Light Mode to lift cards off the page, rather than flat borders.

## 3. Micro-Animations & Interactivity
To make the app feel alive:
- **Hover States:** Buttons should smoothly scale up (`scale-105`) and shift background gradients on hover (`transition-all duration-300`).
- **Page Transitions:** Soft fade-ins when navigating between catalog and product pages.
- **Cart Interactions:** When an item is added to the cart, the cart icon should animate (a slight bounce or badge pulse).
- **Cargo Tracking:** The progress bar should dynamically "fill" when a user opens the order detail page, rather than just appearing static.

## 4. Components & Layout
- **TailwindCSS + shadcn/ui:** Use as a base but heavily customize the theme configuration to inject the premium color palette.
- **Responsive First:** Mobile-web optimization is critical for the Myanmar market. Touch targets must be large (min `44px` height). Bottom navigation bars for mobile views to mimic native apps.
- **Card Design:** Product cards should feature rounded corners (`rounded-2xl`), edge-to-edge images, and absolute-positioned pill badges for "Cargo" or "In Stock".
