import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Product images - using local images from /products folder
// Prices in MMK (1 USD = 4500 MMK)
const products = [
  // Electronics
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "256GB - Titanium Black. Latest flagship with S Pen and AI features.",
    price: 5849955, // $1299.99
    type: "CARGO",
    status: "APPROVED",
    stock: 25,
    slug: "samsung-galaxy-s24-ultra",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/samsung-galaxy-1.jpg", alt: "Samsung Galaxy S24 Ultra front" },
    ],
  },
  {
    name: "MacBook Air M3",
    description: "13-inch, 8GB RAM, 256GB SSD. Apple's thinnest laptop ever.",
    price: 4945500, // $1099
    type: "CARGO",
    status: "APPROVED",
    stock: 15,
    slug: "macbook-air-m3",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/macbook-1.jpg", alt: "MacBook Air M3" },
    ],
  },
  {
    name: "Apple AirPods Pro 2",
    description: "Active Noise Cancellation, USB-C, Personalized Spatial Audio.",
    price: 1120500, // $249
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 100,
    slug: "apple-airpods-pro-2",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/airpods-1.jpg", alt: "Apple AirPods Pro 2" },
    ],
  },
  {
    name: "PlayStation 5 Slim",
    description: "Disc Edition, 1TB SSD. Next-gen gaming console.",
    price: 2249955, // $499.99
    type: "CARGO",
    status: "APPROVED",
    stock: 20,
    slug: "playstation-5-slim",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/ps5-1.jpg", alt: "PlayStation 5 Slim" },
    ],
  },
  {
    name: "Sony Alpha a7 IV",
    description: "33MP Full-Frame Mirrorless Camera with 28-70mm Lens Kit.",
    price: 11241000, // $2498
    type: "CARGO",
    status: "APPROVED",
    stock: 8,
    slug: "sony-alpha-a7-iv",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/camera-1.jpg", alt: "Sony Alpha a7 IV camera" },
    ],
  },
  {
    name: "JBL Charge 5",
    description: "Portable Bluetooth Speaker with IP67 waterproof rating.",
    price: 809775, // $179.95
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 60,
    slug: "jbl-charge-5",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/speaker-1.jpg", alt: "JBL Charge 5 speaker" },
    ],
  },
  {
    name: "Apple Watch Series 9",
    description: "45mm GPS, Aluminum Case with Sport Band. Health & fitness tracking.",
    price: 1930500, // $429
    type: "CARGO",
    status: "APPROVED",
    stock: 30,
    slug: "apple-watch-series-9",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/apple-watch-1.jpg", alt: "Apple Watch Series 9" },
      { url: "/products/apple-watch-2.jpg", alt: "Apple Watch Series 9 band" },
    ],
  },

  // Fashion
  {
    name: "Nike Air Max 270",
    description: "Men's Running Shoes - Black/White. Max Air unit for all-day comfort.",
    price: 675000, // $150
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 50,
    slug: "nike-air-max-270",
    category: "Fashion",
    categorySlug: "fashion",
    images: [
      { url: "/products/nike-air-max-1.jpg", alt: "Nike Air Max 270 side view" },
      { url: "/products/nike-air-max-2.jpg", alt: "Nike Air Max 270 top view" },
    ],
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "Classic Fit - Blue Denim. The original straight-leg jeans since 1873.",
    price: 312750, // $69.50
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 100,
    slug: "levis-501-original-jeans",
    category: "Fashion",
    categorySlug: "fashion",
    images: [
      { url: "/products/levis-jeans-1.jpg", alt: "Levi's 501 jeans front" },
      { url: "/products/levis-jeans-2.jpg", alt: "Levi's 501 jeans back" },
    ],
  },
  {
    name: "Ray-Ban Aviator Classic",
    description: "Gold/Green Classic G-15 lenses. Timeless pilot sunglasses.",
    price: 733500, // $163
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 40,
    slug: "ray-ban-aviator-classic",
    category: "Fashion",
    categorySlug: "fashion",
    images: [
      { url: "/products/sunglasses-1.jpg", alt: "Ray-Ban Aviator sunglasses" },
    ],
  },
  {
    name: "Nike Tech Fleece Hoodie",
    description: "Men's Full-Zip Hoodie - Black. Lightweight warmth with modern design.",
    price: 495000, // $110
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 75,
    slug: "nike-tech-fleece-hoodie",
    category: "Fashion",
    categorySlug: "fashion",
    images: [
      { url: "/products/hoodie-1.jpg", alt: "Nike Tech Fleece Hoodie" },
    ],
  },

  // Accessories
  {
    name: "Osprey Atmos AG 65",
    description: "Men's Backpacking Backpack. Anti-Gravity suspension for comfort.",
    price: 1395000, // $310
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 15,
    slug: "osprey-atmos-ag-65",
    category: "Accessories",
    categorySlug: "accessories",
    images: [
      { url: "/products/backpack-1.jpg", alt: "Osprey Atmos AG 65 backpack" },
    ],
  },

  // Flash Sales / Promotions
  {
    name: "iPhone 15 Pro Max - Flash Sale",
    description: "256GB Natural Titanium. Limited time offer - save 15%!",
    price: 5527500, // $1228.25 (was $1445 = 6502500)
    type: "PROMOTION",
    status: "APPROVED",
    stock: 10,
    slug: "iphone-15-pro-max-flash",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/samsung-galaxy-1.jpg", alt: "iPhone 15 Pro Max flash sale" },
    ],
  },
  {
    name: "Sony WH-1000XM5 - Deal of the Day",
    description: "Wireless Noise Cancelling Headphones. 30% off today only!",
    price: 629300, // $139.84 (was $200 = 900000)
    type: "PROMOTION",
    status: "APPROVED",
    stock: 25,
    slug: "sony-wh1000xm5-deal",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/airpods-1.jpg", alt: "Sony WH-1000XM5 headphones deal" },
    ],
  },
  {
    name: "Nike Air Jordan 1 - Weekend Special",
    description: "Classic Red/Black colorway. Buy 1 Get 1 50% off!",
    price: 495000, // $110
    type: "PROMOTION",
    status: "APPROVED",
    stock: 30,
    slug: "nike-air-jordan-weekend",
    category: "Fashion",
    categorySlug: "fashion",
    images: [
      { url: "/products/nike-air-max-1.jpg", alt: "Nike Air Jordan 1 weekend special" },
      { url: "/products/nike-air-max-2.jpg", alt: "Nike Air Jordan 1 side view" },
    ],
  },
  {
    name: "Samsung 65\" OLED TV - Clearance",
    description: "4K Smart TV with Dolby Atmos. Final clearance - 40% off!",
    price: 6750000, // $1500 (was $2500 = 11250000)
    type: "PROMOTION",
    status: "APPROVED",
    stock: 5,
    slug: "samsung-65-oled-clearance",
    category: "Electronics",
    categorySlug: "electronics",
    images: [
      { url: "/products/ps5-1.jpg", alt: "Samsung 65 inch OLED TV clearance" },
    ],
  },
  {
    name: "Ray-Ban Summer Collection - 25% Off",
    description: "Aviator & Wayfarer styles. Summer sale ends this week!",
    price: 550125, // $122.25 (was $163 = 733500)
    type: "PROMOTION",
    status: "APPROVED",
    stock: 40,
    slug: "ray-ban-summer-sale",
    category: "Fashion",
    categorySlug: "fashion",
    images: [
      { url: "/products/sunglasses-1.jpg", alt: "Ray-Ban summer collection sale" },
    ],
  },
];

async function main() {
  // Find any existing seller user
  const seller = await prisma.user.findFirst({
    where: { role: "SELLER" },
  });

  if (!seller) {
    console.log("❌ No seller user found. Please create a seller account first.");
    return;
  }

  for (const product of products) {
    const { images, category, categorySlug, ...productData } = product;

    // Create or find category
    const cat = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        name: category,
        slug: categorySlug,
      },
    });

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        sellerId: seller.id,
        categoryId: cat.id,
        images: {
          create: images,
        },
      },
    });

    console.log(`✅ ${created.name} - $${product.price}`);
  }

  console.log(`\n🎉 ${products.length} products seeded with images!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
