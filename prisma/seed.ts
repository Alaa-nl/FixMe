import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const categories = [
    {
      name: "Bikes & Scooters",
      nameNl: "Fietsen & Scooters",
      slug: "bikes-scooters",
      description:
        "Flat tire, broken chain, brakes, lights, locks, electric bike battery",
    },
    {
      name: "Phones & Tablets",
      nameNl: "Telefoons & Tablets",
      slug: "phones-tablets",
      description:
        "Cracked screen, battery replacement, charging port, water damage",
    },
    {
      name: "Laptops & Computers",
      nameNl: "Laptops & Computers",
      slug: "laptops-computers",
      description:
        "Broken screen, keyboard, slow performance, virus removal, hardware upgrade",
    },
    {
      name: "Kitchen Appliances",
      nameNl: "Keukenapparatuur",
      slug: "kitchen-appliances",
      description:
        "Oven, dishwasher, microwave, coffee machine, blender, toaster",
    },
    {
      name: "Laundry Appliances",
      nameNl: "Wasapparatuur",
      slug: "laundry-appliances",
      description: "Washing machine, dryer, iron",
    },
    {
      name: "Home Electronics",
      nameNl: "Huiselektronica",
      slug: "home-electronics",
      description:
        "TV, speakers, game consoles, headphones, smart home devices",
    },
    {
      name: "Furniture",
      nameNl: "Meubels",
      slug: "furniture",
      description:
        "Broken chair, wobbly table, drawer repair, shelf mounting",
    },
    {
      name: "Clothing & Shoes",
      nameNl: "Kleding & Schoenen",
      slug: "clothing-shoes",
      description:
        "Zipper repair, button replacement, hem adjustment, shoe sole",
    },
    {
      name: "Plumbing",
      nameNl: "Loodgieter",
      slug: "plumbing",
      description: "Leaking tap, clogged drain, toilet issues",
    },
    {
      name: "Electrical",
      nameNl: "Elektra",
      slug: "electrical",
      description: "Broken light switch, socket replacement, lamp wiring",
    },
    {
      name: "Musical Instruments",
      nameNl: "Muziekinstrumenten",
      slug: "musical-instruments",
      description: "Guitar strings, piano tuning, drum repair",
    },
    {
      name: "Garden & Outdoor",
      nameNl: "Tuin & Buiten",
      slug: "garden-outdoor",
      description:
        "Lawn mower, garden tools, fence repair, outdoor furniture",
    },
    {
      name: "Cameras & Optics",
      nameNl: "Camera's & Optica",
      slug: "cameras-optics",
      description: "Camera repair, lens cleaning, binoculars",
    },
    {
      name: "Toys & Games",
      nameNl: "Speelgoed & Spellen",
      slug: "toys-games",
      description: "Broken toys, board game pieces, remote control cars",
    },
    {
      name: "Other",
      nameNl: "Overig",
      slug: "other",
      description: "Anything that does not fit in the other categories",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        nameNl: category.nameNl,
        description: category.description,
      },
      create: category,
    });
    console.log(`✅ Created/Updated category: ${category.name}`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
