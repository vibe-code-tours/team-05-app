'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Aung Myo',
    role: 'Regular Customer',
    content: 'CrossMart has made shopping so much easier! The cross-border delivery from Thailand is fast and reliable. I love the variety of products available.',
    rating: 5,
    avatar: 'AM',
  },
  {
    id: 2,
    name: 'Thin Thin',
    role: 'Small Business Owner',
    content: 'As a seller, CrossMart has helped me reach customers across Myanmar. The platform is easy to use and the support team is very responsive.',
    rating: 5,
    avatar: 'TT',
  },
  {
    id: 3,
    name: 'Kyaw Zin',
    role: 'Tech Enthusiast',
    content: 'Great prices on electronics and the buyer protection gives me peace of mind. The cargo tracking feature is amazing - I can see exactly where my order is!',
    rating: 5,
    avatar: 'KZ',
  },
  {
    id: 4,
    name: 'May Sandar',
    role: 'Fashion Lover',
    content: 'The fashion collection from Thailand is incredible. Quality products at affordable prices. The free shipping on orders over 100K MMK is a great deal!',
    rating: 4,
    avatar: 'MS',
  },
  {
    id: 5,
    name: 'Soe Min',
    role: 'First-time Buyer',
    content: 'I was skeptical at first, but CrossMart exceeded my expectations. The product quality matched the descriptions and delivery was on time.',
    rating: 5,
    avatar: 'SM',
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goTo = (index: number) => {
    setCurrent(index);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Quote className="h-4 w-4" />
            <span>What Our Customers Say</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join over 10,000 satisfied customers who shop with confidence on CrossMart
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Testimonial Card */}
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="h-12 w-12 text-primary/20" />
              </div>

              {/* Content */}
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8">
                &ldquo;{testimonials[current].content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonials[current].name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[current].role}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonials[current].rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors hidden md:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors hidden md:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          {[
            { number: '10,000+', label: 'Happy Customers' },
            { number: '4.8/5', label: 'Average Rating' },
            { number: '50,000+', label: 'Orders Delivered' },
            { number: '99%', label: 'Satisfaction Rate' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
