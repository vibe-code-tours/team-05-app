'use client';

import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ProductBreadcrumbProps {
  productName: string;
  className?: string;
}

export function ProductBreadcrumb({ productName, className = '' }: ProductBreadcrumbProps) {
  return (
    <nav className={cn('bg-card border-b border-border', className)} aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center py-3 space-x-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate max-w-xs">{productName}</span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
