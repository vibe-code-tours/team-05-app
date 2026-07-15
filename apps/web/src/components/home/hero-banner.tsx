'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Sparkles,
  Zap,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Slide data ──────────────────────────────────────────── */

interface SlideData {
  id: number;
  tagline: string;
  title: string;
  highlight: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  accent: string;
  icon: React.ReactNode;
  floatingProducts: { name: string; price: string; color: string }[];
}

const slides: SlideData[] = [
  {
    id: 1,
    tagline: '🌏 Cross-Border Shopping',
    title: 'From Bangkok',
    highlight: 'To Your Doorstep',
    subtitle: 'Authentic Thai products delivered straight to Myanmar — fast, affordable, trusted.',
    cta: 'Shop Thailand Collection',
    href: '/products?origin=thailand',
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    accent: '#fda4af',
    icon: <Truck className="h-5 w-5" />,
    floatingProducts: [
      { name: 'Thai Skincare Set', price: '45,000 MMK', color: 'bg-rose-400' },
      { name: 'Bangkok Snack Box', price: '18,500 MMK', color: 'bg-pink-400' },
      { name: 'Silk Scarf', price: '32,000 MMK', color: 'bg-fuchsia-400' },
    ],
  },
  {
    id: 2,
    tagline: '✨ Trending Now',
    title: 'New Arrivals',
    highlight: 'Fresh from Asia',
    subtitle: 'Discover the latest trends from Thailand, Japan, and Korea — updated daily.',
    cta: 'Explore New Arrivals',
    href: '/products?sort=newest',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    accent: '#c4b5fd',
    icon: <Sparkles className="h-5 w-5" />,
    floatingProducts: [
      { name: 'J-Beauty Serum', price: '68,000 MMK', color: 'bg-violet-400' },
      { name: 'Korean Hoodie', price: '55,000 MMK', color: 'bg-purple-400' },
      { name: 'Tokyo Candle', price: '22,000 MMK', color: 'bg-indigo-400' },
    ],
  },
  {
    id: 3,
    tagline: '⚡ Limited Time',
    title: 'Flash Sale',
    highlight: 'Up to 50% Off',
    subtitle: 'Grab incredible deals before they disappear — only this weekend.',
    cta: 'View Flash Deals',
    href: '/products?sort=deals',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accent: '#fcd34d',
    icon: <Zap className="h-5 w-5" />,
    floatingProducts: [
      { name: 'AirPods Pro', price: '189,000 MMK', color: 'bg-amber-400' },
      { name: 'Running Shoes', price: '78,000 MMK', color: 'bg-orange-400' },
      { name: 'Watch SE', price: '320,000 MMK', color: 'bg-red-400' },
    ],
  },
];

/* ─── Trust badges ────────────────────────────────────────── */

const trustBadges = [
  { icon: <Truck className="h-4 w-4" />, label: 'Free Shipping 100K+' },
  { icon: <ShieldCheck className="h-4 w-4" />, label: 'Buyer Protection' },
  { icon: <RotateCcw className="h-4 w-4" />, label: '7-Day Returns' },
  { icon: <CreditCard className="h-4 w-4" />, label: 'Secure Payment' },
];

/* ─── Component ───────────────────────────────────────────── */

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % slides.length);
    setProgressKey((p) => p + 1);
  }, []);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    setProgressKey((p) => p + 1);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setCurrent(i);
      setProgressKey((p) => p + 1);
    },
    [],
  );

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
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`w-full shrink-0 bg-gradient-to-br ${s.gradient} relative min-h-[420px] md:min-h-[480px] lg:min-h-[540px] flex items-center overflow-hidden`}
          >
            {/* ── Mesh gradient blobs ── */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${s.accent} 0%, transparent 70%)`,
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
              <div
                className="absolute top-1/3 left-1/2 w-[300px] h-[300px] rounded-full opacity-10 blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${s.accent} 0%, transparent 60%)`,
                  animation: 'float-slow 18s ease-in-out infinite',
                }}
              />
            </div>

            {/* ── Grid pattern overlay ── */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* ── Content ── */}
            <div className="container mx-auto px-6 md:px-8 relative z-10 py-16 md:py-20">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Left — text */}
                <div key={`text-${s.id}-${i === current}`} className={i === current ? 'animate-[slideUp_0.6s_ease-out_0.1s_both]' : ''}>
                  {/* Tagline chip */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-5 border border-white/10">
                    {s.icon}
                    <span>{s.tagline}</span>
                  </div>

                  {/* Headline with gradient text */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4 tracking-tight">
                    {s.title}{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${s.accent}, white)`,
                      }}
                    >
                      {s.highlight}
                    </span>
                  </h1>

                  <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
                    {s.subtitle}
                  </p>

                  {/* CTA */}
                  <Button
                    size="lg"
                    className="group relative bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 py-6 text-base rounded-xl shadow-xl shadow-black/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden"
                    asChild
                  >
                    <Link href={s.href}>
                      <span className="relative z-10 flex items-center gap-2">
                        {s.cta}
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      {/* Shine sweep */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    </Link>
                  </Button>
                </div>

                {/* Right — floating product cards */}
                <div className="hidden lg:flex justify-center items-center relative h-[380px]">
                  {s.floatingProducts.map((fp, pi) => (
                    <div
                      key={pi}
                      className="absolute bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl shadow-black/10 transition-all duration-500 hover:bg-white/25 hover:scale-105 hover:z-10"
                      style={{
                        width: '200px',
                        top: `${20 + pi * 110}px`,
                        right: `${pi * 30 + 20}px`,
                        animation: `card-float${pi === 1 ? '-delayed' : ''} ${6 + pi * 2}s ease-in-out infinite`,
                        animationDelay: `${pi * 0.8}s`,
                      }}
                    >
                      <div className={`w-12 h-12 ${fp.color} rounded-xl mb-3 flex items-center justify-center shadow-lg`}>
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm leading-tight mb-1">{fp.name}</p>
                      <p className="text-white/70 text-xs font-medium">{fp.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Navigation arrows ──────────────────────────── */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ─── Bottom bar: dots + counter + trust badges ──── */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/10 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-6 md:px-8 py-3 flex items-center justify-between">
          {/* Left — dots */}
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="group relative h-2 rounded-full overflow-hidden transition-all duration-300"
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
