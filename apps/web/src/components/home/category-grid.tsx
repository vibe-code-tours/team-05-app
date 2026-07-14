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

const categoryIconMap: Record<string, React.ReactNode> = {
  electronics: <Smartphone className="h-8 w-8" />,
  fashion: <Shirt className="h-8 w-8" />,
  beauty: <Sparkles className="h-8 w-8" />,
  'home & living': <Home className="h-8 w-8" />,
  'home-and-living': <Home className="h-8 w-8" />,
  'food & groceries': <Utensils className="h-8 w-8" />,
  'food-and-groceries': <Utensils className="h-8 w-8" />,
  food: <Utensils className="h-8 w-8" />,
  sports: <Dumbbell className="h-8 w-8" />,
  health: <Sparkles className="h-8 w-8" />,
  automotive: <Smartphone className="h-8 w-8" />,
  books: <LayoutGrid className="h-8 w-8" />,
};

function getCategoryIcon(category: Category): React.ReactNode {
  const key = category.name.toLowerCase();
  if (categoryIconMap[key]) return categoryIconMap[key];

  const slugKey = category.slug?.toLowerCase() ?? '';
  if (categoryIconMap[slugKey]) return categoryIconMap[slugKey];

  // Fallback: use first letter of category name
  return (
    <span className="text-2xl font-bold text-primary">
      {category.name.charAt(0).toUpperCase()}
    </span>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center p-6 bg-background rounded-2xl border">
      <Skeleton className="w-16 h-16 rounded-full mb-4" />
      <Skeleton className="h-4 w-20 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function CategoryGrid() {
  const { data: response, isLoading, isError } = useCategories();

  const categories = (response?.data as Category[] | undefined) ?? [];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Browse Categories
            </h2>
            <p className="text-muted-foreground mt-1">
              Find what you&apos;re looking for
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Unable to load categories. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              No categories available right now.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center p-6 bg-background rounded-2xl border hover:border-primary hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 mb-4">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-semibold text-foreground text-center mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {(category._count?.products ?? 0).toLocaleString()} products
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
