import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCategoryIcon } from "@/lib/categoryIcons";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { repairRequests: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Category Header */}
        <div className="bg-white rounded-xl p-8 md:p-12 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon */}
            <div className="text-7xl md:text-8xl">
              {getCategoryIcon(category.slug)}
            </div>

            {/* Info */}
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
                    ? "No active requests"
                    : category._count.repairRequests === 1
                    ? "1 active request"
                    : `${category._count.repairRequests} active requests`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Repair Requests Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Repair requests in {category.name}
            </h2>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No repair requests yet in this category
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to post one!
              </p>
              <Link href="/post">
                <Button variant="primary" size="lg">
                  Post a request
                </Button>
              </Link>
            </div>
          </div>

          {/* TODO: Later we will replace the empty state with actual repair request cards */}
        </div>
      </div>
    </div>
  );
}
