'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard, type Product } from './product-card';
import { useProducts, type Product as ApiProduct } from '@/lib/services/product.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

function mapApiProductToCard(apiProduct: ApiProduct): Product {
  const discount =
    apiProduct.compareAtPrice && apiProduct.compareAtPrice > apiProduct.price
      ? Math.round(
          ((apiProduct.compareAtPrice - apiProduct.price) / apiProduct.compareAtPrice) * 100
        )
      : undefined;

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.compareAtPrice,
    image: apiProduct.images?.[0]?.url,
    seller: apiProduct.seller?.name ?? 'Unknown Seller',
    type: apiProduct.type === 'CARGO' ? 'cargo' : 'in-stock',
    rating: Math.round(apiProduct.avgRating ?? 0),
    reviewCount: apiProduct.reviewCount ?? 0,
    discount,
    category: apiProduct.category?.name ?? 'Uncategorized',
  };
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { data: response, isLoading, isError } = useProducts({ limit: 8, sort: 'newest' });

  const products = response?.data
    ? (response.data as ApiProduct[]).map(mapApiProductToCard)
    : [];

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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Unable to load products. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              No featured products available right now.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
