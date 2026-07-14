'use client'

import { Minus, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Variant {
  id: string
  name: string
  color?: string
  size?: string
  inStock: boolean
  quantity: number
}

export interface VariantSelectorProps {
  variants: Variant[]
  selectedVariant: Variant | null
  onVariantChange: (variant: Variant) => void
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  quantity,
  onQuantityChange,
}: VariantSelectorProps) {
  // Group variants by color (filter out undefined values)
  const colors = [
    ...new Set(
      variants
        .filter((v) => v.color !== undefined)
        .map((v) => v.color!)
    ),
  ]
  // Group variants by size (filter out undefined values)
  const sizes = [
    ...new Set(
      variants
        .filter((v) => v.size !== undefined)
        .map((v) => v.size!)
    ),
  ]

  const selectedColor = selectedVariant?.color
  const selectedSize = selectedVariant?.size

  // Find matching variant based on selection
  const handleColorSelect = (color: string) => {
    const match = variants.find(
      (v) => v.color === color && v.size === selectedSize
    )
    if (match && match.inStock) {
      onVariantChange(match)
    }
  }

  const handleSizeSelect = (size: string) => {
    const match = variants.find(
      (v) => v.size === size && v.color === selectedColor
    )
    if (match && match.inStock) {
      onVariantChange(match)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = selectedVariant?.quantity || 100
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      onQuantityChange(newQuantity)
    }
  }

  return (
    <div className="space-y-6">
      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Color: {selectedColor || 'Select a color'}
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedColor === color
              const match = variants.find(
                (v) => v.color === color && v.size === selectedSize
              )
              const isAvailable = match?.inStock || false

              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    'relative w-10 h-10 rounded-full border-2 transition-all duration-200',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50',
                    !isAvailable && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!isAvailable}
                  title={color}
                >
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground drop-shadow-sm" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Size: {selectedSize || 'Select a size'}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size
              const match = variants.find(
                (v) => v.size === size && v.color === selectedColor
              )
              const isAvailable = match?.inStock || false

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border hover:border-primary/50',
                    !isAvailable &&
                      'line-through text-muted-foreground bg-muted cursor-not-allowed opacity-50'
                  )}
                  disabled={!isAvailable}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className={cn(
              'w-10 h-10 rounded-full border border-border flex items-center justify-center',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) {
                handleQuantityChange(val)
              }
            }}
            min={1}
            max={selectedVariant?.quantity || 100}
            className={cn(
              'w-20 h-10 text-center border border-border rounded-md',
              'bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            )}
          />

          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={
              selectedVariant ? quantity >= selectedVariant.quantity : quantity >= 100
            }
            className={cn(
              'w-10 h-10 rounded-full border border-border flex items-center justify-center',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Variant Summary */}
      {selectedVariant && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            {selectedVariant.name}
            {selectedVariant.inStock && (
              <span className="ml-2 text-primary">✓ In Stock</span>
            )}
            {!selectedVariant.inStock && (
              <span className="ml-2 text-destructive">Out of Stock</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
