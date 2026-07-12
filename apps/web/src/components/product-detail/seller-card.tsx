'use client'

import React from 'react'
import { MessageCircle, ExternalLink, BadgeCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface SellerCardProps {
  seller: {
    id: string
    name: string
    avatar?: string
    rating: number
    reviewCount: number
    responseRate: number
    isVerified: boolean
    isTopSeller: boolean
  }
}

export function SellerCard({ seller }: SellerCardProps) {
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      )
    }
    return stars
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {seller.avatar ? (
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">
                  {seller.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {seller.isVerified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 fill-white" />
            )}
          </div>

          {/* Seller Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{seller.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">{renderStars(seller.rating)}</div>
              <span className="text-sm text-muted-foreground">
                {seller.rating.toFixed(1)} ({seller.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {/* Response Rate */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-lg font-semibold text-foreground">{seller.responseRate}%</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {seller.isVerified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              Verified Seller
            </Badge>
          )}
          {seller.isTopSeller && (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
              ⭐ Top Seller
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        <Button className="w-full" size="default">
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with Seller
        </Button>
        <Button variant="outline" className="w-full" size="default" asChild>
          <a href={`/seller/${seller.id}`}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Seller Profile
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
