'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Your cart is empty
      </h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Looks like you have not added anything to your cart yet. Browse our products and find something you love.
      </p>
      <Button asChild size="lg">
        <Link href="/products">
          Continue Shopping
        </Link>
      </Button>
    </div>
  )
}
