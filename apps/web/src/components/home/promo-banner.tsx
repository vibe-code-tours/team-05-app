'use client';

import { Tag, Percent, Gift, ArrowRight } from 'lucide-react';
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
    bg: 'bg-gradient-to-r from-rose-500 to-pink-500',
    icon: <Tag className="h-8 w-8 text-white/80" />,
  },
  discount: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    icon: <Percent className="h-8 w-8 text-white/80" />,
  },
  gift: {
    bg: 'bg-gradient-to-r from-violet-500 to-purple-500',
    icon: <Gift className="h-8 w-8 text-white/80" />,
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
    <div className={`${style.bg} rounded-2xl p-6 md:p-8 text-white relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
          {subtitle && (
            <p className="text-white/90 text-sm md:text-base">{subtitle}</p>
          )}
        </div>
        <div className="hidden md:flex items-center gap-4">
          {style.icon}
          <Button variant="ghost" className="text-white hover:bg-white/20" asChild>
            <a href={href} className="flex items-center gap-2">
              {cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-5 -bottom-10 w-32 h-32 rounded-full bg-white/10" />
    </div>
  );
}
