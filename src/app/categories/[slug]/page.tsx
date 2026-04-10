import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { CategoryIcon } from "@/lib/categoryIconsReact";
import { Wrench } from "lucide-react";
import Button from "@/components/ui/button";
import { getContentBySection } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category: Prisma.CategoryGetPayload<{ include: { _count: { select: { repairRequests: true } } } }> | null = null;

  try {
    category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { repairRequests: true },
        },
      },
    });
  } catch (error) {
    console.error("Category detail DB query failed:", error);
  }

  const content = await getContentBySection("category_detail");

  if (!category) {
    notFound();
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Category Header */}
        <div className="bg-white rounded-xl p-8 md:p-12 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CategoryIcon slug={category.slug} className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {category.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 justify-center md:justify-start">
                <span>
                  {category._count.repairRequests === 0
                    ? content["category_count_zero"]
                    : category._count.repairRequests === 1
                    ? content["category_count_singular"]
                    : content["category_count_plural"].replace("{n}", category._count.repairRequests.toString())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Repair Requests Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {content["category_requests_heading"].replace("{category}", category.name)}
            </h2>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {content["category_empty_title"]}
              </h3>
              <p className="text-gray-600 mb-6">
                {content["category_empty_desc"]}
              </p>
              <Link href="/post">
                <Button variant="primary" size="lg">
                  {content["category_empty_cta"]}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
