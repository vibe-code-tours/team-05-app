'use client'

import * as React from 'react'
import { Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  isNew: boolean
  category: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1899000,
    image: '/placeholder-product.png',
    isNew: true,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Nike Air Max 270',
    price: 259000,
    image: '/placeholder-product.png',
    isNew: true,
    category: 'Fashion',
  },
  {
    id: '3',
    name: 'MacBook Pro 14" M3',
    price: 4999000,
    image: '/placeholder-product.png',
    isNew: true,
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'AirPods Pro (2nd Gen)',
    price: 389000,
    image: '/placeholder-product.png',
    isNew: true,
    category: 'Electronics',
  },
  {
    id: '5',
    name: 'Adidas Ultraboost 23',
    price: 229000,
    image: '/placeholder-product.png',
    isNew: true,
    category: 'Fashion',
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    price: 699000,
    image: '/placeholder-product.png',
    isNew: true,
    category: 'Electronics',
  },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('my-MM', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' MMK'
}

export interface NewArrivalsProps {
  className?: string
}

export function NewArrivals({ className }: NewArrivalsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const checkScrollPosition = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  React.useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [checkScrollPosition])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <section className={cn('py-12 px-4 md:px-8 bg-background', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              New Arrivals
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mockProducts.map((product) => (
              <Card
                key={product.id}
                className="flex-shrink-0 w-72 snap-start hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  {/* Image Container */}
                  <div className="relative aspect-square mb-4 bg-muted rounded-lg overflow-hidden">
                    {/* Product Image Placeholder */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                      <span className="text-muted-foreground text-sm">
                        {product.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* New Badge */}
                    {product.isNew && (
                      <Badge
                        className="absolute top-2 left-2 bg-primary text-primary-foreground"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}

                    {/* Quick Add Button */}
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 bg-primary/90 hover:bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Add to Cart
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 hover:bg-primary/5"
                  >
                    Quick View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background border border-border shadow-lg rounded-full p-2 hover:bg-muted transition-colors hidden md:flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background border border-border shadow-lg rounded-full p-2 hover:bg-muted transition-colors hidden md:flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
