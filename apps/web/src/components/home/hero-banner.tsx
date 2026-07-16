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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveBanners, type Banner } from '@/lib/services/product.service';

/* ─── Slide data (derived from DB banners + fallback defaults) ── */

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image?: string;
  gradient: string;
  gradientMesh: string;
  accent: string;
}

const defaultSlides: SlideData[] = [
  {
    id: 'default-1',
    title: 'Cross-Border Shopping',
    subtitle: 'Authentic Thai products delivered straight to Myanmar — fast, affordable, trusted.',
    cta: 'Shop Thailand Collection',
    href: '/products?type=CARGO',
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    gradientMesh:
      'radial-gradient(ellipse at 20% 50%, rgba(251,113,133,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(244,114,182,0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(232,121,249,0.25) 0%, transparent 50%)',
    accent: '#fda4af',
  },
  {
    id: 'default-2',
    title: 'New Arrivals',
    subtitle: 'Discover the latest trends from Thailand, Japan, and Korea — updated daily.',
    cta: 'Explore New Arrivals',
    href: '/products?type=IN_STOCK',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    gradientMesh:
      'radial-gradient(ellipse at 30% 40%, rgba(167,139,250,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.25) 0%, transparent 50%)',
    accent: '#c4b5fd',
  },
  {
    id: 'default-3',
    title: 'Flash Sale',
    subtitle: 'Grab incredible deals before they disappear — only this weekend.',
    cta: 'View Flash Deals',
    href: '/products?type=PROMOTION',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    gradientMesh:
      'radial-gradient(ellipse at 25% 60%, rgba(251,191,36,0.4) 0%, transparent 50%), radial-gradient(ellipse at 75% 30%, rgba(249,115,22,0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(239,68,68,0.25) 0%, transparent 50%)',
    accent: '#fcd34d',
  },
];

/** Gradient presets to cycle through for DB banners */
const gradientPresets = [
  {
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    gradientMesh:
      'radial-gradient(ellipse at 20% 50%, rgba(251,113,133,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(244,114,182,0.3) 0%, transparent 50%)',
    accent: '#fda4af',
  },
  {
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    gradientMesh:
      'radial-gradient(ellipse at 30% 40%, rgba(167,139,250,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.3) 0%, transparent 50%)',
    accent: '#c4b5fd',
  },
  {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    gradientMesh:
      'radial-gradient(ellipse at 25% 60%, rgba(251,191,36,0.4) 0%, transparent 50%), radial-gradient(ellipse at 75% 30%, rgba(249,115,22,0.3) 0%, transparent 50%)',
    accent: '#fcd34d',
  },
  {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    gradientMesh:
      'radial-gradient(ellipse at 20% 60%, rgba(52,211,153,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(20,184,166,0.3) 0%, transparent 50%)',
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
  };
}

/* ─── Trust badges ────────────────────────────────────────── */

const trustBadges = [
  { icon: <Truck className="h-4 w-4" />, label: 'Free Shipping 100K+' },
  { icon: <ShieldCheck className="h-4 w-4" />, label: 'Buyer Protection' },
  { icon: <RotateCcw className="h-4 w-4" />, label: '7-Day Returns' },
  { icon: <CreditCard className="h-4 w-4" />, label: 'Secure Payment' },
];

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
    const t = setInterval(next, 6000);
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

  /* Reset current slide when banners change (e.g. after new banners are published) */
  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  /* Loading state */
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden">
        <Skeleton className="w-full min-h-[460px] md:min-h-[520px] lg:min-h-[580px] rounded-none" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Slides ────────────────────────────────────── */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`w-full shrink-0 relative min-h-[460px] md:min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden`}
          >
            {/* ── Background: banner image OR gradient ── */}
            {slide.image ? (
              <>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
              </>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            )}

            {/* ── Aurora mesh gradient overlay (gradient-only slides) ── */}
            {!slide.image && (
              <div
                className="absolute inset-0 opacity-60 mix-blend-screen"
                style={{
                  background: slide.gradientMesh,
                  animation: 'aurora-shift 8s ease-in-out infinite alternate',
                }}
              />
            )}

            {/* ── Mesh gradient blobs ── */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${slide.accent} 0%, transparent 70%)`,
                  animation: 'float 12s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
                style={{
                  background: `radial-gradient(circle, white 0%, transparent 70%)`,
                  animation: 'float-delayed 15s ease-in-out infinite',
                }}
              />
            </div>

            {/* ── Grid pattern overlay ── */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />

            {/* ── Content ── */}
            <div className="container mx-auto px-6 md:px-8 relative z-10 py-16 md:py-20">
              <div className="max-w-2xl">
                {/* Headline */}
                <div key={`text-${slide.id}-${i === current}`} className={i === current ? 'animate-[slideUp_0.6s_ease-out_0.1s_both]' : ''}>
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] mb-4 tracking-tight">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* CTA */}
                  <Button
                    size="lg"
                    className="group relative bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 py-6 text-base rounded-xl shadow-xl shadow-black/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden cursor-pointer"
                    asChild
                  >
                    <Link href={slide.href}>
                      <span className="relative z-10 flex items-center gap-2">
                        {slide.cta}
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      {/* Shine sweep */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Navigation arrows ──────────────────────────── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110 z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110 z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ─── Bottom bar: dots + counter + trust badges ──── */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/10 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-6 md:px-8 py-3 flex items-center justify-between">
          {/* Left — dots */}
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="group relative h-2 rounded-full overflow-hidden transition-all duration-200 cursor-pointer"
                style={{ width: i === current ? '48px' : '24px' }}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className="absolute inset-0 bg-white/30 rounded-full" />
                {i === current && (
                  <span
                    key={progressKey}
                    className="absolute inset-0 bg-white rounded-full origin-left"
                    style={{
                      animation: 'progress-bar 6s linear forwards',
                    }}
                  />
                )}
              </button>
            ))}
            {/* Counter */}
            <span className="text-white/60 text-xs font-mono ml-2 hidden sm:inline">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Right — trust badges */}
          <div className="hidden md:flex items-center gap-5">
            {trustBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white/70 text-xs">
                <span className="text-white/90">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
