'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Package, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { MOCK_WISHLIST } from '@/lib/mock-wishlist';
import { formatPrice } from '@/lib/utils';
import type { WishlistItem } from '@/types/wishlist';

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const items = wishlistItems.length > 0 ? wishlistItems : MOCK_WISHLIST;

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.productId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: item.stock,
      seller: item.seller,
    });
    removeWishlistItem(item.id);
    setAddedToCart(item.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const handleRemove = (id: string) => {
    removeWishlistItem(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Page Title */}
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
            <Badge variant="secondary" className="text-sm">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-6 mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Save items you love to your wishlist and come back to them anytime.
              </p>
              <Button asChild>
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}

          {/* Wishlist Grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => {
                const discount = item.originalPrice
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Product Image */}
                        <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0 bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {discount > 0 && (
                            <Badge
                              className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs"
                            >
                              -{discount}%
                            </Badge>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {item.seller}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-lg font-bold text-foreground">
                                {formatPrice(item.price)}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                            </div>

                            {/* Stock Status */}
                            {item.inStock ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                <Package className="h-3 w-3 mr-1" />
                                In Stock
                                {item.stock <= 5 && (
                                  <span className="ml-1 text-green-600">
                                    (Only {item.stock} left)
                                  </span>
                                )}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Out of Stock
                              </Badge>
                            )}
                          </div>

                          <Separator className="my-4" />

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              disabled={!item.inStock}
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {addedToCart === item.id ? 'Added!' : 'Add to Cart'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemove(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
