'use client';

import Link from 'next/link';
import { Home, ChevronRight, Loader2, LayoutGrid, ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';
import { useCategories, type Category } from '@/lib/services/product.service';

interface CategoryStyle {
  gradient: string;
  shadow: string;
}

const categoryStyleMap: Record<string, CategoryStyle> = {
  electronics: { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
  fashion: { gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/30' },
  beauty: { gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30' },
  'home & living': { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
  'home-and-living': { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
  'food & groceries': { gradient: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/30' },
  'food-and-groceries': { gradient: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/30' },
  food: { gradient: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/30' },
  sports: { gradient: 'from-cyan-500 to-sky-600', shadow: 'shadow-cyan-500/30' },
  health: { gradient: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/30' },
};

const defaultStyle: CategoryStyle = {
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

export default function CategoriesPage() {
  const { data: response, isLoading, error } = useCategories();
  const categories = (response?.data as Category[] | undefined) ?? [];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="bg-card border-b border-border" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center py-3 space-x-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">Categories</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>All Categories</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Browse Categories
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Explore curated collections from Thailand, Korea, Japan &amp; beyond
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading categories...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <LayoutGrid className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Unable to load categories. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && categories.length === 0 && (
            <div className="text-center py-20">
              <LayoutGrid className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No categories available right now.</p>
            </div>
          )}

          {!isLoading && !error && categories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const style = getCategoryStyle(category);
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group relative flex flex-col items-center p-8 rounded-2xl border border-border bg-card hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />
                    <div
                      className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white mb-4 shadow-lg ${style.shadow} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <LayoutGrid className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-foreground text-center text-base mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {(category._count?.products ?? 0).toLocaleString()} items
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop now <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
