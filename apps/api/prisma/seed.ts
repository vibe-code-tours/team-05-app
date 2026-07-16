import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── User Data ─────────────────────────────────────────

const ADMIN_DATA = [
  {
    email: "admin@crossmart.com",
    phone: "+95912345678",
    name: "CrossMart Admin",
    password: "Admin123!",
    role: "ADMIN" as const,
    status: "ACTIVE" as const,
  },
];

const SELLER_DATA = [
  {
    email: "seller1@crossmart.com",
    phone: "+95998765432",
    name: "TechZone Myanmar",
    password: "Seller123!",
    role: "SELLER" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "seller2@crossmart.com",
    phone: "+95998765433",
    name: "Bangkok Gadgets",
    password: "Seller123!",
    role: "SELLER" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "seller3@crossmart.com",
    phone: "+95998765434",
    name: "Digital World",
    password: "Seller123!",
    role: "SELLER" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "seller4@crossmart.com",
    phone: "+95998765435",
    name: "Premium Electronics",
    password: "Seller123!",
    role: "SELLER" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "seller5@crossmart.com",
    phone: "+95998765436",
    name: "Myanmar Tech Hub",
    password: "Seller123!",
    role: "SELLER" as const,
    status: "ACTIVE" as const,
  },
];

const CLIENT_DATA = [
  {
    email: "client1@crossmart.com",
    phone: "+95911111111",
    name: "Aung Aung",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client2@crossmart.com",
    phone: "+95922222222",
    name: "Mya Mya",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client3@crossmart.com",
    phone: "+95933333333",
    name: "Tun Tun",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client4@crossmart.com",
    phone: "+95944444444",
    name: "San San",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client5@crossmart.com",
    phone: "+95955555555",
    name: "Kyaw Kyaw",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client6@crossmart.com",
    phone: "+95966666666",
    name: "Nwe Nwe",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client7@crossmart.com",
    phone: "+95977777777",
    name: "Zaw Zaw",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client8@crossmart.com",
    phone: "+95988888888",
    name: "Thin Thin",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client9@crossmart.com",
    phone: "+95999999999",
    name: "Hla Hla",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
  {
    email: "client10@crossmart.com",
    phone: "+95900000000",
    name: "Lwin Lwin",
    password: "Client123!",
    role: "CLIENT" as const,
    status: "ACTIVE" as const,
  },
];

async function seedUsers(
  label: string,
  data: Array<{
    email: string;
    phone: string;
    name: string;
    password: string;
    role: "ADMIN" | "SELLER" | "CLIENT";
    status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "BANNED";
  }>
) {
  const hashed = await bcrypt.hash(data[0].password, 12);
  const users = [];

  for (const u of data) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        phone: u.phone,
        name: u.name,
        password: hashed,
        role: u.role,
        status: u.status,
      },
    });
    users.push(user);
    console.log(`  ✅ ${u.role}: ${u.email}`);
  }

  console.log(`✅ ${label}: ${users.length} users created`);
  return users;
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Users ──────────────────────────────────────────

  console.log("👤 Creating Admin...");
  const admins = await seedUsers("Admins", ADMIN_DATA);

  console.log("\n🏪 Creating Sellers...");
  const sellers = await seedUsers("Sellers", SELLER_DATA);

  console.log("\n🛒 Creating Clients...");
  const clients = await seedUsers("Clients", CLIENT_DATA);

  // ─── Categories ─────────────────────────────────────

  console.log("\n📂 Creating Categories...");
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

  console.log("\n🏷️  Creating Brands...");
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

  console.log("\n📦 Creating Sample Products...");
  const cameraCategory = await prisma.category.findUnique({ where: { slug: "camera" } });
  const sonyBrand = await prisma.brand.findUnique({ where: { slug: "sony" } });
  const seller1 = sellers[0]; // first seller

  if (cameraCategory && sonyBrand && seller1) {
    const products = [
      {
        sellerId: seller1.id,
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
        sellerId: seller1.id,
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

  console.log("\n📍 Creating Addresses...");
  const firstClient = clients[0];
  if (firstClient) {
    await prisma.address.create({
      data: {
        userId: firstClient.id,
        name: "Home",
        phone: firstClient.phone,
        street: "123 Main Street, Block A",
        city: "Yangon",
        district: "Thanlyin",
        state: "Yangon Region",
        postalCode: "11221",
        isDefault: true,
      },
    });
    console.log(`✅ Addresses: 1`);
  }

  // ─── Summary ────────────────────────────────────────

  console.log("\n🎉 Seeding complete!\n");
  console.log("📋 Test Accounts:");
  console.log("─".repeat(50));
  console.log("ADMIN:");
  console.log(`  ${admins[0].email} / Admin123!`);
  console.log("\nSELLERS:");
  for (const s of sellers) {
    console.log(`  ${s.email} / Seller123!`);
  }
  console.log("\nCLIENTS:");
  for (const c of clients) {
    console.log(`  ${c.email} / Client123!`);
  }
  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
