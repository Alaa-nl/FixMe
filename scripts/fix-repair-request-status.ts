import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking RepairRequest status values...\n");

  // Get all repair requests
  const requests = await prisma.repairRequest.findMany({
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  console.log(`Found ${requests.length} repair requests:\n`);

  let fixedCount = 0;
  let openCount = 0;

  for (const request of requests) {
    console.log(`- ${request.title}`);
    console.log(`  ID: ${request.id}`);
    console.log(`  Status: ${request.status} (type: ${typeof request.status})`);

    if (request.status === "OPEN") {
      openCount++;
      console.log(`  ✅ Already OPEN\n`);
    } else {
      console.log(`  ⚠️  Status is ${request.status || "null/undefined"}, fixing to OPEN...`);

      // Fix the status
      await prisma.repairRequest.update({
        where: { id: request.id },
        data: { status: "OPEN" },
      });

      fixedCount++;
      console.log(`  ✅ Fixed to OPEN\n`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Summary:`);
  console.log(`- Total requests: ${requests.length}`);
  console.log(`- Already OPEN: ${openCount}`);
  console.log(`- Fixed to OPEN: ${fixedCount}`);
  console.log("=".repeat(50) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
