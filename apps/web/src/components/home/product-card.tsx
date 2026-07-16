'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Package, Truck, Eye, X, Minus, Plus } from 'lucide-react';
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
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const addedToCartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedToCartTimeoutRef.current) {
        clearTimeout(addedToCartTimeoutRef.current);
      }
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    if (addedToCartTimeoutRef.current) {
      clearTimeout(addedToCartTimeoutRef.current);
    }
    addedToCartTimeoutRef.current = setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {/* Image with zoom effect */}
          <div className={`absolute inset-0 transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" role="img" aria-label={`${product.name} product image`}>
                <Package className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount && product.discount > 0 && (
              <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-bold shadow-lg">
                -{product.discount}%
              </Badge>
            )}
            <Badge
              variant={product.type === 'cargo' ? 'default' : 'secondary'}
              className={`px-2 py-1 text-xs font-medium shadow-lg ${
                product.type === 'cargo'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {product.type === 'cargo' ? (
                <><Truck className="h-3 w-3 mr-1" /> Cargo</>
              ) : (
                'In Stock'
              )}
            </Badge>
          </div>

          {/* Quick Actions - appear on hover */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/90 hover:bg-white text-foreground shadow-lg backdrop-blur-sm"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/90 hover:bg-white text-foreground shadow-lg backdrop-blur-sm"
              aria-label="Quick view"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button - appears on hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              className={`w-full font-semibold shadow-lg transition-all duration-300 ${
                addedToCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-white hover:bg-white/90 text-foreground'
              }`}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <CardContent className="p-4">
          <Link href={`/products/${product.id}`} className="block">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center" aria-label={`${product.rating} out of 5 stars`} role="img">
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
          </Link>
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Quick View</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQuickView(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-24 w-24 text-muted-foreground/20" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                      {product.category}
                    </p>
                    <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < product.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.discount && product.discount > 0 && (
                      <Badge className="bg-red-500 text-white">
                        Save {product.discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Seller */}
                  <p className="text-sm text-muted-foreground">
                    Sold by <span className="font-medium text-foreground">{product.seller}</span>
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart
                        className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </Button>
                  </div>

                  {/* View Full Details */}
                  <Link
                    href={`/products/${product.id}`}
                    className="block text-center text-primary hover:text-primary/80 font-medium text-sm"
                    onClick={() => setShowQuickView(false)}
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
