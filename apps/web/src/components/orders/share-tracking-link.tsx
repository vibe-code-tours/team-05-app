'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Share2, Check, Link2 } from 'lucide-react';

interface ShareTrackingLinkProps {
  orderNumber: string;
  trackingNumber: string;
}

export function ShareTrackingLink({
  orderNumber,
  trackingNumber,
}: ShareTrackingLinkProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const trackingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/orders/${orderNumber}/tracking`
      : '';

  const handleCopy = useCallback(async () => {
    if (!trackingUrl) return;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Tracking link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  }, [trackingUrl, toast]);

  const handleShare = useCallback(async () => {
    if (!trackingUrl) return;

    if (!navigator.share) {
      // Fallback: copy to clipboard
      await handleCopy();
      return;
    }

    setSharing(true);
    try {
      await navigator.share({
        title: `Track Order ${orderNumber}`,
        text: `Track your shipment with tracking number: ${trackingNumber}`,
        url: trackingUrl,
      });
    } catch (err) {
      // User cancelled the share - this is not an error
      if ((err as Error).name !== 'AbortError') {
        toast({
          title: 'Share failed',
          description: 'Could not share the link. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setSharing(false);
    }
  }, [trackingUrl, orderNumber, trackingNumber, handleCopy, toast]);

  return (
    <div className="w-full rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Share Tracking Link</span>
      </div>

      {/* Read-only input with tracking URL */}
      <div className="flex gap-2">
        <Input
          readOnly
          value={trackingUrl}
          className="flex-1 bg-muted/50 font-mono text-xs"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />

        {/* Copy button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          disabled={!trackingUrl}
          className={cn(
            'shrink-0 transition-colors',
            copied && 'border-green-500 text-green-600'
          )}
          aria-label="Copy tracking link"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>

        {/* Share button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          disabled={!trackingUrl || sharing}
          className="shrink-0"
          aria-label="Share tracking link"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Tracking number display */}
      <p className="mt-2 text-xs text-muted-foreground">
        Tracking #: <span className="font-mono font-medium">{trackingNumber}</span>
      </p>
    </div>
  );
}
