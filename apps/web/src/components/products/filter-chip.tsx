'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  variant?: 'category' | 'brand' | 'price' | 'type' | 'availability' | 'rating';
}

const VARIANT_STYLES: Record<string, string> = {
  category: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
  brand: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200',
  price: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200',
  type: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200',
  availability: 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200',
  rating: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200',
};

const VARIANT_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  category: 'secondary',
  brand: 'secondary',
  price: 'secondary',
  type: 'success',
  availability: 'warning',
  rating: 'secondary',
};

export function FilterChip({ label, value, onRemove, variant = 'category' }: FilterChipProps) {
  const badgeVariant = VARIANT_BADGE[variant] || 'secondary';
  const customStyles = VARIANT_STYLES[variant] || '';

  return (
    <Badge
      variant={badgeVariant}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium transition-colors cursor-default border',
        customStyles
      )}
    >
      <span className="text-xs text-current/70">{label}:</span>
      <span className="font-semibold">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-current/20 transition-colors focus:outline-none focus:ring-1 focus:ring-current"
        aria-label={`Remove ${label}: ${value}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
