'use client';

import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FilterToggleButton({ isOpen, onClick }: FilterToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:hidden"
      aria-expanded={isOpen}
      aria-controls="filter-sidebar"
    >
      {isOpen ? (
        <>
          <X className="w-4 h-4" />
          Close Filters
        </>
      ) : (
        <>
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </>
      )}
    </button>
  );
}

export interface FilterOverlayProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FilterOverlay({ isOpen, onClick }: FilterOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
