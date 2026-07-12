import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log(`✅ Brands: ${brands.length}`);

  // ─── Sample Products ────────────────────────────────

  const cameraCategory = await prisma.category.findUnique({ where: { slug: "camera" } });
  const sonyBrand = await prisma.brand.findUnique({ where: { slug: "sony" } });

  if (cameraCategory && sonyBrand) {
    const products = [
      {
        sellerId: seller.id,
        name: "Sony Alpha A7 IV",
        description: "Full-frame mirrorless camera with 33MP sensor, 4K 60p video, and advanced autofocus.",
        price: 2499.00,
        type: "IN_STOCK" as const,
        status: "APPROVED" as const,
        categoryId: cameraCategory.id,
        brandId: sonyBrand.id,
        stock: 15,
        slug: "sony-alpha-a7-iv",
      },
      {
        sellerId: seller.id,
        name: "Sony FX30",
        description: "Cinema line camera with Super 35 sensor, 4K 120p, and professional video features.",
        price: 1799.00,
        type: "CARGO" as const,
        status: "APPROVED" as const,
        categoryId: cameraCategory.id,
        brandId: sonyBrand.id,
        stock: 8,
        slug: "sony-fx30",
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }
    console.log(`✅ Products: ${products.length}`);
  }

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
