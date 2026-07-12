'use client';

import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface ProductBreadcrumbProps {
  productName: string;
  className?: string;
}

export function ProductBreadcrumb({ productName, className = '' }: ProductBreadcrumbProps) {
  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`} aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center py-3 space-x-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Products
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{productName}</span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
