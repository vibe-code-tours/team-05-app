'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveBanners, type Banner } from '@/lib/services/product.service';

/* ─── Slide data (derived from DB banners + fallback defaults) ── */

interface SlideData {
  id: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  cta: string;
  href: string;
  image?: string;
  gradient: string;
  gradientMesh: string;
  accent: string;
  categories: string[];
  floatingCards: { emoji: string; label: string; price: string; rotate: number }[];
}

const defaultSlides: SlideData[] = [
  {
    id: 'default-1',
    title: 'Cross-Border',
    titleAccent: 'Shopping',
    subtitle: 'Authentic Thai products delivered straight to Myanmar — fast, affordable, trusted by thousands.',
    cta: 'Shop Thailand Collection',
    href: '/products?type=CARGO',
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    gradientMesh:
      'radial-gradient(ellipse at 20% 50%, rgba(251,113,133,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(244,114,182,0.4) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(232,121,249,0.3) 0%, transparent 50%)',
    accent: '#fda4af',
    categories: ['Thai Skincare', 'Electronics', 'Fashion', 'Beauty'],
    floatingCards: [
      { emoji: '\u{1F484}', label: 'Thai Skincare', price: '15,000 MMK', rotate: -6 },
      { emoji: '\u{1F4F1}', label: 'Electronics', price: '89,000 MMK', rotate: 3 },
      { emoji: '\u{1F457}', label: 'Fashion', price: '25,000 MMK', rotate: -2 },
    ],
  },
  {
    id: 'default-2',
    title: 'New',
    titleAccent: 'Arrivals',
    subtitle: 'Discover the latest trends from Thailand, Japan, and Korea — updated daily with fresh inventory.',
    cta: 'Explore New Arrivals',
    href: '/products?type=IN_STOCK',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    gradientMesh:
      'radial-gradient(ellipse at 30% 40%, rgba(167,139,250,0.5) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.3) 0%, transparent 50%)',
    accent: '#c4b5fd',
    categories: ['K-Beauty', 'J-Fashion', 'Home Decor', 'Accessories'],
    floatingCards: [
      { emoji: '\u{1F338}', label: 'K-Beauty', price: '12,000 MMK', rotate: 4 },
      { emoji: '\u{1F6CD}', label: 'J-Fashion', price: '45,000 MMK', rotate: -5 },
      { emoji: '\u{1F3E0}', label: 'Home Decor', price: '18,000 MMK', rotate: 2 },
    ],
  },
  {
    id: 'default-3',
    title: 'Flash',
    titleAccent: 'Sale',
    subtitle: 'Grab incredible deals before they disappear — limited time offers up to 70% off.',
    cta: 'View Flash Deals',
    href: '/products?type=PROMOTION',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    gradientMesh:
      'radial-gradient(ellipse at 25% 60%, rgba(251,191,36,0.5) 0%, transparent 50%), radial-gradient(ellipse at 75% 30%, rgba(249,115,22,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(239,68,68,0.3) 0%, transparent 50%)',
    accent: '#fcd34d',
    categories: ['Up to 70% Off', 'Weekend Only', 'Best Sellers', 'Clearance'],
    floatingCards: [
      { emoji: '\u{1F525}', label: 'Hot Deal', price: '5,000 MMK', rotate: -4 },
      { emoji: '\u{1F381}', label: 'Bundle Set', price: '22,000 MMK', rotate: 6 },
      { emoji: '⭐', label: 'Top Rated', price: '35,000 MMK', rotate: -3 },
    ],
  },
];

/** Gradient presets to cycle through for DB banners */
const gradientPresets = [
  {
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    gradientMesh:
      'radial-gradient(ellipse at 20% 50%, rgba(251,113,133,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(244,114,182,0.4) 0%, transparent 50%)',
    accent: '#fda4af',
  },
  {
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    gradientMesh:
      'radial-gradient(ellipse at 30% 40%, rgba(167,139,250,0.5) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.4) 0%, transparent 50%)',
    accent: '#c4b5fd',
  },
  {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    gradientMesh:
      'radial-gradient(ellipse at 25% 60%, rgba(251,191,36,0.5) 0%, transparent 50%), radial-gradient(ellipse at 75% 30%, rgba(249,115,22,0.4) 0%, transparent 50%)',
    accent: '#fcd34d',
  },
  {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    gradientMesh:
      'radial-gradient(ellipse at 20% 60%, rgba(52,211,153,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(20,184,166,0.4) 0%, transparent 50%)',
    accent: '#6ee7b7',
  },
];

