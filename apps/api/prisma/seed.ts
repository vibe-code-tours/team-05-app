import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
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
  console.log(`✅ Admin user: ${admin.email}`);

  // Create categories
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
  console.log(`✅ Categories seeded: ${categories.length}`);

  // Create brands
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
  console.log(`✅ Brands seeded: ${brands.length}`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
