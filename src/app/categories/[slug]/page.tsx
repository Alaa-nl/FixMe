import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCategoryIcon } from "@/lib/categoryIcons";
import Button from "@/components/ui/button";
import { getContentBySection } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [category, content] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { repairRequests: true },
        },
      },
    }),
    getContentBySection("category_detail"),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Category Header */}
        <div className="bg-white rounded-xl p-8 md:p-12 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-7xl md:text-8xl">
              {getCategoryIcon(category.slug)}
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
              <div className="text-6xl mb-4">🔧</div>
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
