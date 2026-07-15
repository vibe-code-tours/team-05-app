'use client';

import Link from 'next/link';
import { Tag, Percent, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  variant?: 'default' | 'discount' | 'gift';
}

const variantStyles = {
  default: {
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    borderGradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
    icon: <Tag className="h-5 w-5" />,
    chip: 'bg-white/20',
    floatingColor: 'bg-rose-300',
  },
  discount: {
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    borderGradient: 'from-emerald-400 via-green-400 to-teal-400',
    icon: <Percent className="h-5 w-5" />,
    chip: 'bg-white/20',
    floatingColor: 'bg-emerald-300',
  },
  gift: {
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    borderGradient: 'from-violet-400 via-purple-400 to-indigo-400',
    icon: <Gift className="h-5 w-5" />,
    chip: 'bg-white/20',
    floatingColor: 'bg-violet-300',
  },
};

export function PromoBanner({
  title,
  subtitle,
  cta = 'Learn More',
  href = '#',
  variant = 'default',
}: PromoBannerProps) {
  const style = variantStyles[variant];

  return (
    <div className="group relative rounded-2xl p-[2px] overflow-hidden">
      {/* Animated gradient border */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${style.borderGradient} opacity-80`}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 4s ease infinite',
        }}
      />

      {/* Inner card */}
      <div className={`relative bg-gradient-to-r ${style.gradient} rounded-[14px] p-6 md:p-8 overflow-hidden`}>
        {/* Mesh gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-2xl bg-white"
            style={{ animation: 'float 10s ease-in-out infinite' }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-15 blur-2xl bg-white"
            style={{ animation: 'float-delayed 13s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full opacity-10 blur-xl bg-white"
            style={{ animation: 'float-slow 8s ease-in-out infinite' }}
          />
        </div>

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            {/* Chip */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${style.chip} backdrop-blur-sm text-white/90 text-xs font-medium mb-3 border border-white/10`}>
              <Sparkles className="h-3 w-3" />
              <span>Limited Offer</span>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 tracking-tight leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-white/80 text-sm md:text-base leading-relaxed">{subtitle}</p>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex text-white/60">{style.icon}</div>
            <Button
              variant="ghost"
              className="group/btn relative bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 font-semibold px-6 py-5 rounded-xl transition-all duration-300 hover:scale-[1.03] overflow-hidden"
              asChild
            >
              <Link href={href} className="flex items-center gap-2">
                <span className="relative z-10">{cta}</span>
                <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover/btn:translate-x-1" />
                {/* Shine sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
