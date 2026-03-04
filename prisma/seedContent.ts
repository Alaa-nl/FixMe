import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const contentItems = [
  // Homepage Hero
  {
    id: "hero_title",
    section: "homepage",
    type: "text",
    value: "Don't throw it away. Fix it.",
    label: "Homepage Hero Title",
  },
  {
    id: "hero_subtitle",
    section: "homepage",
    type: "text",
    value: "Find local repair people for bikes, phones, appliances and more.",
    label: "Homepage Hero Subtitle",
  },
  {
    id: "hero_image",
    section: "homepage",
    type: "image",
    value: "/images/hero.jpg",
    label: "Homepage Hero Image",
  },
  {
    id: "hero_cta_primary",
    section: "homepage",
    type: "text",
    value: "Post a Repair Request",
    label: "Homepage Hero Primary Button",
  },
  {
    id: "hero_cta_secondary",
    section: "homepage",
    type: "text",
    value: "Become a Fixer",
    label: "Homepage Hero Secondary Button",
  },

  // Homepage Stats
  {
    id: "stats_repairs",
    section: "homepage",
    type: "text",
    value: "1,000+",
    label: "Homepage Stats - Repairs Number",
  },
  {
    id: "stats_fixers",
    section: "homepage",
    type: "text",
    value: "200+",
    label: "Homepage Stats - Fixers Number",
  },
  {
    id: "stats_cities",
    section: "homepage",
    type: "text",
    value: "Amsterdam",
    label: "Homepage Stats - Cities",
  },
  {
    id: "stats_repairs_label",
    section: "homepage",
    type: "text",
    value: "Repairs Completed",
    label: "Homepage Stats - Repairs Label",
  },
  {
    id: "stats_fixers_label",
    section: "homepage",
    type: "text",
    value: "Trusted Fixers",
    label: "Homepage Stats - Fixers Label",
  },
  {
    id: "stats_cities_label",
    section: "homepage",
    type: "text",
    value: "Cities Served",
    label: "Homepage Stats - Cities Label",
  },

  // How It Works
  {
    id: "how_it_works_title",
    section: "how_it_works",
    type: "text",
    value: "How FixMe Works",
    label: "How It Works Title",
  },
  {
    id: "how_it_works_step1_title",
    section: "how_it_works",
    type: "text",
    value: "1. Post Your Repair",
    label: "How It Works Step 1 Title",
  },
  {
    id: "how_it_works_step1_desc",
    section: "how_it_works",
    type: "text",
    value: "Describe what needs fixing. Add photos and location.",
    label: "How It Works Step 1 Description",
  },
  {
    id: "how_it_works_step2_title",
    section: "how_it_works",
    type: "text",
    value: "2. Get Offers",
    label: "How It Works Step 2 Title",
  },
  {
    id: "how_it_works_step2_desc",
    section: "how_it_works",
    type: "text",
    value: "Local fixers send you quotes and estimated times.",
    label: "How It Works Step 2 Description",
  },
  {
    id: "how_it_works_step3_title",
    section: "how_it_works",
    type: "text",
    value: "3. Choose & Pay",
    label: "How It Works Step 3 Title",
  },
  {
    id: "how_it_works_step3_desc",
    section: "how_it_works",
    type: "text",
    value: "Pick the best offer. Payment held securely until done.",
    label: "How It Works Step 3 Description",
  },
  {
    id: "how_it_works_step4_title",
    section: "how_it_works",
    type: "text",
    value: "4. Get It Fixed",
    label: "How It Works Step 4 Title",
  },
  {
    id: "how_it_works_step4_desc",
    section: "how_it_works",
    type: "text",
    value: "Your fixer completes the job. Leave a review when done.",
    label: "How It Works Step 4 Description",
  },

  // Categories Section
  {
    id: "categories_title",
    section: "homepage",
    type: "text",
    value: "What Can Be Fixed?",
    label: "Categories Section Title",
  },
  {
    id: "categories_subtitle",
    section: "homepage",
    type: "text",
    value: "From electronics to furniture, we fix it all.",
    label: "Categories Section Subtitle",
  },

  // Trust Section
  {
    id: "trust_title",
    section: "homepage",
    type: "text",
    value: "Why Choose FixMe?",
    label: "Trust Section Title",
  },
  {
    id: "trust_badge1_title",
    section: "homepage",
    type: "text",
    value: "Verified Fixers",
    label: "Trust Badge 1 Title",
  },
  {
    id: "trust_badge1_desc",
    section: "homepage",
    type: "text",
    value: "All fixers verified with KVK registration",
    label: "Trust Badge 1 Description",
  },
  {
    id: "trust_badge2_title",
    section: "homepage",
    type: "text",
    value: "Secure Payment",
    label: "Trust Badge 2 Title",
  },
  {
    id: "trust_badge2_desc",
    section: "homepage",
    type: "text",
    value: "Money held safely until job is complete",
    label: "Trust Badge 2 Description",
  },
  {
    id: "trust_badge3_title",
    section: "homepage",
    type: "text",
    value: "Customer Support",
    label: "Trust Badge 3 Title",
  },
  {
    id: "trust_badge3_desc",
    section: "homepage",
    type: "text",
    value: "We're here to help every step of the way",
    label: "Trust Badge 3 Description",
  },

  // Footer
  {
    id: "footer_about",
    section: "footer",
    type: "text",
    value:
      "FixMe is a Dutch repair marketplace connecting people who need repairs with local skilled fixers. We believe in sustainability and keeping things out of landfills.",
    label: "Footer About Text",
  },
  {
    id: "footer_tagline",
    section: "footer",
    type: "text",
    value: "Repair, Reuse, Reduce Waste",
    label: "Footer Tagline",
  },
  {
    id: "footer_copyright",
    section: "footer",
    type: "text",
    value: "© 2024 FixMe. All rights reserved.",
    label: "Footer Copyright",
  },

  // About Page
  {
    id: "about_hero_title",
    section: "about",
    type: "text",
    value: "About FixMe",
    label: "About Page Hero Title",
  },
  {
    id: "about_hero_subtitle",
    section: "about",
    type: "text",
    value: "We're on a mission to make repair accessible for everyone",
    label: "About Page Hero Subtitle",
  },
  {
    id: "about_mission_title",
    section: "about",
    type: "text",
    value: "Our Mission",
    label: "About Page Mission Title",
  },
  {
    id: "about_mission_text",
    section: "about",
    type: "text",
    value:
      "FixMe was born from a simple idea: why throw things away when they can be fixed? We connect people who need repairs with skilled local fixers, making it easy, safe, and affordable to extend the life of your belongings.",
    label: "About Page Mission Text",
  },
  {
    id: "about_values_title",
    section: "about",
    type: "text",
    value: "Our Values",
    label: "About Page Values Title",
  },
  {
    id: "about_value1_title",
    section: "about",
    type: "text",
    value: "Sustainability",
    label: "About Page Value 1 Title",
  },
  {
    id: "about_value1_desc",
    section: "about",
    type: "text",
    value: "Every repair keeps items out of landfills",
    label: "About Page Value 1 Description",
  },
  {
    id: "about_value2_title",
    section: "about",
    type: "text",
    value: "Community",
    label: "About Page Value 2 Title",
  },
  {
    id: "about_value2_desc",
    section: "about",
    type: "text",
    value: "Supporting local skilled workers",
    label: "About Page Value 2 Description",
  },
  {
    id: "about_value3_title",
    section: "about",
    type: "text",
    value: "Trust",
    label: "About Page Value 3 Title",
  },
  {
    id: "about_value3_desc",
    section: "about",
    type: "text",
    value: "Verified fixers and secure payments",
    label: "About Page Value 3 Description",
  },

  // Contact Page
  {
    id: "contact_hero_title",
    section: "contact",
    type: "text",
    value: "Get in Touch",
    label: "Contact Page Hero Title",
  },
  {
    id: "contact_hero_subtitle",
    section: "contact",
    type: "text",
    value: "We'd love to hear from you",
    label: "Contact Page Hero Subtitle",
  },
  {
    id: "contact_email",
    section: "contact",
    type: "text",
    value: "support@fixme.nl",
    label: "Contact Email",
  },
  {
    id: "contact_phone",
    section: "contact",
    type: "text",
    value: "+31 20 123 4567",
    label: "Contact Phone",
  },
  {
    id: "contact_address",
    section: "contact",
    type: "text",
    value: "Amsterdam, Netherlands",
    label: "Contact Address",
  },
];

async function seedContent() {
  console.log("Seeding site content...");

  for (const item of contentItems) {
    await prisma.siteContent.upsert({
      where: { id: item.id },
      update: {
        // Don't update value if it already exists (preserve custom changes)
        section: item.section,
        type: item.type,
        label: item.label,
      },
      create: item,
    });
  }

  console.log(`Seeded ${contentItems.length} content items`);
}

seedContent()
  .catch((e) => {
    console.error("Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
