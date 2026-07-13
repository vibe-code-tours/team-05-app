'use client'

import Image from 'next/image'
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, cn } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types/cart'

export interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const isOutOfStock = item.quantity > item.stock
  const lineTotal = item.price * item.quantity

  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-lg border bg-card',
      isOutOfStock && 'border-destructive/50 bg-destructive/5'
    )}>
      {/* Product Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-medium text-foreground truncate">
            {item.name}
          </h3>
          {item.variant && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.variant}
            </p>
          )}
          <p className="text-sm font-semibold text-foreground mt-1">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Out of Stock Warning */}
        {isOutOfStock && (
          <div className="flex items-center gap-1.5 mt-2">
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Only {item.stock} left in stock
            </Badge>
          </div>
        )}
      </div>

      {/* Quantity Controls & Total */}
      <div className="flex flex-col items-end justify-between">
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-sm font-semibold text-foreground min-w-[80px] text-right">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
