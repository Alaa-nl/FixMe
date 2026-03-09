import { PrismaClient } from "@prisma/client";
import { ALL_CONTENT_ITEMS } from "../src/lib/contentDefaults";

const prisma = new PrismaClient();

async function seedContent() {
  console.log("Seeding site content...");

  for (const item of ALL_CONTENT_ITEMS) {
    await prisma.siteContent.upsert({
      where: { id: item.id },
      update: {
        // Don't update value if it already exists (preserve custom changes)
        section: item.section,
        type: item.type,
        label: item.label,
      },
      create: {
        id: item.id,
        section: item.section,
        type: item.type,
        value: item.value,
        label: item.label,
      },
    });
  }

  console.log(`Seeded ${ALL_CONTENT_ITEMS.length} content items`);
}

seedContent()
  .catch((e) => {
    console.error("Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
