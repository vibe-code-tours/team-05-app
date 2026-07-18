'use client'

import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

const returnableItems = [
  'Items in original, unused condition',
  'Items with original tags and packaging',
  'Items received within the last 7 days',
  'Items that are defective or damaged on arrival',
]

const nonReturnableItems = [
  'Custom or personalized items',
  'Perishable goods (food, cosmetics opened)',
  'Intimate or hygiene products',
  'Items damaged by customer misuse',
  'Items without original packaging or tags',
]

export default function ReturnsPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Returns & Refunds</h1>
          <p className="text-lg text-muted-foreground">
            Our return policy ensures a hassle-free experience.
          </p>
        </div>

        {/* Policy Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Return Policy</h2>
            <p className="text-muted-foreground mb-4">
              We want you to be completely satisfied with your purchase. If you&apos;re not
              happy with your order, you can request a return within <strong>7 days</strong> of
              delivery for a full refund or exchange.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Clock className="h-4 w-4" />
              <span>Return window: 7 days from delivery date</span>
            </div>
          </CardContent>
        </Card>

        {/* Returnable Items */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              What Can Be Returned
            </h2>
            <ul className="space-y-3">
              {returnableItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Non-Returnable Items */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              What Cannot Be Returned
            </h2>
            <ul className="space-y-3">
              {nonReturnableItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* How to Return */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">How to Return an Item</h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Go to Your Orders</p>
                  <p className="text-sm text-muted-foreground">Find the order containing the item you want to return.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">Select Return Item</p>
                  <p className="text-sm text-muted-foreground">Choose the item and select a reason for return.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium">Ship or Drop Off</p>
                  <p className="text-sm text-muted-foreground">Use our prepaid return label or drop off at a partner location.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  4
                </span>
                <div>
                  <p className="font-medium">Get Your Refund</p>
                  <p className="text-sm text-muted-foreground">Refund processed within 5-7 business days after we receive the item.</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our support team at{' '}
                  <a href="mailto:support@crossmart.com" className="text-primary hover:underline">
                    support@crossmart.com
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+959123456789" className="text-primary hover:underline">
                    +95 9 123 456 789
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
