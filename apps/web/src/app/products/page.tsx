'use client';

import { useState, useCallback } from 'react';
import { Home, ChevronRight, Loader2, AlertCircle, PackageX } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';
import { FilterSidebar, Filters } from '@/components/products/filter-sidebar';
import { FilterToggleButton, FilterOverlay } from '@/components/products';
import {
  useProducts,
  useCategories,
  useBrands,
  ProductFilters,
} from '@/lib/services/product.service';
import Link from 'next/link';

const INITIAL_FILTERS: Filters = {
  categories: [],
  brands: [],
  priceMin: '',
  priceMax: '',
  productType: 'all',
  inStockOnly: false,
  rating: null,
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

const SORT_MAP: Record<string, string> = {
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  newest: 'newest',
  rating: 'rating',
};

const ITEMS_PER_PAGE = 20;

function buildApiFilters(
  filters: Filters,
  sortBy: string,
  currentPage: number
): ProductFilters {
  const apiFilters: ProductFilters = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  };

  if (filters.categories.length > 0) {
    apiFilters.category = filters.categories[0];
  }

  if (filters.brands.length > 0) {
    apiFilters.brand = filters.brands[0];
  }

  if (filters.priceMin) {
    apiFilters.minPrice = Number(filters.priceMin);
  }

  if (filters.priceMax) {
    apiFilters.maxPrice = Number(filters.priceMax);
  }

  if (filters.productType !== 'all') {
    apiFilters.type = filters.productType === 'in-stock' ? 'IN_STOCK' : 'CARGO';
  }

  if (sortBy !== 'relevance') {
    apiFilters.sort = SORT_MAP[sortBy] ?? sortBy;
  }

  return apiFilters;
}

export default function ProductsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const apiFilters = buildApiFilters(filters, sortBy, currentPage);
  const { data: response, isLoading, error } = useProducts(apiFilters);
  const { data: categoriesResponse } = useCategories();
  const { data: brandsResponse } = useBrands();

  const products = response?.data ?? [];
  const meta = response?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalProducts = meta?.total ?? 0;

  const apiCategories = categoriesResponse?.data ?? [];
  const apiBrands = brandsResponse?.data ?? [];

  const sidebarCategories = apiCategories.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c._count?.products,
  }));

  const sidebarBrands = apiBrands.map((b) => ({
    name: b.name,
    slug: b.slug,
    count: b._count?.products,
  }));

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleFilter = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.productType !== 'all' ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.rating !== null ? 1 : 0);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalProducts);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <nav className="bg-card border-b border-border" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center py-3 space-x-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">Products</span>
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
                fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border overflow-y-auto
                transform transition-transform duration-300 ease-in-out
                lg:relative lg:transform-none lg:transition-none
                ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
            >
              <div className="p-6 lg:p-0">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAll}
                  categories={sidebarCategories.length > 0 ? sidebarCategories : undefined}
                  brands={sidebarBrands.length > 0 ? sidebarBrands : undefined}
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Results Count */}
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? (
                      'Loading products...'
                    ) : (
                      <>
                        Showing{' '}
                        <span className="font-medium text-foreground">
                          {startIndex}-{endIndex}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-foreground">{totalProducts}</span>{' '}
                        products
                      </>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort-select" className="text-sm text-muted-foreground">
                      Sort by:
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="block w-full sm:w-auto rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-card text-foreground"
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
                {activeFilterCount > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active Filters:</span>
                    {filters.categories.map((slug) => {
                      const cat = sidebarCategories.find((c) => c.slug === slug) ?? { name: slug };
                      return (
                        <button
                          key={slug}
                          onClick={() =>
                            handleFilterChange({
                              ...filters,
                              categories: filters.categories.filter((c) => c !== slug),
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary bg-primary/10 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        >
                          {cat.name}
                          <span className="ml-1">&times;</span>
                        </button>
                      );
                    })}
                    {filters.brands.map((slug) => {
                      const brand = sidebarBrands.find((b) => b.slug === slug) ?? { name: slug };
                      return (
                        <button
                          key={slug}
                          onClick={() =>
                            handleFilterChange({
                              ...filters,
                              brands: filters.brands.filter((b) => b !== slug),
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary bg-primary/10 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        >
                          {brand.name}
                          <span className="ml-1">&times;</span>
                        </button>
                      );
                    })}
                    {filters.productType !== 'all' && (
                      <button
                        onClick={() =>
                          handleFilterChange({ ...filters, productType: 'all' })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary bg-primary/10 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      >
                        {filters.productType === 'in-stock' ? 'In Stock' : 'Cargo'}
                        <span className="ml-1">&times;</span>
                      </button>
                    )}
                    {filters.priceMin && (
                      <button
                        onClick={() =>
                          handleFilterChange({ ...filters, priceMin: '' })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary bg-primary/10 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      >
                        Min: {Number(filters.priceMin).toLocaleString()} MMK
                        <span className="ml-1">&times;</span>
                      </button>
                    )}
                    {filters.priceMax && (
                      <button
                        onClick={() =>
                          handleFilterChange({ ...filters, priceMax: '' })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary bg-primary/10 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      >
                        Max: {Number(filters.priceMax).toLocaleString()} MMK
                        <span className="ml-1">&times;</span>
                      </button>
                    )}
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Product Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading products...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive font-medium mb-2">Failed to load products</p>
                  <p className="text-sm text-muted-foreground">
                    Please try again later or adjust your filters.
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <PackageX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={
                            product.images?.[0]?.url ||
                            'https://via.placeholder.com/300'
                          }
                          alt={product.images?.[0]?.alt || product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.stock <= 0 && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded">
                            Out of Stock
                          </div>
                        )}
                        {product.compareAtPrice &&
                          product.compareAtPrice > product.price && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                              Sale
                            </div>
                          )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {product.category?.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">
                            ${product.price.toLocaleString()}
                          </p>
                          {product.compareAtPrice &&
                            product.compareAtPrice > product.price && (
                              <p className="text-sm text-muted-foreground line-through">
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
              {totalPages > 1 && (
                <nav
                  className="mt-8 flex items-center justify-between"
                  aria-label="Pagination"
                >
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-foreground bg-card border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-foreground bg-card border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-foreground">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-foreground bg-card border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                          const page = startPage + i;
                          if (page > totalPages) return null;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                currentPage === page
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground bg-card border border-border hover:bg-background'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-foreground bg-card border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </nav>
              )}
            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
