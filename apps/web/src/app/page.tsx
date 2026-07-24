import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroBanner } from '@/components/home/hero-banner';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoryGrid } from '@/components/home/category-grid';
import { CargoShowcase } from '@/components/home/cargo-showcase';
import { NewArrivals } from '@/components/home/new-arrivals';
import { PromoBanner } from '@/components/home/promo-banner';
import { Testimonials } from '@/components/home/testimonials';
import { WhyChooseUs } from '@/components/home/why-choose-us';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner — primary CTA, slide carousel */}
        <HeroBanner />

        {/* Featured Products — handpicked grid */}
        <FeaturedProducts />

        {/* Free Shipping Promo Banner */}
        <section className="container mx-auto px-4 py-8">
          <PromoBanner
            title="Free Shipping on Orders Over 100,000 MMK"
            subtitle="Limited time offer for all customers — shop Thailand collection today"
            cta="Shop Now"
            href="/products"
            variant="default"
          />
        </section>

        {/* Category Grid — glassmorphic browse tiles */}
        <CategoryGrid />

        {/* Cargo Showcase — Bangkok → Yangon journey */}
        <CargoShowcase />

        {/* Why Choose Us — premium two-column */}
        <WhyChooseUs />

        {/* New Arrivals — horizontal scroll carousel */}
        <NewArrivals />

        {/* Testimonials — masonry grid + stats strip */}
        <Testimonials />

        {/* Referral Promo Banner */}
        <section className="container mx-auto px-4 py-8">
          <PromoBanner
            title="Refer a Friend, Get 10,000 MMK Off"
            subtitle="Share CrossMart with a friend and both of you save on the next order"
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
