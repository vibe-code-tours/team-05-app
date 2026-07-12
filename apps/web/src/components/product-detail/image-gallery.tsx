'use client';

import { useState, useCallback, useRef } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZoomModal } from './zoom-modal';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ImageGallery({
  images,
  productName,
  className
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const displayImages = images.slice(0, 6);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setIsZoomed(false);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : prev));
    setIsZoomed(false);
  }, [displayImages.length]);

  const handleImageHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !displayImages[selectedIndex]) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
    setIsZoomed(true);
  }, [selectedIndex, displayImages]);

  const handleImageLeave = useCallback(() => {
    setIsZoomed(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleImageHover({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        currentTarget: e.currentTarget
      } as React.MouseEvent<HTMLDivElement>);
    }
  }, [handleImageHover]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleImageHover({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        currentTarget: e.currentTarget
      } as React.MouseEvent<HTMLDivElement>);
    }
  }, [handleImageHover]);

  const handleTouchEnd = useCallback(() => {
    setIsZoomed(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleNavigateModal = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main Image Display */}
      <div className="relative">
        <div
          ref={imageContainerRef}
          className={cn(
            'relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden',
            'group'
          )}
          onMouseMove={handleImageHover}
          onMouseLeave={handleImageLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {displayImages[selectedIndex] ? (
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={displayImages[selectedIndex]}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-300',
                  isZoomed && 'scale-150'
                )}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }
                    : undefined
                }
                draggable={false}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <div className="text-center text-blue-500">
                <div className="w-16 h-16 mx-auto bg-blue-300 rounded-lg mb-2 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium">{productName}</p>
              </div>
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/50 text-white rounded-full p-3">
              <ZoomIn className="w-6 h-6" />
            </div>
          </div>

          {/* Navigation arrows */}
          {selectedIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {selectedIndex < displayImages.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Fullscreen button */}
          <button
            onClick={handleOpenModal}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
            aria-label="Open fullscreen view"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Image counter */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
          {selectedIndex + 1} of {displayImages.length}
        </div>
      </div>

      {/* Thumbnail Carousel */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                index === selectedIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              aria-label={`View image ${index + 1}`}
            >
              {image ? (
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-400 rounded" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <ZoomModal
        images={displayImages}
        currentIndex={selectedIndex}
        productName={productName}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={handleNavigateModal}
      />
    </div>
  );
}
