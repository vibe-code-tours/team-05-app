'use client';

import { useState } from 'react';
import { ProductBreadcrumb } from '@/components/product-detail';
import { ProductImageGallery } from '@/components/product-detail';
import { ProductInfo } from '@/components/product-detail';
import { ProductVariants } from '@/components/product-detail';

// Mock Product Data
const MOCK_PRODUCT = {
  id: 'PROD-001',
  name: 'Premium Wireless Bluetooth Headphones',
  description:
    'Experience crystal-clear audio with our premium wireless headphones. Featuring advanced noise cancellation technology, 30-hour battery life, and ultra-comfortable ear cushions for all-day wear. Compatible with all Bluetooth-enabled devices including smartphones, tablets, and laptops.',
  price: 79.99,
  originalPrice: 129.99,
  category: 'Electronics',
  brand: 'AudioTech',
  seller: 'TechGear Store',
  type: 'in-stock' as const,
  rating: 4.5,
  reviewCount: 234,
  stock: 15,
  images: [
    {
      id: '1',
      url: 'https://via.placeholder.com/800?text=Headphones+Front',
      alt: 'Headphones front view',
    },
    {
      id: '2',
      url: 'https://via.placeholder.com/800?text=Headphones+Side',
      alt: 'Headphones side view',
    },
    {
      id: '3',
      url: 'https://via.placeholder.com/800?text=Headphones+Back',
      alt: 'Headphones back view',
    },
    {
      id: '4',
      url: 'https://via.placeholder.com/800?text=Headphones+Details',
      alt: 'Headphones details',
    },
  ],
  variants: {
    size: [
      { id: 's1', name: 'Standard', value: 'standard', inStock: true },
      { id: 's2', name: 'Compact', value: 'compact', inStock: true },
    ],
    color: [
      { id: 'c1', name: 'Midnight Black', value: '#1a1a1a', inStock: true },
      { id: 'c2', name: 'Pearl White', value: '#f5f5f5', inStock: true },
      { id: 'c3', name: 'Ocean Blue', value: '#0066cc', inStock: false },
    ],
  },
};

export default function ProductDetailPage() {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <ProductBreadcrumb productName={MOCK_PRODUCT.name} />

      {/* Main Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Images (50% on desktop) */}
          <div className="w-full md:w-1/2">
            <ProductImageGallery images={MOCK_PRODUCT.images} />
          </div>

          {/* Right Column: Product Info (50% on desktop) */}
          <div className="w-full md:w-1/2">
            <ProductInfo
              id={MOCK_PRODUCT.id}
              name={MOCK_PRODUCT.name}
              description={MOCK_PRODUCT.description}
              price={MOCK_PRODUCT.price}
              originalPrice={MOCK_PRODUCT.originalPrice}
              category={MOCK_PRODUCT.category}
              brand={MOCK_PRODUCT.brand}
              seller={MOCK_PRODUCT.seller}
              type={MOCK_PRODUCT.type}
              rating={MOCK_PRODUCT.rating}
              reviewCount={MOCK_PRODUCT.reviewCount}
              stock={MOCK_PRODUCT.stock}
            />

            {/* Variants Section */}
            <div className="mt-8">
              <ProductVariants
                variants={MOCK_PRODUCT.variants}
                selectedVariants={selectedVariants}
                onVariantChange={handleVariantChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
