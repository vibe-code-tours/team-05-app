'use client';

import Link from 'next/link';
import {
  Smartphone,
  Shirt,
  Sparkles,
  Home,
  Utensils,
  Dumbbell,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories, type Category } from '@/lib/services/product.service';

/* ── Icon + gradient palette per category ────────────────────── */

interface CategoryStyle {
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  flag?: string;
}

const categoryStyleMap: Record<string, CategoryStyle> = {
  electronics: {
    icon: <Smartphone className="h-7 w-7" />,
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/30',
  },
  fashion: {
    icon: <Shirt className="h-7 w-7" />,
    gradient: 'from-pink-500 to-rose-600',
    shadow: 'shadow-pink-500/30',
    flag: '🇹🇭',
  },
  beauty: {
    icon: <Sparkles className="h-7 w-7" />,
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
    flag: '🇰🇷',
  },
  'home & living': {
    icon: <Home className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
  },
  'home-and-living': {
    icon: <Home className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
  },
  'food & groceries': {
    icon: <Utensils className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
  },
  'food-and-groceries': {
    icon: <Utensils className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
  },
  food: {
    icon: <Utensils className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
  },
  sports: {
    icon: <Dumbbell className="h-7 w-7" />,
    gradient: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-500/30',
  },
  health: {
    icon: <Sparkles className="h-7 w-7" />,
    gradient: 'from-green-500 to-emerald-600',
    shadow: 'shadow-green-500/30',
  },
};

const defaultStyle: CategoryStyle = {
  icon: <LayoutGrid className="h-7 w-7" />,
  gradient: 'from-slate-500 to-slate-700',
  shadow: 'shadow-slate-500/30',
};

function getCategoryStyle(category: Category): CategoryStyle {
  const key = category.name.toLowerCase();
  if (categoryStyleMap[key]) return categoryStyleMap[key];
  const slugKey = category.slug?.toLowerCase() ?? '';
  if (categoryStyleMap[slugKey]) return categoryStyleMap[slugKey];
  return defaultStyle;
}

/* ── Skeleton ────────────────────────────────────────────────── */

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center p-6 rounded-2xl border border-border bg-muted/30">
      <Skeleton className="w-16 h-16 rounded-2xl mb-4" />
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────── */

export function CategoryGrid() {
  const { data: response, isLoading, isError } = useCategories();
  const categories = (response?.data as Category[] | undefined) ?? [];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background mesh */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 0% 0%, hsl(250 85% 60% / 0.06) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, hsl(250 85% 60% / 0.04) 0%, transparent 60%)',
        }}
      />
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(hsl(250 85% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(250 85% 60%) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Shop by Category</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Browse Categories
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Explore curated collections from Thailand, Korea, Japan &amp; beyond
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex shrink-0">
            <Link href="/products" className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Unable to load categories. Please try again later.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No categories available right now.</p>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, i) => {
              const style = getCategoryStyle(category);
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative flex flex-col items-center p-6 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                  style={{
                    animation: `badge-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.07}s both`,
                  }}
                >
                  {/* Glow bg on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Icon circle */}
                  <div
                    className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white mb-4 shadow-lg ${style.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    {style.icon}
                    {/* Shine sweep */}
                    <span className="absolute inset-0 rounded-2xl overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    </span>
                  </div>

                  {/* Flag badge */}
                  {style.flag && (
                    <span className="absolute top-2.5 right-2.5 text-sm leading-none">{style.flag}</span>
                  )}

                  <h3 className="font-bold text-foreground text-center text-sm leading-tight mb-1 group-hover:text-primary transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                    {(category._count?.products ?? 0).toLocaleString()} items
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/products" className="flex items-center gap-2 text-primary font-semibold">
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
