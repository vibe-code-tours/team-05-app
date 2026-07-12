'use client';

import { ProductCard, Product } from '@/components/home/product-card';
import { ProductFilters, SortOption, PaginationState } from './types';

// Mock data: 20 products with varied attributes
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 2850000,
    originalPrice: 3000000,
    seller: 'TechStore Myanmar',
    type: 'in-stock',
    rating: 5,
    reviewCount: 245,
    discount: 5,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1950000,
    seller: 'MobileHub',
    type: 'in-stock',
    rating: 4,
    reviewCount: 189,
    discount: 10,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'MacBook Pro 16 inch M3',
    price: 3000000,
    seller: 'Apple Store Yangon',
    type: 'cargo',
    rating: 5,
    reviewCount: 98,
    discount: 0,
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'Myanmar Traditional Longyi',
    price: 25000,
    seller: 'Yangon Fashion House',
    type: 'in-stock',
    rating: 4,
    reviewCount: 312,
    discount: 15,
    category: 'Fashion',
  },
  {
    id: '5',
    name: 'Thai Silk Scarf Premium',
    price: 150000,
    seller: 'Bangkok Imports Co',
    type: 'cargo',
    rating: 5,
    reviewCount: 67,
    discount: 20,
    category: 'Fashion',
  },
  {
    id: '6',
    name: 'Burmese Jade Necklace',
    price: 450000,
    seller: 'Myanmar Gems Center',
    type: 'in-stock',
    rating: 4,
    reviewCount: 156,
    discount: 5,
    category: 'Fashion',
  },
  {
    id: '7',
    name: 'Thai Beauty Set Premium',
    price: 85000,
    seller: 'Bangkok Beauty Shop',
    type: 'cargo',
    rating: 4,
    reviewCount: 234,
    discount: 25,
    category: 'Beauty',
  },
  {
    id: '8',
    name: 'Thanaka Face Cream',
    price: 12000,
    seller: 'Natural Myanmar Beauty',
    type: 'in-stock',
    rating: 5,
    reviewCount: 456,
    discount: 0,
    category: 'Beauty',
  },
  {
    id: '9',
    name: 'Handmade Ceramic Bowl Set',
    price: 65000,
    seller: 'Artisan Home Decor',
    type: 'in-stock',
    rating: 4,
    reviewCount: 89,
    discount: 10,
    category: 'Home',
  },
  {
    id: '10',
    name: 'Bangkok Kitchen Utensils',
    price: 35000,
    seller: 'Thai Kitchen Store',
    type: 'cargo',
    rating: 3,
    reviewCount: 67,
    discount: 30,
    category: 'Home',
  },
  {
    id: '11',
    name: 'Teak Wood Coffee Table',
    price: 850000,
    seller: 'Myanmar Woodworks',
    type: 'in-stock',
    rating: 5,
    reviewCount: 42,
    discount: 0,
    category: 'Home',
  },
  {
    id: '12',
    name: 'Shan Noodle Sauce Mix',
    price: 5000,
    seller: 'Myanmar Food Direct',
    type: 'in-stock',
    rating: 4,
    reviewCount: 892,
    discount: 0,
    category: 'Food',
  },
  {
    id: '13',
    name: 'Thai Coconut Curry Paste',
    price: 8500,
    seller: 'Thai Food Imports',
    type: 'cargo',
    rating: 4,
    reviewCount: 234,
    discount: 15,
    category: 'Food',
  },
  {
    id: '14',
    name: 'Rakhine Dried Fish Special',
    price: 45000,
    seller: 'Myanmar Seafood',
    type: 'in-stock',
    rating: 3,
    reviewCount: 178,
    discount: 0,
    category: 'Food',
  },
  {
    id: '15',
    name: 'Football Boot Nike',
    price: 285000,
    seller: 'Sports World Myanmar',
    type: 'in-stock',
    rating: 5,
    reviewCount: 156,
    discount: 10,
    category: 'Sports',
  },
  {
    id: '16',
    name: 'Yoga Mat Premium Thai',
    price: 45000,
    seller: 'Fitness Hub Bangkok',
    type: 'cargo',
    rating: 4,
    reviewCount: 89,
    discount: 20,
    category: 'Sports',
  },
  {
    id: '17',
    name: 'Badminton Racket Set',
    price: 125000,
    seller: 'Sports Corner Yangon',
    type: 'in-stock',
    rating: 4,
    reviewCount: 67,
    discount: 0,
    category: 'Sports',
  },
  {
    id: '18',
    name: 'AirPods Pro 2',
    price: 385000,
    seller: 'TechStore Myanmar',
    type: 'in-stock',
    rating: 5,
    reviewCount: 567,
    discount: 5,
    category: 'Electronics',
  },
  {
    id: '19',
    name: 'Silk Pillowcase Thai',
    price: 75000,
    seller: 'Home Comforts BKK',
    type: 'cargo',
    rating: 4,
    reviewCount: 123,
    discount: 10,
    category: 'Home',
  },
  {
    id: '20',
    name: 'Casio G-Shock Watch',
    price: 325000,
    seller: 'Watch Paradise Myanmar',
    type: 'in-stock',
    rating: 4,
    reviewCount: 289,
    discount: 0,
    category: 'Fashion',
  },
];

export interface ProductGridProps {
  products?: Product[];
  loading?: boolean;
  filters?: ProductFilters;
  sortBy?: SortOption;
  pagination?: PaginationState;
}

export function ProductGrid({
  products = mockProducts,
  loading = false,
}: ProductGridProps) {
  // Skeleton loader component for loading state
  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  // Show skeleton loader when loading
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(12)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state when no products
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 max-w-md">
          We couldn't find any products matching your filters. Try adjusting your search criteria or browse our categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <div key={product.id} className="flex">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
