'use client'

import * as React from 'react'
import Link from 'next/link'
import { Clock, ArrowRight, Sparkles, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useProducts, type Product as ApiProduct } from '@/lib/services/product.service'

interface ArrivalCard {
  id: string
  name: string
  price: number
  image?: string
  category: string
  slug: string
}

function mapApiProductToCard(apiProduct: ApiProduct): ArrivalCard {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    image: apiProduct.images?.[0]?.url,
    category: apiProduct.category?.name ?? 'Uncategorized',
    slug: apiProduct.slug,
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('my-MM', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' MMK'
}

function ArrivalSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 rounded-lg border border-border overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export interface NewArrivalsProps {
  className?: string
}

export function NewArrivals({ className }: NewArrivalsProps) {
  const { data: response, isLoading, isError } = useProducts({ limit: 6, sort: 'newest' })
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const products = response?.data
    ? (response.data as ApiProduct[]).map(mapApiProductToCard)
    : []

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
  }, [checkScrollPosition, products.length])

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
          <Button variant="ghost" asChild>
            <Link href="/products?sort=newest" className="flex items-center gap-2 text-primary hover:text-primary/80">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-6 overflow-hidden pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArrivalSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Unable to load new arrivals. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              No new arrivals just yet. Check back soon!
            </p>
          </div>
        )}

        {/* Products Carousel */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="relative">
            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="contents"
                >
                  <Card className="flex-shrink-0 w-72 snap-start hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Image Container */}
                      <div className="relative aspect-square mb-4 bg-muted rounded-lg overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                            <span className="text-muted-foreground text-sm">
                              {product.name.split(' ')[0]}
                            </span>
                          </div>
                        )}

                        {/* New Badge */}
                        <Badge
                          className="absolute top-2 left-2 bg-primary text-primary-foreground"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          New
                        </Badge>
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
                </Link>
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
        )}
      </div>
    </section>
  )
}
