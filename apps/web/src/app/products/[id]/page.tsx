'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductBreadcrumb } from '@/components/product-detail';
import { ProductImageGallery } from '@/components/product-detail';
import { ProductInfo } from '@/components/product-detail';
import { ProductVariants } from '@/components/product-detail';
import { AddToCart } from '@/components/product-detail';
import { ReviewsSection } from '@/components/product-detail';
import { SellerCard } from '@/components/product-detail';
import { RelatedProducts } from '@/components/product-detail';
import { PublicLayout } from '@/components/layout/public-layout';
import { useProduct, useProducts } from '@/lib/services/product.service';

// ── Local types for the full backend findBySlug response ───────────

interface ProductImage {
  url: string;
  alt?: string | null;
  order: number;
}

interface VariantAttribute {
  type: string;
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  price?: number | null;
  stock: number;
  attributes: VariantAttribute;
}

interface ReviewUser {
  id: string;
  name: string;
  avatar?: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  text?: string | null;
  images: string[];
  createdAt: string;
  user: ReviewUser;
}

/** Full product shape returned by the backend findBySlug endpoint */
interface FullProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  seller: { id: string; name: string; avatar?: string | null };
  stock: number;
  type: 'IN_STOCK' | 'CARGO' | 'PROMOTION';
  status: string;
  avgRating?: number | null;
  variants: ProductVariant[];
  reviews: ReviewItem[];
  createdAt: string;
  updatedAt: string;
}

/** Simplified product shape for the related products list */
interface ListProduct {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  seller: { id: string; name: string };
  stock: number;
  type: 'IN_STOCK' | 'CARGO' | 'PROMOTION';
  status: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────

/** Group flat variant array by `attributes.type` → ProductVariants shape */
function groupVariants(
  raw: ProductVariant[],
): { size?: { id: string; name: string; value: string; inStock: boolean }[]; color?: { id: string; name: string; value: string; inStock: boolean }[] } {
  const groups: Record<
    string,
    { id: string; name: string; value: string; inStock: boolean }[]
  > = {};

  for (const v of raw) {
    const attrs = v.attributes;
    if (!attrs?.type) continue;
    if (!groups[attrs.type]) groups[attrs.type] = [];
    groups[attrs.type].push({
      id: v.id,
      name: attrs.name,
      value: attrs.value,
      inStock: v.stock > 0,
    });
  }

  return groups as { size?: { id: string; name: string; value: string; inStock: boolean }[]; color?: { id: string; name: string; value: string; inStock: boolean }[] };
}

// ── Loading skeleton ──────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
        {/* Info skeleton */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-12 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Error / Not Found ─────────────────────────────────────────────

function ProductNotFound({ slug }: { slug: string }) {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Product Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          We could not find the product &ldquo;{slug}&rdquo;. It may have been
          removed or is no longer available.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </PublicLayout>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  const { data: response, isLoading, error } = useProduct(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = (response?.data as any) as FullProduct | undefined;

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  // Group variants by type (size, color, etc.)
  const groupedVariants = useMemo(
    () => (product?.variants ? groupVariants(product.variants) : {}),
    [product?.variants],
  );

  // Map backend images to string[] for ImageGallery
  const imageUrls = useMemo(
    () =>
      product?.images
        ? [...product.images]
            .sort((a, b) => a.order - b.order)
            .map((i) => i.url)
        : [],
    [product?.images],
  );

  // Map backend reviews to ReviewsSection shape
  const mappedReviews = useMemo(
    () =>
      product?.reviews
        ? product.reviews.map((r) => ({
            id: r.id,
            userName: r.user.name,
            avatar: r.user.avatar ?? undefined,
            rating: r.rating,
            date: r.createdAt,
            text: r.text ?? '',
            helpfulCount: 0,
          }))
        : [],
    [product?.reviews],
  );

  // Related products: fetch from same category
  const { data: relatedResponse } = useProducts({
    category: product?.category?.slug,
    limit: 10,
  });
  const relatedProducts = useMemo(() => {
    if (!relatedResponse?.data || !product) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = relatedResponse.data as any as ListProduct[];
    return items
      .filter((p) => p.id !== product.id)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.compareAtPrice,
        image: p.images?.[0]?.url ?? undefined,
        seller: p.seller.name,
        type: p.type === 'CARGO' ? ('cargo' as const) : ('in-stock' as const),
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        discount:
          p.compareAtPrice && p.compareAtPrice > p.price
            ? Math.round(
                ((p.compareAtPrice - p.price) / p.compareAtPrice) * 100,
              )
            : undefined,
        category: p.category.name,
      }));
  }, [relatedResponse?.data, product]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [type]: value }));
  };

  const handleAddToCart = () => {
    // TODO: integrate with cart store
  };

  const handleBuyNow = () => {
    // TODO: add to cart and navigate to checkout
    router.push('/checkout');
  };

  const handleWishlist = () => {
    // TODO: integrate with wishlist API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // ── Loading state ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background">
          <ProductDetailSkeleton />
        </div>
      </PublicLayout>
    );
  }

  // ── Error / Not found state ───────────────────────────────────

  if (error || !product) {
    return <ProductNotFound slug={slug} />;
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <ProductBreadcrumb productName={product.name} />

        {/* Main Product Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Left Column: Images */}
            <div className="w-full md:w-1/2">
              <ProductImageGallery
                images={imageUrls}
                productName={product.name}
              />
            </div>

            {/* Right Column: Product Info + Actions */}
            <div className="w-full md:w-1/2">
              <ProductInfo
                product={{
                  id: product.id,
                  name: product.name,
                  type: product.type,
                  rating: product.avgRating ?? 0,
                  reviewCount: product.reviews?.length ?? 0,
                  price: Number(product.price),
                  originalPrice: product.compareAtPrice
                    ? Number(product.compareAtPrice)
                    : undefined,
                  description: product.description,
                  stockQuantity: product.stock,
                }}
              />

              {/* Variants */}
              {(groupedVariants.size || groupedVariants.color) && (
                <div className="mt-8">
                  <ProductVariants
                    variants={groupedVariants}
                    selectedVariants={selectedVariants}
                    onVariantChange={handleVariantChange}
                  />
                </div>
              )}

              {/* Add to Cart / Buy Now */}
              <div className="mt-8">
                <AddToCart
                  price={Number(product.price)}
                  quantity={quantity}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onWishlist={handleWishlist}
                  onShare={handleShare}
                />
              </div>

              {/* Quantity (if no variants with stock info) */}
              {!groupedVariants.size && !groupedVariants.color && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) setQuantity(val);
                      }}
                      min={1}
                      max={product.stock}
                      className="w-20 h-10 text-center border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seller Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
          <div className="max-w-md">
            <SellerCard
              seller={{
                id: product.seller.id,
                name: product.seller.name,
                avatar: product.seller.avatar ?? undefined,
                rating: product.avgRating ?? 0,
                reviewCount: product.reviews?.length ?? 0,
                responseRate: 100,
                isVerified: true,
                isTopSeller: false,
              }}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
          <ReviewsSection
            reviews={mappedReviews}
            averageRating={product.avgRating ?? 0}
            totalReviews={product.reviews?.length ?? 0}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
