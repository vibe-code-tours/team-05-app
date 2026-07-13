'use client';

import { useState } from 'react';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import { FilterToggleButton, FilterOverlay } from '@/components/products';
import { useProducts, ProductFilters } from '@/lib/services/product.service';
import Link from 'next/link';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const itemsPerPage = 20;

  const filters: ProductFilters = {
    page: currentPage,
    limit: itemsPerPage,
    sort: sortBy !== 'relevance' ? sortBy : undefined,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
  };

  const { data: response, isLoading, error } = useProducts(filters);

  const products = response?.data || [];
  const totalProducts = response?.meta?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center py-3 space-x-2 text-sm">
            <li>
              <a
                href="/"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">Products</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Filter Toggle */}
        <div className="mb-4 lg:hidden">
          <FilterToggleButton isOpen={isFilterOpen} onClick={toggleFilter} />
        </div>

        {/* Filter Overlay for Mobile */}
        <FilterOverlay isOpen={isFilterOpen} onClick={toggleFilter} />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Filters */}
          <aside
            id="filter-sidebar"
            className={`
              fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 overflow-y-auto
              transform transition-transform duration-300 ease-in-out
              lg:relative lg:transform-none lg:transition-none
              ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              {/* Filter sections will be added here */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {['Electronics', 'Clothing', 'Home & Garden', 'Sports'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">In Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">1-20</span> of{' '}
                  <span className="font-medium text-gray-900">{totalProducts}</span> products
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-gray-600">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {selectedCategories.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Active Filters:</span>
                  {selectedCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      {category}
                      <span className="ml-1 text-blue-400">&times;</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Failed to load products. Please try again.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="aspect-square bg-gray-200 relative">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                          Out of Stock
                        </div>
                      )}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category?.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900">
                          ${product.price.toLocaleString()}
                        </p>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <p className="text-sm text-gray-400 line-through">
                            ${product.compareAtPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            <nav className="mt-8 flex items-center justify-between" aria-label="Pagination">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </main>
        </div>
      </div>
    </div>
  );
}
