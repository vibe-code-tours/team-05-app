'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global boundary caught error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">Something went completely wrong!</h2>
            <p className="text-muted-foreground">
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
