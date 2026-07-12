'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard, Product } from './product-card';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    price: 2500000,
    originalPrice: 2800000,
    seller: 'Tech Store MM',
    type: 'in-stock',
    rating: 5,
    reviewCount: 128,
    discount: 11,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1800000,
    seller: 'Bangkok Imports',
    type: 'cargo',
    rating: 4,
    reviewCount: 89,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Nike Air Max 270',
    price: 180000,
    originalPrice: 220000,
    seller: 'Fashion Hub',
    type: 'in-stock',
    rating: 4,
    reviewCount: 56,
    discount: 18,
    category: 'Fashion',
  },
  {
    id: '4',
    name: 'Japanese Skincare Set (10pcs)',
    price: 85000,
    seller: 'J-Beauty Myanmar',
    type: 'cargo',
    rating: 5,
    reviewCount: 234,
    category: 'Beauty',
  },
  {
    id: '5',
    name: 'Xiaomi Robot Vacuum X10+',
    price: 450000,
    originalPrice: 550000,
    seller: 'Smart Home MM',
    type: 'in-stock',
    rating: 4,
    reviewCount: 67,
    discount: 18,
    category: 'Home & Living',
  },
  {
    id: '6',
    name: 'Thailand Coconut Snack Box',
    price: 25000,
    seller: 'Thai Food Corner',
    type: 'cargo',
    rating: 5,
    reviewCount: 312,
    category: 'Food & Groceries',
  },
  {
    id: '7',
    name: 'Nike Dri-FIT Sports Set',
    price: 95000,
    seller: 'Sports World',
    type: 'in-stock',
    rating: 4,
    reviewCount: 43,
    category: 'Sports',
  },
  {
    id: '8',
    name: 'Sony WH-1000XM5 Headphones',
    price: 420000,
    originalPrice: 480000,
    seller: 'Audio Pro MM',
    type: 'cargo',
    rating: 5,
    reviewCount: 156,
    discount: 13,
    category: 'Electronics',
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-1">
              Handpicked for you
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
