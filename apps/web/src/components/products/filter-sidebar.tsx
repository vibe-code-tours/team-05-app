'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export interface Filters {
  categories: string[];
  brands: string[];
  priceMin: string;
  priceMax: string;
  productType: 'all' | 'in-stock' | 'cargo';
  inStockOnly: boolean;
  rating: number | null;
}

export interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearAll: () => void;
}

interface FilterSectionProps {
  title: string;
  activeCount: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Beauty',
  'Home & Living',
  'Food & Groceries',
  'Sports',
];

const BRANDS = [
  { name: 'Apple', count: 45 },
  { name: 'Samsung', count: 38 },
  { name: 'Nike', count: 27 },
  { name: 'Sony', count: 22 },
  { name: 'Xiaomi', count: 35 },
  { name: "L'Oreal", count: 19 },
];

const PRODUCT_TYPES: { value: 'all' | 'in-stock' | 'cargo'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'cargo', label: 'Cargo' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

function FilterSection({ title, activeCount, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 px-1 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{title}</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {activeCount}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

export function FilterSidebar({ filters, onFilterChange, onClearAll }: FilterSidebarProps) {
  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.productType !== 'all' ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.rating !== null ? 1 : 0);

  const handleCategoryChange = useCallback(
    (category: string) => {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category];
      onFilterChange({ ...filters, categories: newCategories });
    },
    [filters, onFilterChange]
  );

  const handleBrandChange = useCallback(
    (brand: string) => {
      const newBrands = filters.brands.includes(brand)
        ? filters.brands.filter((b) => b !== brand)
        : [...filters.brands, brand];
      onFilterChange({ ...filters, brands: newBrands });
    },
    [filters, onFilterChange]
  );

  const handlePriceChange = useCallback(
    (field: 'priceMin' | 'priceMax', value: string) => {
      onFilterChange({ ...filters, [field]: value });
    },
    [filters, onFilterChange]
  );

  const handleProductTypeChange = useCallback(
    (type: 'all' | 'in-stock' | 'cargo') => {
      onFilterChange({ ...filters, productType: type });
    },
    [filters, onFilterChange]
  );

  const handleInStockOnlyChange = useCallback(() => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
  }, [filters, onFilterChange]);

  const handleRatingChange = useCallback(
    (rating: number) => {
      onFilterChange({ ...filters, rating: filters.rating === rating ? null : rating });
    },
    [filters, onFilterChange]
  );

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive hover:text-destructive/90">
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Category Section */}
      <FilterSection title="Category" activeCount={filters.categories.length}>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand Section */}
      <FilterSection title="Brand" activeCount={filters.brands.length}>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand.name} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.name)}
                  onChange={() => handleBrandChange(brand.name)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">({brand.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection
        title="Price Range"
        activeCount={(filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="price-min" className="text-xs text-muted-foreground mb-1 block">
                Min (MMK)
              </Label>
              <Input
                id="price-min"
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => handlePriceChange('priceMin', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <span className="text-muted-foreground mt-5">-</span>
            <div className="flex-1">
              <Label htmlFor="price-max" className="text-xs text-muted-foreground mb-1 block">
                Max (MMK)
              </Label>
              <Input
                id="price-max"
                type="number"
                placeholder="Any"
                value={filters.priceMax}
                onChange={(e) => handlePriceChange('priceMax', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Product Type Section */}
      <FilterSection title="Product Type" activeCount={filters.productType !== 'all' ? 1 : 0}>
        <div className="space-y-2">
          {PRODUCT_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="product-type"
                checked={filters.productType === type.value}
                onChange={() => handleProductTypeChange(type.value)}
                className="h-4 w-4 border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability Section */}
      <FilterSection title="Availability" activeCount={filters.inStockOnly ? 1 : 0}>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleInStockOnlyChange}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
            In Stock Only
          </span>
        </label>
      </FilterSection>

      {/* Rating Section */}
      <FilterSection title="Rating" activeCount={filters.rating !== null ? 1 : 0}>
        <div className="space-y-2">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingChange(rating)}
              className={`flex items-center gap-2 w-full py-1.5 px-2 rounded-md transition-colors ${
                filters.rating === rating
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-foreground">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
