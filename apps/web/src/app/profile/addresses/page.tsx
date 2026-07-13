'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Trash2, Edit, Star, Home, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { cn } from '@/lib/utils'
import { MOCK_ADDRESSES } from '@/lib/mock-addresses'
import { Address } from '@/types/address'

const MAX_ADDRESSES = 5

interface AddressFormData {
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const emptyForm: AddressFormData = {
  label: '',
  recipientName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Myanmar',
}

function getAddressIcon(label?: string) {
  if (label === 'Home') return <Home className="h-4 w-4" />
  if (label === 'Office') return <Building2 className="h-4 w-4" />
  return <MapPin className="h-4 w-4" />
}

function formatFullAddress(addr: Address): string {
  const parts = [addr.addressLine1]
  if (addr.addressLine2) parts.push(addr.addressLine2)
  parts.push(`${addr.city}, ${addr.state} ${addr.postalCode}`)
  parts.push(addr.country)
  return parts.join('\n')
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [form, setForm] = useState<AddressFormData>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})

  const handleAddNew = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      alert(`You can save a maximum of ${MAX_ADDRESSES} addresses.`)
      return
    }
    setEditingAddress(null)
    setForm(emptyForm)
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setForm({
      label: address.label || '',
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleDelete = (addressId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this address?')
    if (!confirmed) return

    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== addressId)
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true
      }
      return remaining
    })
  }

  const handleSetDefault = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }))
    )
  }

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {}
    if (!form.label.trim()) errors.label = true
    if (!form.recipientName.trim()) errors.recipientName = true
    if (!form.phone.trim()) errors.phone = true
    if (!form.addressLine1.trim()) errors.addressLine1 = true
    if (!form.city.trim()) errors.city = true
    if (!form.postalCode.trim()) errors.postalCode = true

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddress.id
            ? {
                ...a,
                label: form.label.trim() || undefined,
                recipientName: form.recipientName.trim(),
                phone: form.phone.trim(),
                addressLine1: form.addressLine1.trim(),
                addressLine2: form.addressLine2.trim() || undefined,
                city: form.city.trim(),
                state: form.state.trim(),
                postalCode: form.postalCode.trim(),
                country: form.country.trim(),
              }
            : a
        )
      )
    } else {
      const isFirst = addresses.length === 0
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        label: form.label.trim() || undefined,
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        isDefault: isFirst,
      }
      setAddresses((prev) => [...prev, newAddress])
    }

    setDialogOpen(false)
    setForm(emptyForm)
    setEditingAddress(null)
    setFormErrors({})
  }

  const updateField = (field: keyof AddressFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Address Management</h1>
          </div>
          <Button onClick={handleAddNew} disabled={addresses.length >= MAX_ADDRESSES}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>

        {/* Address Limit Warning */}
        {addresses.length >= MAX_ADDRESSES && (
          <div className="mb-6 rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
            You have reached the maximum of {MAX_ADDRESSES} addresses. Delete an existing address to add a new one.
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No addresses saved</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                Add a shipping address so we know where to deliver your orders.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={cn(
                  'relative transition-shadow hover:shadow-md',
                  address.isDefault && 'ring-2 ring-primary'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{address.recipientName}</CardTitle>
                      {address.isDefault && (
                        <Badge variant="default" className="text-[10px] gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      {getAddressIcon(address.label)}
                      {address.label || 'Address'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Phone */}
                  <p className="text-sm text-muted-foreground">{address.phone}</p>

                  {/* Full Address */}
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {formatFullAddress(address)}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Add / Edit Address Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setForm(emptyForm)
            setEditingAddress(null)
            setFormErrors({})
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="e.g. Home, Office"
                value={form.label}
                onChange={(e) => updateField('label', e.target.value)}
                className={cn(formErrors.label && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="recipientName">
                Recipient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipientName"
                placeholder="Full name"
                value={form.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value)}
                className={cn(formErrors.recipientName && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+95 9 XXXX XXXXX"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={cn(formErrors.phone && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Country"
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addressLine1">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addressLine1"
                placeholder="Street address"
                value={form.addressLine1}
                onChange={(e) => updateField('addressLine1', e.target.value)}
                className={cn(formErrors.addressLine1 && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Apartment, suite, floor (optional)"
                value={form.addressLine2}
                onChange={(e) => updateField('addressLine2', e.target.value)}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="City"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={cn(formErrors.city && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            {/* State / Region */}
            <div className="space-y-2">
              <Label htmlFor="state">State / Region</Label>
              <Input
                id="state"
                placeholder="State or region"
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postalCode"
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                className={cn(formErrors.postalCode && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setForm(emptyForm)
                setEditingAddress(null)
                setFormErrors({})
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAddress ? 'Save Changes' : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
