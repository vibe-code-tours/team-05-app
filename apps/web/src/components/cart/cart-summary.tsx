'use client'

import Link from 'next/link'
import { Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

export interface CartSummaryProps {
  subtotal: number
  shipping: number
  tax: number
  total: number
  itemCount: number
}

export function CartSummary({
  subtotal,
  shipping,
  tax,
  total,
  itemCount,
}: CartSummaryProps) {
  const isFreeShipping = shipping === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {isFreeShipping ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-base font-semibold">Total</span>
          <span className="text-base font-bold">{formatPrice(total)}</span>
        </div>

        {/* Free Shipping Notice */}
        {isFreeShipping && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
            <Truck className="h-4 w-4 flex-shrink-0" />
            <span>You qualify for free shipping!</span>
          </div>
        )}

        {/* Checkout Button */}
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">
            Proceed to Checkout
          </Link>
        </Button>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
