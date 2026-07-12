'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AutocompleteDropdown,
  SuggestionItem,
} from './autocomplete-dropdown';

// Mock data for products
const MOCK_PRODUCTS = [
  { id: '1', name: 'iPhone 15', category: 'Electronics' },
  { id: '2', name: 'Samsung Galaxy', category: 'Electronics' },
  { id: '3', name: 'Nike Air Max', category: 'Shoes' },
  { id: '4', name: 'Skincare Set', category: 'Beauty' },
  { id: '5', name: 'Xiaomi Robot Vacuum', category: 'Home Appliances' },
];

// Mock data for categories
const MOCK_CATEGORIES = [
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Shoes' },
  { id: 'cat3', name: 'Beauty' },
  { id: 'cat4', name: 'Home Appliances' },
  { id: 'cat5', name: 'Fashion' },
];

// Local storage key for recent searches
const RECENT_SEARCHES_KEY = 'crossmart_recent_searches';
const MAX_RECENT_SEARCHES = 5;

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = 'Search products, categories...',
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Debounce input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Generate suggestions based on debounced query
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    const newSuggestions: SuggestionItem[] = [];

    // Add recent searches if they match
    const matchingRecentSearches = recentSearches
      .filter((search) => search.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((search) => ({
        id: `recent-${search}`,
        type: 'recent' as const,
        text: search,
        subtitle: 'Recent search',
      }));
    newSuggestions.push(...matchingRecentSearches);

    // Add product matches
    const matchingProducts = MOCK_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    )
      .slice(0, 5)
      .map((product) => ({
        id: product.id,
        type: 'product' as const,
        text: product.name,
        subtitle: product.category,
      }));
    newSuggestions.push(...matchingProducts);

    // Add category matches
    const matchingCategories = MOCK_CATEGORIES.filter((category) =>
      category.name.toLowerCase().includes(lowerQuery)
    )
      .slice(0, 3)
      .map((category) => ({
        id: category.id,
        type: 'category' as const,
        text: category.name,
        subtitle: 'Category',
      }));
    newSuggestions.push(...matchingCategories);

    // Limit to 5 suggestions total
    const limitedSuggestions = newSuggestions.slice(0, 5);
    setSuggestions(limitedSuggestions);
    setIsDropdownOpen(limitedSuggestions.length > 0);
    setSelectedIndex(-1);
  }, [debouncedQuery, recentSearches]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isDropdownOpen || suggestions.length === 0) {
        if (e.key === 'Enter' && query.trim()) {
          handleSearch(query.trim());
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearch(query.trim());
          }
          break;
        case 'Escape':
          setIsDropdownOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isDropdownOpen, suggestions, selectedIndex, query]
  );

  // Handle search submission
  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      // Add to recent searches
      const updatedRecentSearches = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updatedRecentSearches);
      localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updatedRecentSearches)
      );

      setIsDropdownOpen(false);
      onSearch?.(searchQuery);
    },
    [recentSearches, onSearch]
  );

  // Handle suggestion selection
  const handleSelect = useCallback(
    (item: SuggestionItem) => {
      setQuery(item.text);
      handleSearch(item.text);
    },
    [handleSearch]
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSuggestions([]);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  // Handle highlight change from dropdown
  const handleHighlight = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && debouncedQuery.length >= 3) {
              setIsDropdownOpen(true);
            }
          }}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'transition-colors'
          )}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-controls="search-dropdown"
        />
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'p-1 rounded-full hover:bg-muted transition-colors',
              'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AutocompleteDropdown
        suggestions={suggestions}
        isVisible={isDropdownOpen}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onHighlight={handleHighlight}
      />
    </div>
  );
}

export default SearchBar;
