'use client'

import { ShoppingCart, Heart, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { useState } from 'react'

export interface AddToCartProps {
  price: number
  quantity: number
  onAddToCart: () => void
  onBuyNow: () => void
  onWishlist: () => void
  onShare: () => void
}

export function AddToCart({
  price,
  quantity,
  onAddToCart,
  onBuyNow,
  onWishlist,
  onShare,
}: AddToCartProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const totalPrice = price * quantity

  const handleAddToCart = () => {
    setShowSuccess(true)
    onAddToCart()
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    onWishlist()
  }

  return (
    <div className="space-y-4">
      {/* Total Price Display */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <span className="text-sm text-muted-foreground">Total Price</span>
        <span className="text-xl font-bold text-primary">
          {formatPrice(totalPrice)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        <Button
          size="lg"
          className={cn(
            'w-full h-12 text-base font-semibold',
            'transition-all duration-300',
            showSuccess && 'bg-green-500 hover:bg-green-600'
          )}
          onClick={handleAddToCart}
        >
          {showSuccess ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </>
          )}
        </Button>

        {/* Buy Now Button */}
        <Button
          size="lg"
          variant="secondary"
          className="w-full h-12 text-base font-semibold"
          onClick={onBuyNow}
        >
          Buy Now
        </Button>

        {/* Wishlist and Share Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              'flex-1 h-12',
              isWishlisted && 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            )}
            onClick={handleWishlist}
          >
            <Heart
              className={cn(
                'w-5 h-5 mr-2',
                isWishlisted && 'fill-current'
              )}
            />
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-12"
            onClick={onShare}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="text-sm text-muted-foreground text-center">
        {quantity > 1 && (
          <p>
            {formatPrice(price)} × {quantity} items = {formatPrice(totalPrice)}
          </p>
        )}
      </div>
    </div>
  )
}
