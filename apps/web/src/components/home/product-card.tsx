'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, Star, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  seller: string;
  type: 'in-stock' | 'cargo';
  rating: number;
  reviewCount: number;
  discount?: number;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <Package className="h-16 w-16 text-muted-foreground/30" />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            -{product.discount}%
          </Badge>
        )}

        {/* Type Badge */}
        <Badge
          variant={product.type === 'cargo' ? 'default' : 'secondary'}
          className="absolute top-2 right-2"
        >
          {product.type === 'cargo' ? (
            <><Truck className="h-3 w-3 mr-1" /> Cargo</>
          ) : (
            'In Stock'
          )}
        </Badge>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 left-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`}
          />
        </Button>

        {/* Add to Cart Button */}
        <Button
          size="sm"
          className="absolute bottom-2 right-2 bg-primary/90 hover:bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {addedToCart ? 'Added!' : 'Add'}
        </Button>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < product.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Seller */}
        <p className="text-xs text-muted-foreground mt-2">
          by {product.seller}
        </p>
      </CardContent>
    </Card>
  );
}
