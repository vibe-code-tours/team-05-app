'use client';

import Link from 'next/link';
import { Package, MapPin, CheckCircle2, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: <Package className="h-6 w-6" />,
    emoji: '🛍️',
    title: 'Order Placed',
    desc: 'Seller confirms & purchases item in Bangkok',
    location: 'Bangkok, TH',
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/40',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    emoji: '✈️',
    title: 'Cargo in Transit',
    desc: 'Air cargo departs — real-time tracking active',
    location: 'In-Flight 🛫',
    color: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/40',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    emoji: '🏠',
    title: 'Customs Cleared',
    desc: 'Cleared Myanmar customs, out for delivery',
    location: 'Yangon, MM',
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/40',
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    emoji: '🎉',
    title: 'Delivered!',
    desc: 'Item delivered to your door. Rate your seller',
    location: 'Your Door 🏠',
    color: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/40',
  },
];

const trustItems = [
  { icon: '🔒', label: 'Buyer Protected', sub: '100% Secure' },
  { icon: '📡', label: 'Real-Time Tracking', sub: 'Every step' },
  { icon: '✅', label: 'Verified Sellers', sub: 'ID-checked' },
  { icon: '💳', label: 'KPay & WavePay', sub: 'Local payments' },
];

export function CargoShowcase() {
  return (
    <section className="relative py-20 overflow-hidden bg-[hsl(220,20%,10%)]">
      {/* ── Ambient background glows ─────────────────────────── */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: 'hsl(250, 85%, 60%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'hsl(160, 70%, 45%)' }}
      />

      {/* ── Dot grid overlay ────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cross-Border Cargo Tracking
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Bangkok to Your Door —{' '}
            <span
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, hsl(250,85%,70%), hsl(200,90%,65%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Fully Tracked
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Every cross-border order gets a live tracking timeline. Know exactly where your cargo is — from the
            Bangkok street market to your doorstep.
          </p>
        </div>

        {/* ── Steps ────────────────────────────────────────────── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-0 max-w-5xl mx-auto mb-14">
          {steps.map((step, i) => (
            <div key={i} className="flex md:flex-col items-start md:items-center flex-1 relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute left-1/2 top-10 w-full h-[2px] z-0">
                  <div className="h-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-white/40 to-transparent rounded-full"
                      style={{
                        animation: `shimmer-line 2.5s ease-in-out ${i * 0.4}s infinite`,
                        width: '40%',
                      }}
                    />
                  </div>
                </div>
              )}
              {/* Connector line (mobile) */}
              {i < steps.length - 1 && (
                <div className="md:hidden w-[2px] h-10 ml-[27px] mt-1 mb-1 bg-white/10 rounded-full shrink-0" />
              )}

              {/* Step card */}
              <div
                className="relative z-10 flex md:flex-col items-center md:items-center gap-4 md:gap-3 w-full md:w-auto"
                style={{ animation: `slide-in-left 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s both` }}
              >
                {/* Icon circle */}
                <div
                  className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-xl ${step.shadow} shrink-0`}
                >
                  {step.icon}
                  {/* Ping dot */}
                  {i === 1 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animation: 'ping-glow 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                  )}
                </div>

                {/* Text */}
                <div className="text-left md:text-center">
                  <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-0.5">
                    Step {i + 1}
                  </p>
                  <h3 className="font-bold text-white text-sm md:text-base leading-tight">{step.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed mt-0.5 max-w-[160px] md:max-w-[130px]">
                    {step.desc}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="h-3 w-3 text-white/30" />
                    <span className="text-white/40 text-[11px]">{step.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Trust strip ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          {trustItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/15 transition-all duration-300 cursor-default"
              style={{ animation: `badge-pop 0.5s cubic-bezier(0.16,1,0.3,1) ${0.6 + i * 0.08}s both` }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white/90 font-semibold text-xs text-center leading-tight">{item.label}</span>
              <span className="text-white/35 text-[10px]">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="group relative font-bold px-8 py-6 text-sm rounded-2xl text-white overflow-hidden transition-all duration-300 hover:scale-[1.04]"
            style={{
              background: 'linear-gradient(135deg, hsl(250,85%,60%), hsl(270,80%,55%))',
              boxShadow: '0 0 30px hsl(250 85% 60% / 0.4)',
            }}
            asChild
          >
            <Link href="/products?type=CARGO">
              <span className="relative z-10 flex items-center gap-2">
                Shop Cargo Items
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="group border border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/25 font-semibold px-8 py-6 text-sm rounded-2xl transition-all duration-300"
            asChild
          >
            <Link href="/track-order" className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Track Your Order
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
