'use client';

import Link from 'next/link';
import { Truck, ShieldCheck, CreditCard, Headphones, RotateCcw, Zap, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-5 w-5" />,
    title: 'Fast Cross-Border Delivery',
    description: 'Bangkok to your doorstep in 7–14 days with real-time milestone tracking.',
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/30',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Buyer Protection',
    description: 'Shop with full confidence — 100% money-back guarantee on every order.',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: 'Secure Local Payments',
    description: 'KPay, WavePay, and more — encrypted transactions with zero hidden fees.',
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
  },
  {
    icon: <Headphones className="h-5 w-5" />,
    title: '24/7 Customer Support',
    description: 'Our team is always on standby via chat, phone, or email.',
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/30',
  },
  {
    icon: <RotateCcw className="h-5 w-5" />,
    title: 'Easy 7-Day Returns',
    description: 'Hassle-free returns on most items — no questions asked.',
    gradient: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/30',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Daily Flash Deals',
    description: 'Exclusive limited-time offers and discounts up to 70% off.',
    gradient: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-500/30',
  },
];

const stats = [
  { number: '1,000+', label: 'Verified Sellers' },
  { number: '50K+', label: 'Active Products' },
  { number: '95%', label: 'Orders Trackable' },
  { number: '4.8★', label: 'Avg Rating' },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Ambient indigo glow top-right */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-5 pointer-events-none -z-0"
        style={{ background: 'hsl(250, 85%, 60%)' }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Two-column header ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Why CrossMart
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-5">
              Built for{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, hsl(250,85%,60%), hsl(280,80%,65%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Myanmar
              </span>
              . <br />
              Trusted worldwide.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-md mb-8">
              We bridge Myanmar buyers with verified Thai, Korean, and Japanese sellers — handling everything from
              transparent cargo tracking to secure local payments.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="px-4 py-4 rounded-2xl border border-border/60 bg-muted/30 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
                  style={{ animation: `count-up 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both` }}
                >
                  <p className="text-2xl font-extrabold text-primary tracking-tight">{stat.number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(250,85%,60%), hsl(270,80%,55%))',
                  boxShadow: '0 8px 30px hsl(250 85% 60% / 0.25)',
                }}
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl border border-border bg-background text-foreground font-bold text-sm hover:bg-muted hover:border-primary/30 transition-all duration-300"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Right — Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-5 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default"
                style={{ animation: `slide-in-right 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both` }}
              >
                {/* Hover glow bg */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div
                  className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-3 shadow-md ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
