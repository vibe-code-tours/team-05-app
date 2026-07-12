'use client';

import { SearchX } from 'lucide-react';

export interface EmptyStateProps {
  searchTerm?: string;
  onClearFilters: () => void;
}

export function EmptyState({ searchTerm, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <SearchX className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No products found
      </h3>

      <p className="text-gray-600 mb-6 max-w-md">
        {searchTerm
          ? `We couldn't find any products matching "${searchTerm}". Try adjusting your search or filters.`
          : 'No products match your current filters. Try adjusting your search criteria.'}
      </p>

      <button
        onClick={onClearFilters}
        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
