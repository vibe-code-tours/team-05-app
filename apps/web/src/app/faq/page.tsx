'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqSections = [
  {
    title: 'Orders & Payment',
    items: [
      {
        question: 'How do I place an order?',
        answer: 'Browse products, add items to your cart, and proceed to checkout. You can pay via KBZ Pay, Wave Money, bank transfer, or cash on delivery.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept KBZ Pay, Wave Money, bank transfers (KBZ, CB, AYA), and cash on delivery (COD) for eligible orders.',
      },
      {
        question: 'Can I cancel my order?',
        answer: 'You can cancel your order within 2 hours of placing it. After that, the order enters processing and cannot be cancelled through the app. Contact support for assistance.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 7-14 business days. Cross-border cargo from Thailand typically takes 10-21 days depending on the milestone stage.',
      },
      {
        question: 'How do I track my order?',
        answer: 'Go to Track Order in the footer or your Orders page. Enter your order number to see real-time cargo milestones from Bangkok warehouse to your door.',
      },
      {
        question: 'Do you ship to all states in Myanmar?',
        answer: 'We currently deliver to Yangon, Mandalay, Nay Pyi Taw, and major cities. Remote areas may have additional delivery time.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        question: 'What is your return policy?',
        answer: 'You can request a return within 7 days of delivery for items in original condition. Custom or perishable items are non-returnable.',
      },
      {
        question: 'How do I get a refund?',
        answer: 'Once your return is approved, refunds are processed to your original payment method within 5-7 business days.',
      },
      {
        question: 'What if my item arrives damaged?',
        answer: 'Contact us within 48 hours with photos of the damage. We\'ll arrange a replacement or full refund.',
      },
    ],
  },
  {
    title: 'Account & Seller',
    items: [
      {
        question: 'How do I become a seller?',
        answer: 'Click "Sell on CrossMart" and complete the seller application. Admin will review and approve your account within 3 business days.',
      },
      {
        question: 'How do I track cargo milestones as a seller?',
        answer: 'Go to your Seller Dashboard > Cargo. Update milestones as your shipment progresses from purchase to delivery.',
      },
    ],
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="font-medium pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-muted-foreground">{answer}</p>
      </div>
    </div>
  )
}

export default function FaqPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about CrossMart.
          </p>
        </div>

        <div className="space-y-8">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="bg-card rounded-lg border p-4">
                {section.items.map((item) => (
                  <FaqItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
