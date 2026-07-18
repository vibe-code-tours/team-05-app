'use client'

import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, Banknote, Shield, Smartphone } from 'lucide-react'

const paymentMethods = [
  {
    icon: Smartphone,
    name: 'KBZ Pay',
    description: 'Pay instantly with your KBZ Pay wallet. Fast and secure.',
    badge: 'Popular',
  },
  {
    icon: Smartphone,
    name: 'Wave Money',
    description: 'Transfer via Wave Money for quick mobile payments.',
    badge: 'Popular',
  },
  {
    icon: CreditCard,
    name: 'Bank Transfer',
    description: 'Transfer directly from KBZ, CB, or AYA bank accounts.',
    badge: null,
  },
  {
    icon: Banknote,
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives. Available for eligible orders.',
    badge: 'COD',
  },
]

export default function PaymentMethodsPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Payment Methods</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We offer multiple secure payment options for your convenience.
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {paymentMethods.map((method) => (
            <Card key={method.name}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      {method.badge && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Secure Payments</p>
                <p className="text-sm text-muted-foreground">
                  All transactions are encrypted and processed through secure payment
                  gateways. We never store your payment credentials on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
