'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface VariantOption {
  id: string;
  name: string;
  value: string;
  inStock: boolean;
}

export interface ProductVariantsProps {
  variants: {
    size?: VariantOption[];
    color?: VariantOption[];
  };
  selectedVariants: Record<string, string>;
  onVariantChange: (type: string, value: string) => void;
  className?: string;
}

export function ProductVariants({
  variants,
  selectedVariants,
  onVariantChange,
  className = '',
}: ProductVariantsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Size Variants */}
      {variants.size && variants.size.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
          <div className="flex flex-wrap gap-3">
            {variants.size.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onVariantChange('size', variant.value)}
                disabled={!variant.inStock}
                className={cn(
                  'relative px-4 py-2 rounded-lg border-2 font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  selectedVariants.size === variant.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : variant.inStock
                    ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                )}
              >
                {variant.name}
                {selectedVariants.size === variant.value && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Variants */}
      {variants.color && variants.color.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
          <div className="flex flex-wrap gap-3">
            {variants.color.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onVariantChange('color', variant.value)}
                disabled={!variant.inStock}
                className={cn(
                  'relative w-10 h-10 rounded-full border-2 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  selectedVariants.color === variant.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : variant.inStock
                    ? 'border-gray-200 hover:border-gray-400'
                    : 'border-gray-200 cursor-not-allowed opacity-50'
                )}
                title={variant.name}
              >
                <span
                  className="absolute inset-1 rounded-full"
                  style={{ backgroundColor: variant.value }}
                />
                {selectedVariants.color === variant.value && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Show selected color name */}
          {selectedVariants.color && (
            <p className="mt-2 text-sm text-gray-600">
              Selected:{' '}
              <span className="font-medium">
                {variants.color.find((v) => v.value === selectedVariants.color)?.name}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
