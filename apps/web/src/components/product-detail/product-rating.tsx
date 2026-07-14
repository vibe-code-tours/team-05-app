'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface ProductRatingProps {
  rating: number;
  reviewCount: number;
  className?: string;
}

export function ProductRating({ rating, reviewCount, className = '' }: ProductRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-0.5">
        {/* Full Stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <Star className="absolute inset-0 w-5 h-5 text-muted-foreground/30" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-muted-foreground/30" />
        ))}
      </div>

      <span className="text-lg font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
    </div>
  );
}
