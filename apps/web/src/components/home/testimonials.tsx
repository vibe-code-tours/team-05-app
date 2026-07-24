'use client';

import { Star, Quote, TrendingUp } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  gradient: string;
  tag: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Aung Myo',
    role: 'Regular Buyer · Yangon',
    content:
      'CrossMart has made shopping so much easier! The cross-border delivery from Thailand is fast and reliable. I love the variety of products and real-time tracking.',
    rating: 5,
    avatar: 'AM',
    gradient: 'from-violet-500 to-purple-600',
    tag: 'Cargo Order',
  },
  {
    id: 2,
    name: 'Thin Thin',
    role: 'Small Business Owner · Mandalay',
    content:
      "As a seller, CrossMart helped me reach customers across Myanmar. The platform is intuitive and the support team is very responsive. My revenue doubled in 3 months!",
    rating: 5,
    avatar: 'TT',
    gradient: 'from-rose-500 to-pink-600',
    tag: 'Verified Seller',
  },
  {
    id: 3,
    name: 'Kyaw Zin',
    role: 'Tech Enthusiast · Naypyidaw',
    content:
      'Great prices on electronics and the buyer protection gives me peace of mind. The cargo tracking feature is amazing — I can see exactly where my order is at every step!',
    rating: 5,
    avatar: 'KZ',
    gradient: 'from-blue-500 to-indigo-600',
    tag: 'Electronics',
  },
  {
    id: 4,
    name: 'May Sandar',
    role: 'Fashion Lover · Yangon',
    content:
      'The fashion collection from Thailand is incredible. Quality products at affordable prices. The free shipping threshold on orders is a great deal!',
    rating: 4,
    avatar: 'MS',
    gradient: 'from-amber-500 to-orange-600',
    tag: 'Fashion',
  },
  {
    id: 5,
    name: 'Soe Min',
    role: 'First-time Buyer · Bago',
    content:
      'I was skeptical at first, but CrossMart exceeded my expectations. Product quality matched the descriptions perfectly and delivery was right on time.',
    rating: 5,
    avatar: 'SM',
    gradient: 'from-emerald-500 to-teal-600',
    tag: 'In-Stock Order',
  },
];

const stats = [
  { number: '10,000+', label: 'Happy Customers', icon: '🤝', color: 'hsl(250,85%,65%)' },
  { number: '4.8 / 5', label: 'Average Rating', icon: '⭐', color: 'hsl(35,90%,55%)' },
  { number: '50,000+', label: 'Orders Delivered', icon: '📦', color: 'hsl(160,70%,45%)' },
  { number: '99%', label: 'Satisfaction Rate', icon: '💎', color: 'hsl(280,80%,65%)' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Soft mesh bg */}
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 20% 80%, hsl(250 85% 60% / 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, hsl(160 70% 45% / 0.05) 0%, transparent 60%)',
        }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-5">
            <Quote className="h-3.5 w-3.5" />
            Real Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            Trusted by{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(250,85%,60%), hsl(280,80%,65%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Thousands
            </span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Over 10,000 satisfied customers shop with confidence on CrossMart every month
          </p>
        </div>

        {/* ── Masonry testimonial grid ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="group relative p-6 rounded-3xl border border-border/60 bg-card hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-400 overflow-hidden cursor-default"
              style={{
                animation: `badge-pop 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                gridRow: i === 1 ? 'span 1' : 'span 1',
              }}
            >
              {/* Subtle gradient sweep on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-3xl`}
              />

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <Quote className="h-9 w-9 text-primary/15" />
                <span className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold tracking-wide uppercase border border-primary/15">
                  {t.tag}
                </span>
              </div>

              {/* Quote text */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-sm leading-tight truncate">{t.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                </div>
                <StarRating rating={t.rating} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats row ─────────────────────────────────────── */}
        <div
          className="relative rounded-3xl p-8 md:p-10 overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, hsl(220,20%,10%) 0%, hsl(250,30%,12%) 100%)',
          }}
        >
          {/* Glow blobs */}
          <div
            className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'hsl(250,85%,60%)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: 'hsl(160,70%,45%)' }}
          />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-white/60" />
              <div>
                <p className="text-white font-extrabold text-lg leading-tight">CrossMart by the Numbers</p>
                <p className="text-white/40 text-xs">Growing Myanmar&apos;s most trusted marketplace</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center"
                  style={{ animation: `count-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.1}s both` }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-2xl md:text-3xl font-extrabold text-white leading-none">
                      {stat.number}
                    </p>
                  </div>
                  <p className="text-white/40 text-xs font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
