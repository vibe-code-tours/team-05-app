'use client'

import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Shield, Heart, Truck } from 'lucide-react'

const values = [
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'Every transaction is protected. We verify sellers and secure payments.',
  },
  {
    icon: Globe,
    title: 'Cross-Border Access',
    description: 'Shop directly from Thailand and get products delivered to Myanmar.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Dedicated support team ready to help with any order or inquiry.',
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    description: 'Track your cargo from Bangkok warehouse to your doorstep in Myanmar.',
  },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About CrossMart</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Myanmar&apos;s most trusted cross-border marketplace, connecting buyers
            with quality products from Thailand.
          </p>
        </div>

        {/* Story */}
        <div className="prose prose-lg max-w-3xl mx-auto mb-16">
          <h2>Our Story</h2>
          <p>
            CrossMart was founded with a simple mission: make cross-border shopping
            accessible, affordable, and trustworthy for everyone in Myanmar. We noticed
            that many Myanmar consumers wanted access to quality Thai products but faced
            barriers in language, logistics, and payment.
          </p>
          <p>
            Our platform bridges that gap by providing a seamless marketplace where
            local sellers can list products sourced from Thailand, with transparent
            pricing, secure payments, and reliable cargo tracking from Bangkok to
            Yangon.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 text-center">
                  <value.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-muted rounded-lg p-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-muted-foreground">Products Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5K+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground">Verified Sellers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">99%</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
