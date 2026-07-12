'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Truck, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    title: 'Cross-Border Shopping from Bangkok',
    subtitle: 'Authentic Thai products delivered to Myanmar',
    cta: 'Shop Now',
    href: '/products?origin=thailand',
    icon: <Truck className="h-16 w-16 text-white/30" />,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 2,
    title: 'New Arrivals from Thailand & Japan',
    subtitle: 'Discover the latest trends and products',
    cta: 'Explore',
    href: '/products?sort=newest',
    icon: <Sparkles className="h-16 w-16 text-white/30" />,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 3,
    title: 'Flash Sale - Up to 50% Off',
    subtitle: 'Limited time deals on popular items',
    cta: 'View Deals',
    href: '/deals',
    icon: <Zap className="h-16 w-16 text-white/30" />,
    gradient: 'from-amber-500 to-orange-600',
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`w-full shrink-0 bg-gradient-to-r ${slide.gradient} relative overflow-hidden`}
          >
            <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-10">
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-6">
                  {slide.subtitle}
                </p>
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-white/90"
                  asChild
                >
                  <a href={slide.href}>{slide.cta}</a>
                </Button>
              </div>
            </div>
            {/* Decorative icon */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
              {slide.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
