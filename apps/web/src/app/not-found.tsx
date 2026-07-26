import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/public-layout'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground mb-2">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">404</h2>
          <p className="text-xl font-semibold text-foreground">Page not found</p>
          <p className="text-muted-foreground">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button variant="default">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
