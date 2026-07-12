'use client';

import { cn } from '@/lib/utils';
import { Tag, Truck, Store, Clock, ShoppingBag } from 'lucide-react';
import { ProductRating } from './ProductRating';

export interface ProductInfoProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  seller: string;
  type: 'in-stock' | 'cargo' | 'promotion';
  rating: number;
  reviewCount: number;
  stock: number;
  className?: string;
}

export function ProductInfo({
  id,
  name,
  description,
  price,
  originalPrice,
  category,
  brand,
  seller,
  type,
  rating,
  reviewCount,
  stock,
  className = '',
}: ProductInfoProps) {
  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const getTypeBadge = () => {
    const badges = {
      'in-stock': {
        label: 'In Stock',
        icon: Store,
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      cargo: {
        label: 'Cargo',
        icon: Truck,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      promotion: {
        label: 'Promotion',
        icon: Tag,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
      },
    };
    return badges[type];
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Product Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        <p className="text-sm text-gray-500">
          {brand} • {category}
        </p>
      </div>

      {/* Rating */}
      <ProductRating rating={rating} reviewCount={reviewCount} />

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</span>
          {originalPrice && (
            <>
              <span className="text-lg text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
              <span className="px-2 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>
        {type === 'promotion' && (
          <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Limited time offer
          </p>
        )}
      </div>

      {/* Type Badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border',
            badge.className
          )}
        >
          <BadgeIcon className="w-4 h-4" />
          {badge.label}
        </span>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Seller Info */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Sold by</p>
            <p className="font-medium text-gray-900">{seller}</p>
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
        <div className="flex items-center gap-2">
          {stock > 0 ? (
            <>
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-700">
                In Stock
                {stock <= 10 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    (Only {stock} left!)
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-red-600 font-medium">Out of Stock</span>
            </>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        disabled={stock === 0}
        className={cn(
          'w-full py-3 px-6 rounded-lg font-semibold text-white transition-all',
          'flex items-center justify-center gap-2',
          stock > 0
            ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
        )}
      >
        <ShoppingBag className="w-5 h-5" />
        {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
      </button>

      {/* SKU/ID */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          SKU: <span className="font-mono">{id}</span>
        </p>
      </div>
    </div>
  );
}
