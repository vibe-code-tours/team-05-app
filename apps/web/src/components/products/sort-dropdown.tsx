'use client';

import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface SortOption {
  value: string;
  label: string;
}

export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: SortOption[];
}

const DEFAULT_OPTIONS: SortOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Popularity' },
];

export function SortDropdown({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden sm:inline">Sort by:</span>
        <span className="font-semibold">{selectedOption?.label || 'Relevance'}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
          role="listbox"
          aria-label="Sort options"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                option.value === value
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700'
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
