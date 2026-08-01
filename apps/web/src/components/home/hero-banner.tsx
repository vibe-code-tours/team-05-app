'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Sparkles, Star } from 'lucide-react';

const floatingBadges = [
  { emoji: '🇹🇭', text: 'Bangkok', sub: 'Direct', delay: '0s', pos: 'top-16 left-[8%]', rotate: '-rotate-3' },
  { emoji: '⭐', text: '4.8 Rating', sub: '10K+ reviews', delay: '0.3s', pos: 'top-28 right-[7%]', rotate: 'rotate-2' },
  { emoji: '🚚', text: '7–14 Days', sub: 'Doorstep delivery', delay: '0.6s', pos: 'bottom-28 left-[6%]', rotate: 'rotate-3' },
  { emoji: '🔒', text: 'Buyer Protected', sub: '100% Secure', delay: '0.9s', pos: 'bottom-20 right-[8%]', rotate: '-rotate-2' },
];

const stats = [
  { icon: <Truck className="h-4 w-4" />, label: 'Free Shipping', sub: 'Orders 100K+ MMK' },
  { icon: <ShieldCheck className="h-4 w-4" />, label: 'Buyer Protection', sub: '100% Secure' },
  { icon: <Star className="h-4 w-4" />, label: '4.8★ Rating', sub: '10,000+ reviews' },
  { icon: <Sparkles className="h-4 w-4" />, label: 'Verified Sellers', sub: '1,000+ trusted shops' },
];

export function HeroBanner() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '88vh' }}
    >
      {/* ── Layered background ─────────────────────────────── */}
      <div className="absolute inset-0">
        {/* Ghibli style cargo background */}
        <img
          src="/hero-bg-clean.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.85) saturate(1.15)' }}
        />

        {/* Deep indigo gradient overlay — keeps text readable but lets colors shine */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, hsl(250,85%,12% / 0.5) 0%, hsl(258,70%,8% / 0.4) 40%, hsl(30,60%,8% / 0.4) 100%)',
          }}
        />

        {/* Indigo radial glow top-left */}
        <div
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, hsl(250,85%,60%) 0%, transparent 70%)',
            animation: 'float 18s ease-in-out infinite',
          }}
        />
        {/* Purple radial glow bottom-right */}
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(280,80%,55%) 0%, transparent 70%)',
            animation: 'float-delayed 22s ease-in-out infinite',
          }}
        />

        {/* Dot scatter for premium texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Bottom gradient fade to page */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ── Floating badges (corners) ─────────────────────── */}
      {floatingBadges.map((badge, i) => (
        <div
          key={i}
          className={`absolute ${badge.pos} ${badge.rotate} hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/8 border border-white/12 shadow-2xl`}
          style={{
            animation: `float-in-right 0.8s cubic-bezier(0.16,1,0.3,1) ${badge.delay} both, card-float ${6 + i}s ease-in-out ${parseFloat(badge.delay) + 0.8}s infinite`,
          }}
        >
          <span className="text-2xl">{badge.emoji}</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{badge.text}</p>
            <p className="text-white/50 text-xs">{badge.sub}</p>
          </div>
        </div>
      ))}

      {/* ── Center content ────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32" style={{ minHeight: '88vh' }}>

        {/* Top badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-md text-white/80 text-xs font-bold tracking-widest uppercase mb-8"
          style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16,1,0.3,1) 0s both' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Myanmar&apos;s #1 Cross-Border Marketplace
        </div>

        {/* Main headline */}
        <div style={{ animation: 'stagger-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.0] tracking-tighter mb-2">
            Shop Bangkok.
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tighter mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(250,85%,70%) 0%, hsl(200,90%,65%) 50%, hsl(280,80%,70%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 4s ease infinite',
            }}
          >
            Delivered to You.
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-white/55 text-base md:text-xl max-w-2xl leading-relaxed mb-10"
          style={{ animation: 'stagger-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
        >
          Authentic Thai, Korean &amp; Japanese products delivered straight to Myanmar —
          with real-time cargo tracking, verified sellers, and local payments.
        </p>

        {/* Category pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
          style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}
        >
          {[
            { label: '🇹🇭 Thai Skincare', href: '/products?category=beauty' },
            { label: '📱 Electronics', href: '/products?category=electronics' },
            { label: '👗 Fashion', href: '/products?category=fashion' },
            { label: '🌸 K-Beauty', href: '/products?category=beauty' },
            { label: '🏠 Home Decor', href: '/products?category=home-and-living' },
            { label: '⚡ Flash Deals', href: '/products?sort=deals' },
          ].map((tag, i) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/12 text-white/75 text-sm font-medium hover:bg-white/15 hover:text-white hover:border-white/25 transition-all duration-200"
              style={{ animation: `badge-pop 0.4s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.06}s both` }}
            >
              {tag.label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
        >
          {/* Primary CTA */}
          <Link
            href="/products"
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-base text-white overflow-hidden transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(250,85%,60%) 0%, hsl(270,80%,55%) 100%)',
              boxShadow: '0 0 40px hsl(250 85% 60% / 0.45), 0 8px 32px hsl(250 85% 60% / 0.3)',
              animation: 'glow-pulse 3s ease-in-out infinite',
            }}
          >
            <span className="relative z-10">Shop Now</span>
            <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            {/* Shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/products?type=CARGO"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 bg-white/8 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 font-bold text-base transition-all duration-300"
          >
            <Truck className="h-5 w-5" />
            Track Cargo Order
          </Link>
        </div>

        {/* Social proof row */}
        <div
          className="flex items-center gap-3 mt-10"
          style={{ animation: 'stagger-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.65s both' }}
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {['AM', 'TT', 'KZ', 'MS'].map((av, i) => (
              <div
                key={av}
                className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-white text-[10px] font-bold"
                style={{
                  background: `hsl(${250 + i * 20}, 75%, 55%)`,
                  zIndex: 4 - i,
                }}
              >
                {av}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-white/55 text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>Trusted by <strong className="text-white/80">10,000+</strong> customers</span>
          </div>
        </div>
      </div>

      {/* ── Trust bar ────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-xl border-t border-white/8">
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-center md:justify-between flex-wrap gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-white/65 hover:text-white/90 transition-colors duration-200 cursor-default"
              style={{ animation: `badge-pop 0.4s cubic-bezier(0.16,1,0.3,1) ${0.7 + i * 0.08}s both` }}
            >
              <span className="text-white/40">{s.icon}</span>
              <div>
                <p className="text-white/90 font-semibold text-xs leading-tight">{s.label}</p>
                <p className="text-white/40 text-[10px] hidden xl:block">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
