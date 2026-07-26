'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/public-layout'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Products boundary caught error:', error)
  }, [error])

  return (
    <PublicLayout>
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Failed to load products</h2>
          <p className="text-muted-foreground">
            We encountered a problem while trying to display products.
          </p>
          <div className="flex justify-center pt-4">
            <Button onClick={() => reset()} variant="default">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
