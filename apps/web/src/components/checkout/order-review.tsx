'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, MapPin, CreditCard, Banknote, Building2, Smartphone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CartItemView } from '@/types/cart'
import type { AddressData } from './address-form'
import type { PaymentMethodType } from './payment-method'

interface OrderReviewProps {
  items: CartItemView[]
  address: AddressData
  paymentMethod: PaymentMethodType
  subtotal: number
  shipping: number
  tax: number
  total: number
  onPlaceOrder: () => void
  isPlacingOrder: boolean
}

const paymentMethodLabels: Record<PaymentMethodType, string> = {
  bank_transfer: 'Bank Transfer',
  mobile_banking: 'Mobile Banking',
  cash_on_delivery: 'Cash on Delivery',
}

const paymentMethodIcons: Record<PaymentMethodType, React.ReactNode> = {
  bank_transfer: <Building2 className="h-5 w-5" />,
  mobile_banking: <Smartphone className="h-5 w-5" />,
  cash_on_delivery: <Banknote className="h-5 w-5" />,
}

export function OrderReview({
  items,
  address,
  paymentMethod,
  subtotal,
  shipping,
  tax,
  total,
  onPlaceOrder,
  isPlacingOrder,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {item.name}
                  </h4>
                  {item.variant && (
                    <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.price)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p className="font-medium text-foreground">{address.recipientName}</p>
            <p className="text-muted-foreground">{address.phone}</p>
            <p className="text-muted-foreground">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
            </p>
            <p className="text-muted-foreground">
              {address.city}, {address.state} {address.postalCode}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {paymentMethodIcons[paymentMethod]}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {paymentMethodLabels[paymentMethod]}
              </p>
              {paymentMethod === 'bank_transfer' && (
                <p className="text-sm text-muted-foreground">
                  Upload payment slip after placing order
                </p>
              )}
              {paymentMethod === 'mobile_banking' && (
                <p className="text-sm text-muted-foreground">
                  KBZ Pay or Wave Money
                </p>
              )}
              {paymentMethod === 'cash_on_delivery' && (
                <p className="text-sm text-muted-foreground">
                  Pay when you receive your order
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {shipping === 0 ? (
                  <Badge variant="success" className="text-xs">Free</Badge>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span className="text-foreground">{formatPrice(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isPlacingOrder ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Placing Order...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Place Order
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
