'use client'

import { CreditCard, Building2, Smartphone, Banknote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type PaymentMethodType = 'bank_transfer' | 'mobile_banking' | 'cash_on_delivery'

export interface PaymentOption {
  id: PaymentMethodType
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Transfer directly to our bank account. Upload payment slip after ordering.',
    icon: <Building2 className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'mobile_banking',
    name: 'Mobile Banking',
    description: 'Pay via KBZ Pay or Wave Money. Fast and secure.',
    icon: <Smartphone className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order. Available in select areas.',
    icon: <Banknote className="h-6 w-6" />,
    available: true,
  },
]

interface PaymentMethodProps {
  selectedMethod: PaymentMethodType | null
  onSelect: (method: PaymentMethodType) => void
}

export function PaymentMethod({ selectedMethod, onSelect }: PaymentMethodProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Payment Method</h3>
          </div>

          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => option.available && onSelect(option.id)}
                className={cn(
                  'relative border-2 rounded-lg p-4 cursor-pointer transition-all',
                  selectedMethod === option.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300',
                  !option.available && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                      selectedMethod === option.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium cursor-pointer">
                        {option.name}
                      </Label>
                      {!option.available && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selectedMethod === option.id
                        ? 'border-blue-600'
                        : 'border-gray-300'
                    )}
                  >
                    {selectedMethod === option.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
