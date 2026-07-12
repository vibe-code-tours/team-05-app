'use client'

import React, { useState } from 'react'
import { Star, Truck, Clock, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ProductInfoProps {
  product: {
    id: string
    name: string
    type: 'IN_STOCK' | 'CARGO' | 'PROMOTION'
    rating: number
    reviewCount: number
    price: number
    originalPrice?: number
    currency?: string
    description: string
    stockQuantity: number
    estimatedDelivery?: string
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-500' }
    if (quantity <= 10) return { label: 'Low Stock', variant: 'warning' as const, color: 'text-yellow-500' }
    return { label: 'In Stock', variant: 'success' as const, color: 'text-green-500' }
  }

  const getProductTypeBadge = (type: string) => {
    switch (type) {
      case 'IN_STOCK':
        return { label: 'In Stock', variant: 'success' as const }
      case 'CARGO':
        return { label: 'Cargo', variant: 'secondary' as const }
      case 'PROMOTION':
        return { label: 'Promotion', variant: 'warning' as const }
      default:
        return { label: type, variant: 'default' as const }
    }
  }

  const formatPrice = (price: number, currency: string = 'MMK') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const stockStatus = getStockStatus(product.stockQuantity)
  const productTypeBadge = getProductTypeBadge(product.type)
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  return (
    <div className="space-y-6">
      {/* Product Name and Type */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
        <Badge variant={productTypeBadge.variant}>{productTypeBadge.label}</Badge>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {renderStars(product.rating)}
        </div>
        <span className="text-sm text-muted-foreground">
          {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
        </span>
      </div>

      {/* Price Section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-primary">
            {formatPrice(product.price, product.currency)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice!, product.currency)}
              </span>
              <Badge variant="destructive">-{discountPercentage}%</Badge>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Description
        </h3>
        <div className="relative">
          <p className={`text-foreground leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
            {product.description}
          </p>
          {product.description.length > 200 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-2 transition-colors"
            >
              {isDescriptionExpanded ? (
                <>
                  Show less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
        <span className={`text-sm font-medium ${stockStatus.color}`}>
          {stockStatus.label}
        </span>
        {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
          <span className="text-xs text-muted-foreground">
            ({product.stockQuantity} items left)
          </span>
        )}
      </div>

      {/* Delivery Info */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Delivery Information
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground">
                {product.estimatedDelivery || '3-7 business days'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Order Processing</p>
              <p className="text-xs text-muted-foreground">Ships within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Secure Payment</p>
              <p className="text-xs text-muted-foreground">100% secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
