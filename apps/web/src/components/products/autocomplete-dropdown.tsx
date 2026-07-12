'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, TrendingUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuggestionItem {
  id: string;
  type: 'product' | 'category' | 'recent';
  text: string;
  subtitle?: string;
}

interface AutocompleteDropdownProps {
  suggestions: SuggestionItem[];
  isVisible: boolean;
  selectedIndex: number;
  onSelect: (item: SuggestionItem) => void;
  onHighlight: (index: number) => void;
  className?: string;
}

export function AutocompleteDropdown({
  suggestions,
  isVisible,
  selectedIndex,
  onSelect,
  onHighlight,
  className,
}: AutocompleteDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [groupedSuggestions, setGroupedSuggestions] = useState<Record<string, SuggestionItem[]>>({});

  // Group suggestions by type
  useEffect(() => {
    const grouped: Record<string, SuggestionItem[]> = {
      recent: [],
      product: [],
      category: [],
    };

    suggestions.forEach((item) => {
      if (grouped[item.type]) {
        grouped[item.type].push(item);
      }
    });

    setGroupedSuggestions(grouped);
  }, [suggestions]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Click outside, handled by parent
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'product':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'category':
        return <Search className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recent':
        return 'Recent Searches';
      case 'product':
        return 'Products';
      case 'category':
        return 'Categories';
      default:
        return '';
    }
  };

  const renderSuggestion = (item: SuggestionItem, flatIndex: number) => {
    const isSelected = flatIndex === selectedIndex;
    return (
      <button
        key={item.id}
        className={cn(
          'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors',
          'hover:bg-accent/50 focus:bg-accent/50 focus:outline-none',
          isSelected && 'bg-accent'
        )}
        onClick={() => onSelect(item)}
        onMouseEnter={() => onHighlight(flatIndex)}
        data-index={flatIndex}
      >
        <span className="flex-shrink-0">{getTypeIcon(item.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{item.text}</div>
          {item.subtitle && (
            <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
          )}
        </div>
        {item.type === 'recent' && (
          <span className="text-xs text-muted-foreground">Recent</span>
        )}
      </button>
    );
  };

  let flatIndex = 0;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute left-0 right-0 top-full mt-1 z-50',
        'bg-background border border-border rounded-lg shadow-lg',
        'max-h-[320px] overflow-y-auto',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      {Object.entries(groupedSuggestions).map(([type, items]) => {
        if (items.length === 0) return null;

        const startIndex = flatIndex;
        flatIndex += items.length;

        return (
          <div key={type} className="p-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {getTypeLabel(type)}
            </div>
            <div className="space-y-0.5">
              {items.map((item, idx) => renderSuggestion(item, startIndex + idx))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
