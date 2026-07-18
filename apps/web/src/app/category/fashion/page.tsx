'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { useProducts } from '@/lib/services/product.service'
import Link from 'next/link'
import { ChevronRight, Home, Loader2, PackageX, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

const CATEGORY_SLUG = 'fashion'
const CATEGORY_NAME = 'Fashion'

const ITEMS_PER_PAGE = 20

export default function FashionPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: response, isLoading, error } = useProducts({
    category: CATEGORY_SLUG,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  })

  const products = response?.data ?? []
  const meta = response?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalProducts = meta?.total ?? 0

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{CATEGORY_NAME}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{CATEGORY_NAME}</h1>
          <p className="text-muted-foreground mt-1">
            {totalProducts} products available
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">Failed to load products. Please try again.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <PackageX className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PackageX className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                      {product.type === 'CARGO' && (
                        <Badge variant="secondary" className="mt-2 text-xs">Cargo</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  )
}
