'use client'

import { ShoppingCart, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/lib/services/cart.service'
import { CartItem, CartSummary, EmptyCart } from '@/components/cart'
import { formatPrice } from '@/lib/utils'
import type { CartItemView } from '@/types/cart'
import { ProtectedRoute } from '@/components/auth/protected-route'

/** Map nested API CartItem to flat CartItemView for UI components. */
function toCartItemView(item: import('@/types/cart').CartItem): CartItemView {
  return {
    id: item.id,
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images[0] ?? '/placeholder.png',
    quantity: item.quantity,
    stock: item.product.stock,
    seller: '',
  }
}

export default function CartPage() {
  const { data: cart, isLoading, error } = useCart()
  const updateCartItem = useUpdateCartItem()
  const removeCartItem = useRemoveCartItem()
  const clearCart = useClearCart()

  // --- Derived values from API data (unwrap ApiResponse) ---
  const cartData = cart?.data
  const items = cartData?.items ?? []
  const subtotal = cartData?.subtotal ?? 0
  const shipping = subtotal >= 50000 ? 0 : 3000
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax
  const itemCount = cartData?.itemCount ?? 0

  // --- Handlers (wrap mutations to match component callback signatures) ---
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem.mutate(id)
    } else {
      updateCartItem.mutate({ itemId: id, quantity })
    }
  }

  const handleRemove = (id: string) => {
    removeCartItem.mutate(id)
  }

  const handleClearCart = () => {
    clearCart.mutate()
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
              <ShoppingCart className="h-6 w-6 text-foreground animate-pulse" />
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Failed to load cart
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                Something went wrong while fetching your cart. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // --- Empty cart ---
  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EmptyCart />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const cartItemViews = items.map(toCartItemView)
  const outOfStockCount = cartItemViews.filter((item) => item.quantity > item.stock).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleClearCart}
            disabled={clearCart.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        {/* Out of Stock Warning */}
        {outOfStockCount > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 mb-6 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>
              {outOfStockCount} {outOfStockCount === 1 ? 'item has' : 'items have'} quantities exceeding available stock. Please adjust before checkout.
            </span>
          </div>
        )}

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItemViews.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
                itemCount={itemCount}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
