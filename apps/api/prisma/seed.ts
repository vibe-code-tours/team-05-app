import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helper: Generate Picsum image URLs ──────────────────
// Using Lorem Picsum for reliable placeholder images
function picsumImage(seed: number, width = 800, height = 800): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// ─── Product image data ────────────────────────────────────
// Using unique seeds for each product to get different images
const productImages: Record<string, string[]> = {
  // Cameras (100-199)
  "sony-alpha-a7-iv": [picsumImage(101, 800, 800), picsumImage(102, 800, 800), picsumImage(103, 800, 800)],
  "sony-fx30": [picsumImage(104, 800, 800), picsumImage(105, 800, 800)],
  "canon-eos-r5": [picsumImage(106, 800, 800), picsumImage(107, 800, 800)],
  "nikon-z9": [picsumImage(108, 800, 800), picsumImage(109, 800, 800)],

  // Laptops (200-299)
  "macbook-pro-16": [picsumImage(201, 800, 800), picsumImage(202, 800, 800), picsumImage(203, 800, 800)],
  "samsung-galaxy-book": [picsumImage(204, 800, 800), picsumImage(205, 800, 800)],
  "dell-xps-15": [picsumImage(206, 800, 800), picsumImage(207, 800, 800)],

  // Phones (300-399)
  "iphone-15-pro-max": [picsumImage(301, 800, 800), picsumImage(302, 800, 800), picsumImage(303, 800, 800)],
  "samsung-s24-ultra": [picsumImage(304, 800, 800), picsumImage(305, 800, 800)],
  "google-pixel-8-pro": [picsumImage(306, 800, 800), picsumImage(307, 800, 800)],

  // Audio (400-499)
  "airpods-pro-2": [picsumImage(401, 800, 800), picsumImage(402, 800, 800), picsumImage(403, 800, 800)],
  "sony-wh1000xm5": [picsumImage(404, 800, 800), picsumImage(405, 800, 800)],
  "jbl-charge-5": [picsumImage(406, 800, 800), picsumImage(407, 800, 800)],
  "shure-mv7": [picsumImage(408, 800, 800), picsumImage(409, 800, 800)],

  // Gaming (500-599)
  "ps5-console": [picsumImage(501, 800, 800), picsumImage(502, 800, 800), picsumImage(503, 800, 800)],
  "xbox-series-x": [picsumImage(504, 800, 800), picsumImage(505, 800, 800)],
  "razer-deathadder-v3": [picsumImage(506, 800, 800), picsumImage(507, 800, 800)],
  "logitech-g-pro-keyboard": [picsumImage(508, 800, 800), picsumImage(509, 800, 800)],

  // Drones (600-699)
  "dji-mini-4-pro": [picsumImage(601, 800, 800), picsumImage(602, 800, 800), picsumImage(603, 800, 800)],
  "dji-air-3": [picsumImage(604, 800, 800), picsumImage(605, 800, 800)],

  // Storage (700-799)
  "samsung-t7-ssd": [picsumImage(701, 800, 800), picsumImage(702, 800, 800)],
  "apple-airtag-4pack": [picsumImage(703, 800, 800), picsumImage(704, 800, 800)],

  // Lighting (800-899)
  "elgato-key-light": [picsumImage(801, 800, 800), picsumImage(802, 800, 800)],
  "neewer-ring-light": [picsumImage(803, 800, 800), picsumImage(804, 800, 800)],
};

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ──────────────────────────────────────────

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@crossmart.com" },
    update: {},
    create: {
      email: "admin@crossmart.com",
      phone: "+95912345678",
      name: "CrossMart Admin",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  const sellerPassword = await bcrypt.hash("Seller123!", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@crossmart.com" },
    update: {},
    create: {
      email: "seller@crossmart.com",
      phone: "+95998765432",
      name: "Test Seller",
      password: sellerPassword,
      role: "SELLER",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Seller: ${seller.email}`);

  const clientPassword = await bcrypt.hash("Client123!", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@crossmart.com" },
    update: {},
    create: {
      email: "client@crossmart.com",
      phone: "+95911111111",
      name: "Test Client",
      password: clientPassword,
      role: "CLIENT",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Client: ${client.email}`);

  // ─── Categories ─────────────────────────────────────

  const categories = [
    { name: "Camera", slug: "camera" },
    { name: "Microphone", slug: "microphone" },
    { name: "Laptop", slug: "laptop" },
    { name: "Phone", slug: "phone" },
    { name: "Gaming", slug: "gaming" },
    { name: "Drone", slug: "drone" },
    { name: "Storage", slug: "storage" },
    { name: "Audio", slug: "audio" },
    { name: "Lighting", slug: "lighting" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Categories: ${categories.length}`);

  // ─── Brands ─────────────────────────────────────────

  const brands = [
    { name: "Sony", slug: "sony" },
    { name: "Apple", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "Canon", slug: "canon" },
    { name: "Nikon", slug: "nikon" },
    { name: "DJI", slug: "dji" },
    { name: "Logitech", slug: "logitech" },
    { name: "Razer", slug: "razer" },
    { name: "JBL", slug: "jbl" },
    { name: "Shure", slug: "shure" },
    { name: "Microsoft", slug: "microsoft" },
    { name: "Google", slug: "google" },
    { name: "Dell", slug: "dell" },
    { name: "Elgato", slug: "elgato" },
    { name: "Neewer", slug: "neewer" },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log(`✅ Brands: ${brands.length}`);

  // ─── Get Category and Brand IDs ─────────────────────

  const cameraCategory = await prisma.category.findUnique({ where: { slug: "camera" } });
  const laptopCategory = await prisma.category.findUnique({ where: { slug: "laptop" } });
  const phoneCategory = await prisma.category.findUnique({ where: { slug: "phone" } });
  const audioCategory = await prisma.category.findUnique({ where: { slug: "audio" } });
  const gamingCategory = await prisma.category.findUnique({ where: { slug: "gaming" } });
  const droneCategory = await prisma.category.findUnique({ where: { slug: "drone" } });
  const storageCategory = await prisma.category.findUnique({ where: { slug: "storage" } });
  const lightingCategory = await prisma.category.findUnique({ where: { slug: "lighting" } });
  const microphoneCategory = await prisma.category.findUnique({ where: { slug: "microphone" } });

  const sonyBrand = await prisma.brand.findUnique({ where: { slug: "sony" } });
  const appleBrand = await prisma.brand.findUnique({ where: { slug: "apple" } });
  const samsungBrand = await prisma.brand.findUnique({ where: { slug: "samsung" } });
  const canonBrand = await prisma.brand.findUnique({ where: { slug: "canon" } });
  const nikonBrand = await prisma.brand.findUnique({ where: { slug: "nikon" } });
  const djiBrand = await prisma.brand.findUnique({ where: { slug: "dji" } });
  const logitechBrand = await prisma.brand.findUnique({ where: { slug: "logitech" } });
  const razerBrand = await prisma.brand.findUnique({ where: { slug: "razer" } });
  const jblBrand = await prisma.brand.findUnique({ where: { slug: "jbl" } });
  const shureBrand = await prisma.brand.findUnique({ where: { slug: "shure" } });
  const microsoftBrand = await prisma.brand.findUnique({ where: { slug: "microsoft" } });
  const googleBrand = await prisma.brand.findUnique({ where: { slug: "google" } });
  const dellBrand = await prisma.brand.findUnique({ where: { slug: "dell" } });
  const elgatoBrand = await prisma.brand.findUnique({ where: { slug: "elgato" } });
  const neewerBrand = await prisma.brand.findUnique({ where: { slug: "neewer" } });

  // ─── Sample Products ────────────────────────────────

  const productsData = [
    // ── Cameras ──
    {
      sellerId: seller.id,
      name: "Sony Alpha A7 IV",
      description: "Full-frame mirrorless camera with 33MP sensor, 4K 60p video, and advanced autofocus. Perfect for both photography and videography enthusiasts.",
      price: 2499000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: cameraCategory?.id,
      brandId: sonyBrand?.id,
      stock: 15,
      slug: "sony-alpha-a7-iv",
    },
    {
      sellerId: seller.id,
      name: "Sony FX30",
      description: "Cinema line camera with Super 35 sensor, 4K 120p, and professional video features. Ideal for content creators and filmmakers.",
      price: 1799000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: cameraCategory?.id,
      brandId: sonyBrand?.id,
      stock: 8,
      slug: "sony-fx30",
    },
    {
      sellerId: seller.id,
      name: "Canon EOS R5",
      description: "8K video recording, 45MP full-frame CMOS sensor, up to 20fps continuous shooting. The ultimate hybrid camera.",
      price: 3899000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: cameraCategory?.id,
      brandId: canonBrand?.id,
      stock: 5,
      slug: "canon-eos-r5",
    },
    {
      sellerId: seller.id,
      name: "Nikon Z9",
      description: "Flagship mirrorless camera with 45.7MP sensor, 8K video, and professional-grade autofocus system.",
      price: 5499000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: cameraCategory?.id,
      brandId: nikonBrand?.id,
      stock: 3,
      slug: "nikon-z9",
    },

    // ── Laptops ──
    {
      sellerId: seller.id,
      name: "MacBook Pro 16-inch M3 Max",
      description: "Apple's most powerful laptop with M3 Max chip, 36GB RAM, 1TB SSD. Perfect for creative professionals.",
      price: 3499000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: laptopCategory?.id,
      brandId: appleBrand?.id,
      stock: 12,
      slug: "macbook-pro-16",
    },
    {
      sellerId: seller.id,
      name: "Samsung Galaxy Book4 Ultra",
      description: "16-inch AMOLED display, Intel Core i9, RTX 4070. The ultimate Windows laptop for creators.",
      price: 2199000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: laptopCategory?.id,
      brandId: samsungBrand?.id,
      stock: 8,
      slug: "samsung-galaxy-book",
    },
    {
      sellerId: seller.id,
      name: "Dell XPS 15",
      description: "15.6-inch OLED display, Intel Core i7, 16GB RAM. Sleek design with powerful performance.",
      price: 1699000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: laptopCategory?.id,
      brandId: dellBrand?.id,
      stock: 10,
      slug: "dell-xps-15",
    },

    // ── Phones ──
    {
      sellerId: seller.id,
      name: "iPhone 15 Pro Max",
      description: "Titanium design, A17 Pro chip, 48MP camera system, USB-C. The most advanced iPhone ever.",
      price: 1899000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: phoneCategory?.id,
      brandId: appleBrand?.id,
      stock: 25,
      slug: "iphone-15-pro-max",
    },
    {
      sellerId: seller.id,
      name: "Samsung Galaxy S24 Ultra",
      description: "6.8-inch QHD+ AMOLED, Snapdragon 8 Gen 3, 200MP camera, S Pen included.",
      price: 1599000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: phoneCategory?.id,
      brandId: samsungBrand?.id,
      stock: 20,
      slug: "samsung-s24-ultra",
    },
    {
      sellerId: seller.id,
      name: "Google Pixel 8 Pro",
      description: "6.7-inch LTPO OLED, Tensor G3, 50MP camera with AI features. Best camera phone for photos.",
      price: 999000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: phoneCategory?.id,
      brandId: googleBrand?.id,
      stock: 15,
      slug: "google-pixel-8-pro",
    },

    // ── Audio ──
    {
      sellerId: seller.id,
      name: "AirPods Pro 2nd Gen",
      description: "Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio. Magic fit.",
      price: 349000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: audioCategory?.id,
      brandId: appleBrand?.id,
      stock: 50,
      slug: "airpods-pro-2",
    },
    {
      sellerId: seller.id,
      name: "Sony WH-1000XM5",
      description: "Industry-leading noise cancellation, 30-hour battery, multipoint connection. Premium comfort.",
      price: 429000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: audioCategory?.id,
      brandId: sonyBrand?.id,
      stock: 30,
      slug: "sony-wh1000xm5",
    },
    {
      sellerId: seller.id,
      name: "JBL Charge 5",
      description: "Portable Bluetooth speaker with powerful bass, IP67 waterproof, 20-hour playtime.",
      price: 179000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: audioCategory?.id,
      brandId: jblBrand?.id,
      stock: 40,
      slug: "jbl-charge-5",
    },
    {
      sellerId: seller.id,
      name: "Shure MV7+",
      description: "USB/XLR hybrid microphone for podcasting and streaming. Built-in DSP and headphone output.",
      price: 299000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: microphoneCategory?.id,
      brandId: shureBrand?.id,
      stock: 18,
      slug: "shure-mv7",
    },

    // ── Gaming ──
    {
      sellerId: seller.id,
      name: "PlayStation 5 Console",
      description: "4K gaming, 120fps, ray tracing, 825GB SSD. The next generation of gaming.",
      price: 599000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: gamingCategory?.id,
      brandId: sonyBrand?.id,
      stock: 35,
      slug: "ps5-console",
    },
    {
      sellerId: seller.id,
      name: "Xbox Series X",
      description: "12 teraflops of power, 4K gaming at 120fps, Quick Resume, 1TB SSD.",
      price: 549000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: gamingCategory?.id,
      brandId: microsoftBrand?.id,
      stock: 28,
      slug: "xbox-series-x",
    },
    {
      sellerId: seller.id,
      name: "Razer DeathAdder V3",
      description: "Ergonomic gaming mouse, Focus Pro 30K sensor, 90-hour battery. Lightweight at 63g.",
      price: 89000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: gamingCategory?.id,
      brandId: razerBrand?.id,
      stock: 45,
      slug: "razer-deathadder-v3",
    },
    {
      sellerId: seller.id,
      name: "Logitech G Pro X Keyboard",
      description: "Mechanical gaming keyboard, GX switches, LIGHTSYNC RGB, aluminum construction.",
      price: 149000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: gamingCategory?.id,
      brandId: logitechBrand?.id,
      stock: 32,
      slug: "logitech-g-pro-keyboard",
    },

    // ── Drones ──
    {
      sellerId: seller.id,
      name: "DJI Mini 4 Pro",
      description: "Under 249g, 4K/60fps HDR video, omnidirectional obstacle sensing. No registration required.",
      price: 799000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: droneCategory?.id,
      brandId: djiBrand?.id,
      stock: 12,
      slug: "dji-mini-4-pro",
    },
    {
      sellerId: seller.id,
      name: "DJI Air 3",
      description: "Dual camera system, 46-min flight time, omnidirectional obstacle sensing. Master your shots.",
      price: 1299000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: droneCategory?.id,
      brandId: djiBrand?.id,
      stock: 8,
      slug: "dji-air-3",
    },

    // ── Storage ──
    {
      sellerId: seller.id,
      name: "Samsung T7 Portable SSD 1TB",
      description: "Up to 1,050 MB/s transfer speed, USB 3.2, shock-resistant. Fast and reliable storage.",
      price: 129000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: storageCategory?.id,
      brandId: samsungBrand?.id,
      stock: 60,
      slug: "samsung-t7-ssd",
    },
    {
      sellerId: seller.id,
      name: "Apple AirTag 4 Pack",
      description: "Precision finding with Ultra Wideband, replaceable battery, water resistant. Keep track of your items.",
      price: 129000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: storageCategory?.id,
      brandId: appleBrand?.id,
      stock: 45,
      slug: "apple-airtag-4pack",
    },

    // ── Lighting ──
    {
      sellerId: seller.id,
      name: "Elgato Key Light",
      description: "2800 lumens, 2900-7000K color temperature, app control. Professional lighting for creators.",
      price: 199000,
      type: "CARGO" as const,
      status: "APPROVED" as const,
      categoryId: lightingCategory?.id,
      brandId: elgatoBrand?.id,
      stock: 22,
      slug: "elgato-key-light",
    },
    {
      sellerId: seller.id,
      name: "Neewer 18\" Ring Light",
      description: "18-inch ring light with stand, phone holder, and remote. Perfect for YouTube and TikTok.",
      price: 89000,
      type: "IN_STOCK" as const,
      status: "APPROVED" as const,
      categoryId: lightingCategory?.id,
      brandId: neewerBrand?.id,
      stock: 35,
      slug: "neewer-ring-light",
    },
  ];

  let productCount = 0;
  for (const product of productsData) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });

    // Add images if they exist
    const images = productImages[product.slug];
    if (images && images.length > 0) {
      // Delete existing images first
      await prisma.productImage.deleteMany({
        where: { productId: created.id },
      });

      // Create new images
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            url: images[i],
            alt: `${product.name} - Image ${i + 1}`,
            order: i,
          },
        });
      }
    }

    productCount++;
  }
  console.log(`✅ Products: ${productCount}`);

  // ─── Addresses ──────────────────────────────────────

  await prisma.address.create({
    data: {
      userId: client.id,
      name: "Home",
      phone: "+95911111111",
      street: "123 Main Street, Block A",
      city: "Yangon",
      district: "Thanlyin",
      state: "Yangon Region",
      postalCode: "11221",
      isDefault: true,
    },
  });
  console.log(`✅ Addresses: 1`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test Accounts:");
  console.log("   Admin:  admin@crossmart.com / Admin123!");
  console.log("   Seller: seller@crossmart.com / Seller123!");
  console.log("   Client: client@crossmart.com / Client123!");
  console.log(`\n📦 Total Products: ${productCount}`);
  console.log("📷 Products with images: All products have Unsplash images");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