function mapBannerToSlide(banner: Banner, index: number): SlideData {
  const preset = gradientPresets[index % gradientPresets.length];
  return {
    id: banner.id,
    title: banner.title,
    subtitle: '',
    cta: 'Shop Now',
    href: banner.link ?? '/products',
    image: banner.image,
    ...preset,
    categories: ['Popular', 'Trending', 'New', 'Featured'],
    floatingCards: [
      { emoji: '\u{1F6D2}', label: 'Featured', price: '19,000 MMK', rotate: -4 },
      { emoji: '⭐', label: 'Best Seller', price: '29,000 MMK', rotate: 3 },
    ],
  };
}

/* ─── Trust badges ────────────────────────────────────────── */

const trustBadges = [
  { icon: Truck, label: 'Free Shipping', sublabel: 'Orders 100K+', color: 'text-emerald-300' },
  { icon: ShieldCheck, label: 'Buyer Protection', sublabel: '100% Secure', color: 'text-blue-300' },
  { icon: RotateCcw, label: '7-Day Returns', sublabel: 'Easy & Free', color: 'text-amber-300' },
  { icon: CreditCard, label: 'Secure Payment', sublabel: 'SSL Encrypted', color: 'text-purple-300' },
];

/* ─── Sparkle particle component ────────────────────────── */

