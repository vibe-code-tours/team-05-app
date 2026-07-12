import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroBanner } from '@/components/home/hero-banner';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoryGrid } from '@/components/home/category-grid';
import { NewArrivals } from '@/components/home/new-arrivals';
import { PromoBanner } from '@/components/home/promo-banner';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Promo Banner */}
        <section className="container mx-auto px-4 py-8">
          <PromoBanner
            title="Free Shipping on Orders Over 100,000 MMK"
            subtitle="Limited time offer for new customers"
            cta="Shop Now"
            href="/products"
            variant="default"
          />
        </section>

        {/* Category Grid */}
        <CategoryGrid />

        {/* New Arrivals */}
        <NewArrivals />

        {/* Second Promo Banner */}
        <section className="container mx-auto px-4 py-8">
          <PromoBanner
            title="Refer a Friend, Get 10,000 MMK Off"
            subtitle="Share the love and save on your next order"
            cta="Learn More"
            href="/referral"
            variant="gift"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
