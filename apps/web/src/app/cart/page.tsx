'use client'

import { ShoppingCart, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart.store'
import { CartItem, CartSummary, EmptyCart } from '@/components/cart'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const getShipping = useCartStore((state) => state.getShipping)
  const getTax = useCartStore((state) => state.getTax)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const tax = getTax()
  const total = getTotal()
  const itemCount = getItemCount()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyCart />
        </div>
      </div>
    )
  }

  const outOfStockCount = items.filter((item) => item.quantity > item.stock).length

  return (
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
            onClick={clearCart}
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
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
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
  )
}
