'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App boundary caught error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex justify-center pt-4">
          <Button onClick={() => reset()} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