function SparkleParticles({ accent }: { accent: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${(i * 8.3) % 100}%`,
        top: `${(i * 13.7) % 100}%`,
        size: 2 + (i % 3) * 2,
        delay: `${i * 0.7}s`,
        duration: `${3 + (i % 4)}s`,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: accent,
            opacity: 0.5,
            animation: `particle-float ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating product card ────────────────────────────── */

function FloatingCard({
  emoji,
  label,
  price,
  rotate,
  delay,
}: {
  emoji: string;
  label: string;
  price: string;
  rotate: number;
  delay: number;
}) {
  return (
    <div
      className="absolute backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-3 shadow-2xl shadow-black/10"
      style={{
        animation: `float-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both, card-float ${4 + delay}s ease-in-out ${delay + 0.8}s infinite`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-xl">
          {emoji}
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">{label}</p>
          <p className="text-white/60 text-xs">from {price}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────── */

export function HeroBanner() {
  const { data: bannerResponse, isLoading } = useActiveBanners();

  /* Build slides from DB banners, fall back to defaults */
  const slides = useMemo(() => {
    const dbBanners = (bannerResponse?.data as Banner[] | undefined) ?? [];
    if (dbBanners.length > 0) {
      return dbBanners.map((b, i) => mapBannerToSlide(b, i));
    }
    return defaultSlides;
  }, [bannerResponse]);

  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % slides.length);
    setProgressKey((p) => p + 1);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    setProgressKey((p) => p + 1);
  }, [slides.length]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    setProgressKey((p) => p + 1);
  }, []);

  /* Auto-play */
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next, isPaused]);

  /* Keyboard nav */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  /* Reset current slide when banners change */
  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  /* Loading state */
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden">
        <Skeleton className="w-full min-h-[520px] md:min-h-[600px] lg:min-h-[680px] rounded-none" />
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Background layer ────────────────────────────── */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-1000`}
        />

        {/* Aurora mesh overlay */}
        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{
            background: slide.gradientMesh,
            animation: 'aurora-shift 8s ease-in-out infinite alternate',
          }}
        />

        {/* Morphing organic blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${slide.accent} 0%, transparent 70%)`,
              animation: 'morph-blob 12s ease-in-out infinite, float 15s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] opacity-20 blur-3xl"
            style={{
              background: `radial-gradient(circle, white 0%, transparent 70%)`,
              animation: 'morph-blob 15s ease-in-out 3s infinite, float-delayed 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-[30%] left-[40%] w-[300px] h-[300px] opacity-15 blur-2xl"
            style={{
              background: `radial-gradient(circle, ${slide.accent} 0%, transparent 70%)`,
              animation: 'morph-blob 10s ease-in-out 1.5s infinite',
            }}
          />
        </div>

        {/* Sparkle particles */}
        <SparkleParticles accent={slide.accent} />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      </div>

      {/* ─── Content ────────────────────────────────────── */}
      <div className="container mx-auto px-6 md:px-8 relative z-10 py-16 md:py-20 lg:py-24 min-h-[520px] md:min-h-[600px] lg:min-h-[680px] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left — Text content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div
              key={`badge-${slide.id}-${current}`}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6"
              style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0s both' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-white/90 text-xs font-medium tracking-wide uppercase">
                Myanmar&apos;s #1 Marketplace
              </span>
            </div>

            {/* Headline */}
            <div
              key={`title-${slide.id}-${current}`}
              style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
                {slide.title}{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">{slide.titleAccent}</span>
                  <span
                    className="absolute bottom-1 left-0 right-0 h-3 md:h-4 bg-white/20 rounded-full -skew-x-3"
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              key={`sub-${slide.id}-${current}`}
              className="text-base md:text-lg text-white/75 mt-5 mb-8 max-w-md leading-relaxed"
              style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}
            >
              {slide.subtitle}
            </p>

            {/* Category chips */}
            <div
              key={`cats-${slide.id}-${current}`}
              className="flex flex-wrap gap-2 mb-8"
              style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}
            >
              {slide.categories.map((cat, i) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-medium hover:bg-white/20 hover:text-white transition-all duration-200 cursor-pointer"
                  style={{ animation: `badge-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + i * 0.08}s both` }}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              key={`cta-${slide.id}-${current}`}
              className="flex flex-wrap items-center gap-4"
              style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both' }}
            >
              <Button
                size="lg"
                className="group relative bg-white text-gray-900 hover:bg-white/90 font-bold px-8 py-6 text-base rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] overflow-hidden cursor-pointer"
                style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}
                asChild
              >
                <Link href={slide.href}>
                  <span className="relative z-10 flex items-center gap-2">
                    {slide.cta}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Shine sweep */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                </Link>
              </Button>

              <Link
                href="/products"
                className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 group cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center group-hover:bg-white/20 transition-all duration-200">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                Browse All
              </Link>
            </div>
          </div>

          {/* Right — Floating product cards */}
          <div className="hidden lg:flex relative h-[400px] items-center justify-center">
            {/* Decorative ring */}
            <div
              className="absolute w-[320px] h-[320px] rounded-full border border-white/10"
              style={{ animation: 'orbit 30s linear infinite' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40" />
            </div>
            <div
              className="absolute w-[240px] h-[240px] rounded-full border border-white/5"
              style={{ animation: 'orbit 20s linear infinite reverse' }}
            />

            {/* Floating cards */}
            <div className="relative w-full h-full">
              {slide.floatingCards.map((card, i) => (
                <div
                  key={`${slide.id}-card-${i}`}
                  className="absolute"
                  style={{
                    top: `${20 + i * 28}%`,
                    right: `${10 + (i % 2) * 15}%`,
                  }}
                >
                  <FloatingCard
                    emoji={card.emoji}
                    label={card.label}
                    price={card.price}
                    rotate={card.rotate}
                    delay={0.5 + i * 0.15}
                  />
                </div>
              ))}

              {/* Central accent orb */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-40 blur-xl"
                style={{
                  background: slide.accent,
                  animation: 'pulse-soft 4s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation arrows ──────────────────────────── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white flex items-center justify-center hover:bg-white/25 hover:border-white/30 transition-all duration-300 hover:scale-110 z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white flex items-center justify-center hover:bg-white/25 hover:border-white/30 transition-all duration-300 hover:scale-110 z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ─── Bottom bar: dots + counter + trust badges ──── */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/15 backdrop-blur-xl border-t border-white/10">
        <div className="container mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between">
          {/* Left — dots */}
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="group relative h-2 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                style={{ width: i === current ? '52px' : '24px' }}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className="absolute inset-0 bg-white/20 rounded-full" />
                {i === current && (
                  <span
                    key={progressKey}
                    className="absolute inset-0 bg-white rounded-full origin-left"
                    style={{
                      animation: 'progress-bar 7s linear forwards',
                    }}
                  />
                )}
              </button>
            ))}
            {/* Counter */}
            <span className="text-white/50 text-xs font-mono ml-2 hidden sm:inline">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Right — trust badges */}
          <div className="hidden md:flex items-center gap-6">
            {trustBadges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white/70 text-xs group cursor-default"
                  style={{ animation: `badge-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.6 + i * 0.1}s both` }}
                >
                  <span className={`${b.color} transition-colors duration-200 group-hover:text-white`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="hidden xl:block">
                    <span className="text-white/90 font-medium block leading-tight">{b.label}</span>
                    <span className="text-white/50 text-[10px] leading-tight">{b.sublabel}</span>
                  </div>
                  <span className="xl:hidden">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
