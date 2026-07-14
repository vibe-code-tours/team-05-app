'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Plus,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PublicLayout } from '@/components/layout/public-layout'
import { AddressForm, type AddressData } from '@/components/checkout/address-form'
import { PaymentMethod, type PaymentMethodType } from '@/components/checkout/payment-method'
import { OrderReview } from '@/components/checkout/order-review'
import { PaymentSlipUpload } from '@/components/checkout/payment-slip-upload'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/lib/services/cart.service'
import { useCreateOrder } from '@/lib/services/order.service'
import {
  useAddresses,
  useCreateAddress,
  type Address,
} from '@/lib/services/user.service'
import { toast } from '@/components/ui/use-toast'
import type { CartItemView } from '@/types/cart'

type CheckoutStep = 'address' | 'payment' | 'review'

const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  { id: 'address', label: 'Address', icon: <MapPin className="h-5 w-5" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'review', label: 'Review', icon: <CheckCircle className="h-5 w-5" /> },
]

/** Map an API Address to the AddressData shape used by OrderReview. */
function apiAddressToAddressData(addr: Address): AddressData {
  return {
    recipientName: addr.name,
    phone: addr.phone,
    addressLine1: addr.address,
    addressLine2: '',
    city: addr.city,
    state: addr.state,
    postalCode: addr.zipCode,
  }
}

/** Format an Address into a single-line display string. */
function formatAddressLine(addr: Address): string {
  const parts = [addr.address, addr.city, addr.state, addr.zipCode].filter(Boolean)
  return parts.join(', ')
}

export default function CheckoutPage() {
  const router = useRouter()

  // --- API hooks ---
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: addressesResponse, isLoading: addressesLoading } = useAddresses()
  const addresses = addressesResponse?.data ?? []
  const createAddressMutation = useCreateAddress()
  const createOrderMutation = useCreateOrder()

  // --- Local state ---
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null)
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)

  const isPlacingOrder = createOrderMutation.isPending

  // Auto-select the default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      }
    }
  }, [addresses, selectedAddressId])

  // Redirect to cart if cart is empty (skip while loading)
  const cartItems = cart?.data?.items ?? []
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.push('/cart')
    }
  }, [cartLoading, cartItems.length, router])

  // --- Derived data ---
  const viewItems: CartItemView[] = useMemo(() => {
    return cartItems.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0] ?? '/placeholder.png',
      quantity: item.quantity,
      stock: item.product.stock,
      seller: '',
    }))
  }, [cartItems])

  const subtotal = cart?.data?.subtotal ?? 0
  const shipping = 0 // Free shipping for now
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax

  // Resolve the selected Address object
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null

  // AddressData for OrderReview (derived from selected API address)
  const addressForReview: AddressData | null = selectedAddress
    ? apiAddressToAddressData(selectedAddress)
    : null

  const canProceedFromAddress = selectedAddressId !== null || addressForReview !== null
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  // --- Step navigation ---
  const handleNextStep = () => {
    if (currentStep === 'address') setCurrentStep('payment')
    else if (currentStep === 'payment') setCurrentStep('review')
  }

  const handlePrevStep = () => {
    if (currentStep === 'payment') setCurrentStep('address')
    else if (currentStep === 'review') setCurrentStep('payment')
  }

  // --- Address selection ---
  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id)
    setShowNewAddressForm(false)
  }

  const handleUseNewAddress = () => {
    setShowNewAddressForm(true)
    setSelectedAddressId(null)
  }

  /** Called when user submits the new-address form.
   *  Creates the address via API, then selects the returned address. */
  const handleNewAddressSubmit = async (addressData: AddressData) => {
    try {
      const createdResponse = await createAddressMutation.mutateAsync({
        name: addressData.recipientName,
        phone: addressData.phone,
        address: addressData.addressLine1,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.postalCode,
        isDefault: addresses.length === 0, // first address becomes default
      })
      setSelectedAddressId(createdResponse.data.id)
      setShowNewAddressForm(false)
      toast({ title: 'Address saved', description: 'Your delivery address has been saved.' })
      handleNextStep()
    } catch {
      toast({
        title: 'Failed to save address',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  /** Called when user picks an existing address and clicks "Continue". */
  const handleAddressContinue = () => {
    if (selectedAddressId) {
      handleNextStep()
    }
  }

  // --- Payment ---
  const handlePaymentSelect = (method: PaymentMethodType) => {
    setPaymentMethod(method)
  }

  // --- Place order ---
  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !paymentMethod) return

    try {
      const orderResponse = await createOrderMutation.mutateAsync({
        shippingAddressId: selectedAddressId,
        note: `Payment method: ${paymentMethod}`,
      })

      toast({ title: 'Order placed!', description: 'Your order has been confirmed.' })
      router.push(`/order-confirmation?orderId=${orderResponse.data.id}`)
    } catch {
      toast({
        title: 'Failed to place order',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  // --- Guard: still loading or empty cart ---
  if (cartLoading) {
    return (
      <PublicLayout>
        <div className="bg-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <PublicLayout>
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
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
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          isCompleted && 'bg-green-500 text-white',
                          isActive && 'bg-primary text-primary-foreground',
                          !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm mt-2 font-medium',
                          isActive && 'text-primary',
                          isCompleted && 'text-green-600',
                          !isActive && !isCompleted && 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-1 mx-4 rounded',
                          index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                        )}
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {addressesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          {/* Saved addresses */}
                          {addresses.length > 0 && !showNewAddressForm && (
                            <div className="space-y-3">
                              {addresses.map((addr) => (
                                <div
                                  key={addr.id}
                                  onClick={() => handleSelectAddress(addr.id)}
                                  className={cn(
                                    'border-2 rounded-lg p-4 cursor-pointer transition-all',
                                    selectedAddressId === addr.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-muted-foreground/50'
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={cn(
                                        'flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center',
                                        selectedAddressId === addr.id
                                          ? 'border-primary'
                                          : 'border-muted-foreground/40'
                                      )}
                                    >
                                      {selectedAddressId === addr.id && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">{addr.name}</p>
                                        {addr.isDefault && (
                                          <Badge variant="secondary" className="text-xs">
                                            Default
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">{addr.phone}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatAddressLine(addr)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                onClick={handleUseNewAddress}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Use a different address
                              </Button>
                            </div>
                          )}

                          {/* No saved addresses or user chose "new" */}
                          {(addresses.length === 0 || showNewAddressForm) && (
                            <AddressForm
                              onSubmit={handleNewAddressSubmit}
                              defaultValues={
                                selectedAddress ? apiAddressToAddressData(selectedAddress) : undefined
                              }
                            />
                          )}

                          {/* Continue button when an existing address is selected */}
                          {selectedAddressId && !showNewAddressForm && (
                            <Button
                              onClick={handleAddressContinue}
                              className="w-full"
                            >
                              Continue to Payment
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="space-y-4">
                  <PaymentMethod
                    selectedMethod={paymentMethod}
                    onSelect={handlePaymentSelect}
                  />

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
                      className="flex-1"
                    >
                      Review Order
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && addressForReview && paymentMethod && (
                <div className="space-y-4">
                  <OrderReview
                    items={viewItems}
                    address={addressForReview}
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
                      {viewItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">
                          {shipping === 0 ? (
                            <Badge variant="success" className="text-xs">
                              Free
                            </Badge>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
