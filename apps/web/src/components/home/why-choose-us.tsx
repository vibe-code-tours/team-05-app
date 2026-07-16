'use client';

import { Truck, ShieldCheck, CreditCard, Headphones, RotateCcw, Zap } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Fast Cross-Border Delivery',
    description: 'From Bangkok to your doorstep in 7-14 days with real-time tracking.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Buyer Protection',
    description: 'Shop with confidence with our 100% money-back guarantee.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Secure Payments',
    description: 'Multiple payment options with encrypted transactions.',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: '24/7 Customer Support',
    description: 'Our team is always here to help via chat, phone, or email.',
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: 'Easy Returns',
    description: '7-day hassle-free returns on most items.',
    color: 'bg-rose-500/10 text-rose-500',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Flash Deals',
    description: 'Daily exclusive offers and discounts up to 50% off.',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span>Why CrossMart</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose CrossMart?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to providing the best shopping experience for our customers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/10">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Ready to start shopping?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join thousands of satisfied customers and discover amazing products from Thailand and beyond.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Create Free Account
            </a>
            <a
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-background border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Browse Products
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
