'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Truck, CheckCircle } from 'lucide-react'

const mockTracking = {
  orderNumber: 'CM-2024-001',
  status: 'AIR_CARGO',
  estimatedArrival: '2024-02-15',
  history: [
    { milestone: 'ORDER_PLACED', date: '2024-01-20', location: 'Yangon, Myanmar' },
    { milestone: 'PAYMENT_CONFIRMED', date: '2024-01-20', location: 'Yangon, Myanmar' },
    { milestone: 'PURCHASED', date: '2024-01-22', location: 'Bangkok, Thailand' },
    { milestone: 'PACKED', date: '2024-01-24', location: 'Bangkok, Thailand' },
    { milestone: 'BKK_WAREHOUSE', date: '2024-01-25', location: 'Bangkok, Thailand' },
    { milestone: 'EXPORT_CLEARANCE', date: '2024-01-27', location: 'Bangkok, Thailand' },
    { milestone: 'AIR_CARGO', date: '2024-01-28', location: 'In Transit' },
  ],
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [tracking, setTracking] = useState<typeof mockTracking | null>(null)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderNumber) {
      setTracking(mockTracking)
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
          <p className="text-lg text-muted-foreground">
            Enter your order number to see real-time cargo tracking updates.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleTrack} className="flex gap-3">
              <Input
                placeholder="Enter order number (e.g., CM-2024-001)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {tracking && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{tracking.orderNumber}</h2>
                  <p className="text-sm text-muted-foreground">
                    Estimated arrival: {tracking.estimatedArrival}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{tracking.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                {tracking.history.map((item, index) => (
                  <div key={item.milestone} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {index === tracking.history.length - 1 ? (
                        <Truck className="h-4 w-4 text-primary" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.milestone.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  )
}
