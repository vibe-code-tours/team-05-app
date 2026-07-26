import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const shipments = await prisma.cargoTracking.findMany({
      where: {
        order: {
          sellerId: '123',
        },
      },
      include: {
        history: { orderBy: { timestamp: "asc" } },
        order: {
          select: { shippingAddress: true },
        },
      },
    });
    console.log("Success!");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
