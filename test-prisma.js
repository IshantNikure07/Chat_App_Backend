import prisma from "./src/config/prisma.js";

async function main() {
  try {
    console.log("Querying users...");
    const users = await prisma.user.findMany({
      take: 5
    });
    console.log("Users found:", users);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
