export interface ProductFilters {
  search?: string;
  categories: string[];
  types: ('in-stock' | 'cargo')[];
  priceRange: {
    min?: number;
    max?: number;
  };
  rating?: number;
  seller?: string;
}

export type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'popular'
  | 'discount';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface CategoryFilter extends FilterOption {
  icon?: string;
}

export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

export interface SortOptionItem {
  value: SortOption;
  label: string;
  description: string;
}
