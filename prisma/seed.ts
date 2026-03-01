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

  // Create fake fixer users with FixerProfiles
  console.log("\n🔧 Creating fake fixers...");

  const fixer1 = await prisma.user.upsert({
    where: { email: "jan@fixermail.com" },
    update: {},
    create: {
      email: "jan@fixermail.com",
      passwordHash,
      name: "Jan de Reparateur",
      avatarUrl: null,
      city: "Amsterdam",
      userType: "FIXER",
    },
  });
  console.log(`✅ Created fixer: ${fixer1.name}`);

  const fixer1Profile = await prisma.fixerProfile.upsert({
    where: { userId: fixer1.id },
    update: {},
    create: {
      userId: fixer1.id,
      bio: "Experienced bike and electronics repair specialist with 10 years of experience. I can fix almost anything!",
      skills: ["bikes-scooters", "phones-tablets", "laptops-computers", "home-electronics"],
      serviceRadiusKm: 15,
      minJobFee: 15,
      averageRating: 4.8,
      totalJobs: 52,
      verifiedBadge: true,
    },
  });
  console.log(`✅ Created fixer profile for ${fixer1.name}`);

  const fixer2 = await prisma.user.upsert({
    where: { email: "maria@fixermail.com" },
    update: {},
    create: {
      email: "maria@fixermail.com",
      passwordHash,
      name: "Maria van der Berg",
      avatarUrl: null,
      city: "Rotterdam",
      userType: "FIXER",
    },
  });
  console.log(`✅ Created fixer: ${fixer2.name}`);

  const fixer2Profile = await prisma.fixerProfile.upsert({
    where: { userId: fixer2.id },
    update: {},
    create: {
      userId: fixer2.id,
      bio: "Appliance repair specialist. I fix washing machines, dishwashers, fridges, and more. Quick and reliable service.",
      skills: ["kitchen-appliances", "laundry-appliances", "home-electronics", "plumbing"],
      serviceRadiusKm: 20,
      minJobFee: 25,
      averageRating: 4.6,
      totalJobs: 38,
      verifiedBadge: false,
    },
  });
  console.log(`✅ Created fixer profile for ${fixer2.name}`);

  // Get all repair requests to add offers to
  const allRequests = await prisma.repairRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Create fake offers
  console.log("\n💼 Creating fake offers...");

  if (allRequests.length > 0) {
    // Offer 1: Jan offers on the first request (bike chain)
    await prisma.offer.create({
      data: {
        repairRequestId: allRequests[0].id,
        fixerId: fixer1.id,
        price: 35,
        estimatedTime: "1 hour",
        message:
          "Hi! I'm Jan and I've been fixing bikes for over 10 years. A broken chain is a quick fix - I can come to you or you can drop it off at my workshop. I have the parts ready and can do it same day. Looking forward to helping you get back on the road!",
        status: "PENDING",
      },
    });
    console.log(`✅ Created offer for: ${allRequests[0].title}`);

    // Offer 2: Maria offers on the washing machine request
    const washingMachineRequest = allRequests.find((r) =>
      r.title.toLowerCase().includes("washing machine")
    );
    if (washingMachineRequest) {
      await prisma.offer.create({
        data: {
          repairRequestId: washingMachineRequest.id,
          fixerId: fixer2.id,
          price: 65,
          estimatedTime: "2 hours",
          message:
            "Hello! I specialize in washing machine repairs. Based on your description, it sounds like the drain pump might be clogged or faulty. I can diagnose and fix it on-site. I'll bring all necessary tools and spare parts. Available this week.",
          status: "PENDING",
        },
      });
      console.log(`✅ Created offer for: ${washingMachineRequest.title}`);
    }

    // Offer 3: Jan offers on iPhone screen
    const iphoneRequest = allRequests.find((r) =>
      r.title.toLowerCase().includes("iphone")
    );
    if (iphoneRequest) {
      await prisma.offer.create({
        data: {
          repairRequestId: iphoneRequest.id,
          fixerId: fixer1.id,
          price: 89,
          estimatedTime: "45 minutes",
          message:
            "Hi! I can replace your iPhone 13 screen with a high-quality replacement. I use original quality parts and the repair is quick - usually done within 45 minutes. I offer a 6-month warranty on the screen. I can come to your location or you can visit my workshop.",
          status: "PENDING",
        },
      });
      console.log(`✅ Created offer for: ${iphoneRequest.title}`);
    }

    // Offer 4: Maria also offers on iPhone (competing offer)
    if (iphoneRequest) {
      await prisma.offer.create({
        data: {
          repairRequestId: iphoneRequest.id,
          fixerId: fixer2.id,
          price: 79,
          estimatedTime: "1 hour",
          message:
            "Hello! I can replace your iPhone screen today. I have experience with all iPhone models and use quality replacement screens. Price includes parts and labor. Let me know if you have any questions!",
          status: "PENDING",
        },
      });
      console.log(`✅ Created competing offer for: ${iphoneRequest.title}`);
    }

    // Offer 5: Jan offers on laptop keyboard
    const laptopRequest = allRequests.find((r) =>
      r.title.toLowerCase().includes("laptop")
    );
    if (laptopRequest) {
      await prisma.offer.create({
        data: {
          repairRequestId: laptopRequest.id,
          fixerId: fixer1.id,
          price: 45,
          estimatedTime: "1.5 hours",
          message:
            "Hi! Sticky keyboard keys are usually fixable with a good cleaning. If the keyboard needs replacement, I can do that too. I'll diagnose it first and let you know the best solution. My price includes diagnosis and cleaning, or replacement if needed.",
          status: "PENDING",
        },
      });
      console.log(`✅ Created offer for: ${laptopRequest.title}`);
    }
  }

  // Create some completed jobs and reviews
  console.log("\n📝 Creating completed jobs and reviews...");

  // First, we need to create some completed jobs
  const completedJob1 = await prisma.job.create({
    data: {
      repairRequestId: allRequests[0].id,
      offerId: (await prisma.offer.findFirst({ where: { fixerId: fixer1.id } }))!.id,
      customerId: user1.id,
      fixerId: fixer1.id,
      agreedPrice: 75,
      platformFee: 11.25,
      fixerPayout: 63.75,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });
  console.log(`✅ Created completed job 1`);

  const completedJob2 = await prisma.job.create({
    data: {
      repairRequestId: allRequests[1].id,
      offerId: (await prisma.offer.findFirst({ where: { fixerId: fixer2.id } }))!.id,
      customerId: user2.id,
      fixerId: fixer2.id,
      agreedPrice: 89,
      platformFee: 13.35,
      fixerPayout: 75.65,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
  });
  console.log(`✅ Created completed job 2`);

  // Add reviews for the completed jobs
  await prisma.review.create({
    data: {
      jobId: completedJob1.id,
      reviewerId: user1.id,
      reviewedId: fixer1.id,
      rating: 5,
      comment: "Fixed my bike chain in 20 minutes. Very friendly and professional!",
    },
  });
  console.log(`✅ Created review from user1 for fixer1`);

  await prisma.review.create({
    data: {
      jobId: completedJob1.id,
      reviewerId: fixer1.id,
      reviewedId: user1.id,
      rating: 5,
      comment: "Great customer, clear communication and punctual!",
    },
  });
  console.log(`✅ Created review from fixer1 for user1`);

  await prisma.review.create({
    data: {
      jobId: completedJob2.id,
      reviewerId: user2.id,
      reviewedId: fixer2.id,
      rating: 4,
      comment: "Good job on the phone screen. Looks like new. Took a bit longer than expected but good result.",
    },
  });
  console.log(`✅ Created review from user2 for fixer2`);

  await prisma.review.create({
    data: {
      jobId: completedJob2.id,
      reviewerId: fixer2.id,
      reviewedId: user2.id,
      rating: 5,
      comment: "Nice person to work with, would fix for them again!",
    },
  });
  console.log(`✅ Created review from fixer2 for user2`);

  // Add a few more reviews for fixer1
  const completedJob3 = await prisma.job.create({
    data: {
      repairRequestId: allRequests[2].id,
      offerId: (await prisma.offer.findFirst({ where: { fixerId: fixer1.id, repairRequestId: allRequests[2].id } }))!.id,
      customerId: user1.id,
      fixerId: fixer1.id,
      agreedPrice: 120,
      platformFee: 18,
      fixerPayout: 102,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.review.create({
    data: {
      jobId: completedJob3.id,
      reviewerId: user1.id,
      reviewedId: fixer1.id,
      rating: 5,
      comment: "Came on time, did the work quickly. Fair price. Highly recommend!",
    },
  });
  console.log(`✅ Created additional review for fixer1`);

  const completedJob4 = await prisma.job.create({
    data: {
      repairRequestId: allRequests[3].id,
      offerId: (await prisma.offer.findFirst({ where: { fixerId: fixer1.id, repairRequestId: allRequests[3].id } }))!.id,
      customerId: user2.id,
      fixerId: fixer1.id,
      agreedPrice: 95,
      platformFee: 14.25,
      fixerPayout: 80.75,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.review.create({
    data: {
      jobId: completedJob4.id,
      reviewerId: user2.id,
      reviewedId: fixer1.id,
      rating: 4,
      comment: "Very knowledgeable and explained everything clearly. Good work!",
    },
  });
  console.log(`✅ Created additional review for fixer1`);

  // Update fixer profiles with calculated average ratings
  const fixer1Reviews = await prisma.review.findMany({
    where: { reviewedId: fixer1.id },
    select: { rating: true },
  });
  const fixer1AvgRating = fixer1Reviews.reduce((sum, r) => sum + r.rating, 0) / fixer1Reviews.length;

  await prisma.fixerProfile.update({
    where: { userId: fixer1.id },
    data: {
      averageRating: fixer1AvgRating,
      totalJobs: 3,
      totalEarnings: 246.50,
    },
  });
  console.log(`✅ Updated fixer1 profile with average rating: ${fixer1AvgRating.toFixed(1)}`);

  const fixer2Reviews = await prisma.review.findMany({
    where: { reviewedId: fixer2.id },
    select: { rating: true },
  });
  const fixer2AvgRating = fixer2Reviews.reduce((sum, r) => sum + r.rating, 0) / fixer2Reviews.length;

  await prisma.fixerProfile.update({
    where: { userId: fixer2.id },
    data: {
      averageRating: fixer2AvgRating,
      totalJobs: 1,
      totalEarnings: 75.65,
    },
  });
  console.log(`✅ Updated fixer2 profile with average rating: ${fixer2AvgRating.toFixed(1)}`);

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
