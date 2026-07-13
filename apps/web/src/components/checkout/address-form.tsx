'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

export interface AddressData {
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
}

interface AddressFormProps {
  onSubmit: (address: AddressData) => void
  defaultValues?: Partial<AddressData>
}

interface ValidationErrors {
  recipientName?: string
  phone?: string
  addressLine1?: string
  city?: string
  state?: string
  postalCode?: string
}

export function AddressForm({ onSubmit, defaultValues }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressData>({
    recipientName: defaultValues?.recipientName || '',
    phone: defaultValues?.phone || '',
    addressLine1: defaultValues?.addressLine1 || '',
    addressLine2: defaultValues?.addressLine2 || '',
    city: defaultValues?.city || '',
    state: defaultValues?.state || '',
    postalCode: defaultValues?.postalCode || '',
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Region is required'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof AddressData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name *</Label>
            <Input
              id="recipientName"
              placeholder="Full name"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              className={errors.recipientName ? 'border-red-500' : ''}
            />
            {errors.recipientName && (
              <p className="text-sm text-red-500">{errors.recipientName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 09-123456789"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              placeholder="Street address, building number"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className={errors.addressLine1 ? 'border-red-500' : ''}
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-500">{errors.addressLine1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              placeholder="Apartment, suite, unit, floor (optional)"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Region *</Label>
              <Input
                id="state"
                placeholder="State or Region"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              placeholder="Postal code"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`w-full max-w-[200px] ${errors.postalCode ? 'border-red-500' : ''}`}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-500">{errors.postalCode}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Save Address
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
