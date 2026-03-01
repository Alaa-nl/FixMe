import { PrismaClient, Timeline, Mobility } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  // Create fake customer users
  console.log("\n👤 Creating fake users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "anna@example.com" },
    update: {},
    create: {
      email: "anna@example.com",
      passwordHash,
      name: "Anna de Vries",
      avatarUrl: null,
      city: "Amsterdam",
      userType: "CUSTOMER",
    },
  });
  console.log(`✅ Created user: ${user1.name}`);

  const user2 = await prisma.user.upsert({
    where: { email: "pieter@example.com" },
    update: {},
    create: {
      email: "pieter@example.com",
      passwordHash,
      name: "Pieter van Dam",
      avatarUrl: null,
      city: "Rotterdam",
      userType: "CUSTOMER",
    },
  });
  console.log(`✅ Created user: ${user2.name}`);

  // Get all categories for reference
  const allCategories = await prisma.category.findMany();
  const categoryMap: Record<string, string> = {};
  allCategories.forEach((cat) => {
    categoryMap[cat.slug] = cat.id;
  });

  // Create fake repair requests
  console.log("\n🔧 Creating fake repair requests...");

  const repairRequests = [
    {
      customerId: user1.id,
      title: "Broken bike chain needs replacement",
      description:
        "My bike chain broke while cycling to work this morning. The chain is completely snapped and needs to be replaced. The bike is a standard city bike.",
      categoryId: categoryMap["bikes-scooters"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Amsterdam",
      locationLat: 52.3676,
      locationLng: 4.9041,
      timeline: Timeline.URGENT,
      mobility: Mobility.BRING_TO_FIXER,
    },
    {
      customerId: user2.id,
      title: "iPhone 13 screen cracked",
      description:
        "I dropped my iPhone 13 and the screen is badly cracked. The phone still works but the glass is shattered. Need screen replacement.",
      categoryId: categoryMap["phones-tablets"],
      photos: ["/uploads/placeholder.jpg", "/uploads/placeholder.jpg"],
      city: "Amsterdam",
      locationLat: 52.3676,
      locationLng: 4.9041,
      timeline: Timeline.THIS_WEEK,
      mobility: Mobility.FIXER_COMES_TO_ME,
    },
    {
      customerId: user1.id,
      title: "Washing machine not spinning",
      description:
        "My washing machine completes the wash cycle but doesn't spin to drain the water. The clothes come out soaking wet. It's a Bosch model about 5 years old.",
      categoryId: categoryMap["laundry-appliances"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Rotterdam",
      locationLat: 51.9244,
      locationLng: 4.4777,
      timeline: Timeline.THIS_WEEK,
      mobility: Mobility.FIXER_COMES_TO_ME,
    },
    {
      customerId: user2.id,
      title: "Wobbly kitchen table leg",
      description:
        "One of the legs on my wooden kitchen table has become loose and wobbly. It needs to be tightened or reattached properly.",
      categoryId: categoryMap["furniture"],
      photos: ["/uploads/placeholder.jpg", "/uploads/placeholder.jpg"],
      city: "Utrecht",
      locationLat: 52.0907,
      locationLng: 5.1214,
      timeline: Timeline.NO_RUSH,
      mobility: Mobility.BRING_TO_FIXER,
    },
    {
      customerId: user1.id,
      title: "Laptop keyboard keys stuck",
      description:
        "Several keys on my Dell laptop keyboard are sticky and not responding properly. I think something was spilled on it. Keys affected: A, S, D, and spacebar.",
      categoryId: categoryMap["laptops-computers"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Amsterdam",
      locationLat: 52.3676,
      locationLng: 4.9041,
      timeline: Timeline.THIS_WEEK,
      mobility: Mobility.BRING_TO_FIXER,
    },
    {
      customerId: user2.id,
      title: "Microwave not heating food",
      description:
        "My microwave turns on and the turntable spins, but it's not heating the food at all. It's a Samsung microwave, about 3 years old.",
      categoryId: categoryMap["kitchen-appliances"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Rotterdam",
      locationLat: 51.9244,
      locationLng: 4.4777,
      timeline: Timeline.NO_RUSH,
      mobility: Mobility.FIXER_COMES_TO_ME,
    },
    {
      customerId: user1.id,
      title: "TV won't turn on - red light blinking",
      description:
        "My LG smart TV won't turn on. There's a red light blinking on the front panel. I've tried unplugging it and plugging it back in but no luck.",
      categoryId: categoryMap["home-electronics"],
      photos: ["/uploads/placeholder.jpg", "/uploads/placeholder.jpg"],
      city: "Utrecht",
      locationLat: 52.0907,
      locationLng: 5.1214,
      timeline: Timeline.THIS_WEEK,
      mobility: Mobility.FIXER_COMES_TO_ME,
    },
    {
      customerId: user2.id,
      title: "Leaking kitchen tap",
      description:
        "The tap in my kitchen sink has started leaking from the base. It drips constantly even when turned off completely. Wastes a lot of water.",
      categoryId: categoryMap["plumbing"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Amsterdam",
      locationLat: 52.3676,
      locationLng: 4.9041,
      timeline: Timeline.URGENT,
      mobility: Mobility.FIXER_COMES_TO_ME,
    },
    {
      customerId: user1.id,
      title: "Jacket zipper broken",
      description:
        "The zipper on my winter jacket is broken - it comes apart even when fully zipped up. The jacket is otherwise in perfect condition.",
      categoryId: categoryMap["clothing-shoes"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Rotterdam",
      locationLat: 51.9244,
      locationLng: 4.4777,
      timeline: Timeline.NO_RUSH,
      mobility: Mobility.BRING_TO_FIXER,
    },
    {
      customerId: user2.id,
      title: "Electric guitar buzzing sound",
      description:
        "My electric guitar makes a buzzing sound when I play certain notes. I think it might be the frets or the strings need adjustment.",
      categoryId: categoryMap["musical-instruments"],
      photos: ["/uploads/placeholder.jpg", "/uploads/placeholder.jpg"],
      city: "Utrecht",
      locationLat: 52.0907,
      locationLng: 5.1214,
      timeline: Timeline.NO_RUSH,
      mobility: Mobility.BRING_TO_FIXER,
    },
    {
      customerId: user1.id,
      title: "Lawn mower won't start",
      description:
        "My petrol lawn mower won't start. I've checked the fuel and it's full. The pull cord works but the engine doesn't fire up.",
      categoryId: categoryMap["garden-outdoor"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Amsterdam",
      locationLat: 52.3676,
      locationLng: 4.9041,
      timeline: Timeline.THIS_WEEK,
      mobility: Mobility.BRING_TO_FIXER,
    },
    {
      customerId: user2.id,
      title: "Office chair wheel broken",
      description:
        "One of the wheels on my office chair has broken off. The chair tilts to one side and is unusable. Need the wheel replaced.",
      categoryId: categoryMap["furniture"],
      photos: ["/uploads/placeholder.jpg"],
      city: "Amsterdam",
      locationLat: 52.3676,
      locationLng: 4.9041,
      timeline: Timeline.THIS_WEEK,
      mobility: Mobility.BRING_TO_FIXER,
    },
  ];

  for (const request of repairRequests) {
    await prisma.repairRequest.create({
      data: request,
    });
    console.log(`✅ Created repair request: ${request.title}`);
  }

  console.log("\n🎉 Seed completed successfully!");
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
