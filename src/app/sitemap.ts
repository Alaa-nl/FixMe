import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fixme.nl";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/post`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamic pages — wrapped in try/catch so builds succeed when DB is unreachable
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const requests = await prisma.repairRequest.findMany({
      where: { status: "OPEN" },
      select: { id: true, updatedAt: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    });

    const requestPages: MetadataRoute.Sitemap = requests.map((request) => ({
      url: `${baseUrl}/request/${request.id}`,
      lastModified: request.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    }));

    const fixers = await prisma.user.findMany({
      where: {
        userType: "FIXER",
        fixerProfile: { isNot: null },
      },
      select: { id: true, updatedAt: true },
      take: 500,
    });

    const fixerPages: MetadataRoute.Sitemap = fixers.map((fixer) => ({
      url: `${baseUrl}/fixer/${fixer.id}`,
      lastModified: fixer.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...requestPages, ...fixerPages];
  } catch {
    // DB unavailable at build time — return static pages only
    return staticPages;
  }
}
