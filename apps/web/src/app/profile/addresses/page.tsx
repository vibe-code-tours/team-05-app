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
import { Skeleton } from '@/components/ui/skeleton'
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
import { toast } from '@/components/ui/use-toast'
import { ProtectedRoute } from '@/components/auth/protected-route'
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/lib/services/user.service'

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

interface AddressUI {
  id: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  label?: string
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

/** Map API address response to the richer UI shape */
function apiToUI(addr: {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}): AddressUI {
  return {
    id: addr.id,
    recipientName: addr.name,
    phone: addr.phone,
    addressLine1: addr.address,
    addressLine2: undefined,
    city: addr.city,
    state: addr.state,
    postalCode: addr.zipCode,
    country: 'Myanmar',
    isDefault: addr.isDefault,
    label: undefined,
  }
}

/** Map UI form data to API input shape */
function formToAPI(form: AddressFormData) {
  return {
    name: form.recipientName.trim(),
    phone: form.phone.trim(),
    address: form.addressLine1.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zipCode: form.postalCode.trim(),
  }
}

function getAddressIcon(label?: string) {
  if (label === 'Home') return <Home className="h-4 w-4" />
  if (label === 'Office') return <Building2 className="h-4 w-4" />
  return <MapPin className="h-4 w-4" />
}

function formatFullAddress(addr: AddressUI): string {
  const parts = [addr.addressLine1]
  if (addr.addressLine2) parts.push(addr.addressLine2)
  parts.push(`${addr.city}, ${addr.state} ${addr.postalCode}`)
  parts.push(addr.country)
  return parts.join('\n')
}

function AddressesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Separator />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-18" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AddressesPage() {
  const { data: addressesResponse, isLoading } = useAddresses()
  const createAddressMutation = useCreateAddress()
  const updateAddressMutation = useUpdateAddress()
  const deleteAddressMutation = useDeleteAddress()
  const setDefaultMutation = useSetDefaultAddress()

  const addresses: AddressUI[] = addressesResponse?.data ? addressesResponse.data.map(apiToUI) : []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressUI | null>(null)
  const [form, setForm] = useState<AddressFormData>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAddNew = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      toast({
        title: 'Address limit reached',
        description: `You can save a maximum of ${MAX_ADDRESSES} addresses. Delete an existing one to add a new address.`,
        variant: 'destructive',
      })
      return
    }
    setEditingAddress(null)
    setForm(emptyForm)
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (address: AddressUI) => {
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
    setDeletingId(addressId)
  }

  const confirmDelete = () => {
    if (!deletingId) return

    deleteAddressMutation.mutate(deletingId, {
      onSuccess: () => {
        toast({
          title: 'Address deleted',
          description: 'The address has been removed.',
        })
        setDeletingId(null)
      },
      onError: () => {
        toast({
          title: 'Delete failed',
          description: 'Could not delete the address. Please try again.',
          variant: 'destructive',
        })
        setDeletingId(null)
      },
    })
  }

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId, {
      onSuccess: () => {
        toast({
          title: 'Default address updated',
          description: 'Your default shipping address has been changed.',
        })
      },
      onError: () => {
        toast({
          title: 'Update failed',
          description: 'Could not set default address. Please try again.',
          variant: 'destructive',
        })
      },
    })
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

    const apiData = formToAPI(form)

    if (editingAddress) {
      updateAddressMutation.mutate(
        { id: editingAddress.id, data: apiData },
        {
          onSuccess: () => {
            toast({
              title: 'Address updated',
              description: 'Your address has been saved.',
            })
            closeDialog()
          },
          onError: () => {
            toast({
              title: 'Update failed',
              description: 'Could not save the address. Please try again.',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      createAddressMutation.mutate(apiData, {
        onSuccess: () => {
          toast({
            title: 'Address added',
            description: 'Your new address has been saved.',
          })
          closeDialog()
        },
        onError: () => {
          toast({
            title: 'Add failed',
            description: 'Could not save the address. Please try again.',
            variant: 'destructive',
          })
        },
      })
    }
  }

  const closeDialog = () => {
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

  const isMutating = createAddressMutation.isPending || updateAddressMutation.isPending
  const isDeleting = deleteAddressMutation.isPending

  return (
    <ProtectedRoute>
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
          <Button onClick={handleAddNew} disabled={addresses.length >= MAX_ADDRESSES || isLoading}>
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

        {/* Loading State */}
        {isLoading ? (
          <AddressesLoadingSkeleton />
        ) : addresses.length === 0 ? (
          /* Empty State */
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
          /* Address Cards Grid */
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
                        disabled={setDefaultMutation.isPending}
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
                      disabled={isDeleting}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={closeDialog}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isMutating}>
              {isMutating
                ? 'Saving...'
                : editingAddress
                  ? 'Save Changes'
                  : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  )
}
