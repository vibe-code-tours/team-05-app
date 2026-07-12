'use client';

import Link from 'next/link';
import { Smartphone, Shirt, Sparkles, Home, Utensils, Dumbbell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  productCount: number;
  href: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    icon: <Smartphone className="h-8 w-8" />,
    productCount: 1250,
    href: '/categories/electronics',
  },
  {
    id: '2',
    name: 'Fashion',
    icon: <Shirt className="h-8 w-8" />,
    productCount: 890,
    href: '/categories/fashion',
  },
  {
    id: '3',
    name: 'Beauty',
    icon: <Sparkles className="h-8 w-8" />,
    productCount: 645,
    href: '/categories/beauty',
  },
  {
    id: '4',
    name: 'Home & Living',
    icon: <Home className="h-8 w-8" />,
    productCount: 420,
    href: '/categories/home-living',
  },
  {
    id: '5',
    name: 'Food & Groceries',
    icon: <Utensils className="h-8 w-8" />,
    productCount: 780,
    href: '/categories/food-groceries',
  },
  {
    id: '6',
    name: 'Sports',
    icon: <Dumbbell className="h-8 w-8" />,
    productCount: 315,
    href: '/categories/sports',
  },
];

export function CategoryGrid() {
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
            <Link href="/categories" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex flex-col items-center p-6 bg-background rounded-2xl border hover:border-primary hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 mb-4">
                {category.icon}
              </div>
              <h3 className="font-semibold text-foreground text-center mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category.productCount.toLocaleString()} products
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
