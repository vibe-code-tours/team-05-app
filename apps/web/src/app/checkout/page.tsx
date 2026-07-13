'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight, ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useCartStore } from '@/stores/cart.store'
import { AddressForm, type AddressData } from '@/components/checkout/address-form'
import { PaymentMethod, type PaymentMethodType } from '@/components/checkout/payment-method'
import { OrderReview } from '@/components/checkout/order-review'
import { PaymentSlipUpload } from '@/components/checkout/payment-slip-upload'
import { formatPrice } from '@/lib/utils'
import { useCreateOrder } from '@/lib/services/order.service'

type CheckoutStep = 'address' | 'payment' | 'review'

const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  { id: 'address', label: 'Address', icon: <MapPin className="h-5 w-5" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'review', label: 'Review', icon: <CheckCircle className="h-5 w-5" /> },
]

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const getShipping = useCartStore((state) => state.getShipping)
  const getTax = useCartStore((state) => state.getTax)
  const getTotal = useCartStore((state) => state.getTotal)
  const clearCart = useCartStore((state) => state.clearCart)
  const createOrderMutation = useCreateOrder()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address')
  const [address, setAddress] = useState<AddressData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null)
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)

  const isPlacingOrder = createOrderMutation.isPending

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const tax = getTax()
  const total = getTotal()

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleNextStep = () => {
    if (currentStep === 'address') {
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      setCurrentStep('review')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('address')
    } else if (currentStep === 'review') {
      setCurrentStep('payment')
    }
  }

  const handleAddressSubmit = (addressData: AddressData) => {
    setAddress(addressData)
    handleNextStep()
  }

  const handlePaymentSelect = (method: PaymentMethodType) => {
    setPaymentMethod(method)
  }

  const handlePlaceOrder = async () => {
    if (!address || !paymentMethod) return

    try {
      // For now, we'll pass the address data directly
      // In a real app, you'd first create/save the address, then use its ID
      await createOrderMutation.mutateAsync({
        shippingAddressId: 'temp-address-id', // This would be the actual address ID
        note: `Payment method: ${paymentMethod}`,
      })

      // Clear cart and redirect to confirmation
      clearCart()
      router.push('/order-confirmation')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = index < currentStepIndex

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted ? 'bg-green-500 text-white' : ''}
                          ${isActive ? 'bg-blue-600 text-white' : ''}
                          ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span
                        className={`
                          text-sm mt-2 font-medium
                          ${isActive ? 'text-blue-600' : ''}
                          ${isCompleted ? 'text-green-600' : ''}
                          ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                        `}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`
                          flex-1 h-1 mx-4 rounded
                          ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                        `}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Address Step */}
              {currentStep === 'address' && (
                <div className="space-y-4">
                  <AddressForm
                    onSubmit={handleAddressSubmit}
                    defaultValues={address || undefined}
                  />
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="space-y-4">
                  <PaymentMethod
                    selectedMethod={paymentMethod}
                    onSelect={handlePaymentSelect}
                  />

                  {/* Show payment slip upload for bank transfer */}
                  {paymentMethod === 'bank_transfer' && (
                    <PaymentSlipUpload
                      onUpload={setPaymentSlip}
                      uploadedSlip={paymentSlip}
                    />
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!paymentMethod}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Review Order
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && address && paymentMethod && (
                <div className="space-y-4">
                  <OrderReview
                    items={items}
                    address={address}
                    paymentMethod={paymentMethod}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    total={total}
                    onPlaceOrder={handlePlaceOrder}
                    isPlacingOrder={isPlacingOrder}
                  />

                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Payment
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items Preview */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">
                          {shipping === 0 ? (
                            <Badge variant="success" className="text-xs">Free</Badge>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span className="text-gray-900">{formatPrice(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-blue-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
