'use client'

import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Truck, Package, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

const shippingMethods = [
  {
    name: 'Standard Cargo',
    time: '10-21 business days',
    price: 'Calculated at checkout',
    description: 'Cross-border cargo from Bangkok to Myanmar via ground and air freight.',
  },
  {
    name: 'Local Delivery',
    time: '3-7 business days',
    price: 'Calculated at checkout',
    description: 'For in-stock items already in our Myanmar warehouse.',
  },
]

const cargoStages = [
  { icon: CheckCircle, label: 'Order Placed', description: 'Your order is confirmed' },
  { icon: CheckCircle, label: 'Payment Confirmed', description: 'Payment verified' },
  { icon: Package, label: 'Purchased', description: 'Item purchased from supplier in Thailand' },
  { icon: Package, label: 'Packed', description: 'Item packed at Bangkok warehouse' },
  { icon: MapPin, label: 'BKK Warehouse', description: 'Arrived at Bangkok warehouse' },
  { icon: Truck, label: 'Export Clearance', description: 'Customs clearance in Thailand' },
  { icon: Truck, label: 'Air Cargo', description: 'In transit via air freight' },
  { icon: AlertCircle, label: 'Customs', description: 'Customs clearance in Myanmar' },
  { icon: MapPin, label: 'YGN Warehouse', description: 'Arrived at Yangon warehouse' },
  { icon: Truck, label: 'Out for Delivery', description: 'On the way to you' },
  { icon: CheckCircle, label: 'Delivered', description: 'Package delivered' },
]

export default function ShippingPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Shipping Information</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about our cross-border shipping from Thailand to Myanmar.
          </p>
        </div>

        {/* Shipping Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Shipping Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingMethods.map((method) => (
              <Card key={method.name}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Truck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">{method.name}</h3>
                      <p className="text-sm text-primary font-medium mb-2">{method.time}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cargo Milestones */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Cargo Tracking Milestones</h2>
          <p className="text-muted-foreground mb-6">
            Track your cross-border shipment through each stage of the journey.
          </p>
          <div className="space-y-3">
            {cargoStages.map((stage, index) => (
              <div key={stage.label} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <stage.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{stage.label}</p>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Important Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Delivery times are estimates and may vary due to customs or weather.</li>
              <li>• Cross-border shipments may be subject to import duties and taxes.</li>
              <li>• Track your order in real-time via the Track Order page.</li>
              <li>• Contact support if your shipment is delayed beyond the estimated time.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
