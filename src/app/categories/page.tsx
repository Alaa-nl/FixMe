import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCategoryIcon } from "@/lib/categoryIcons";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { repairRequests: true },
      },
    },
  });

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            All categories
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            What needs fixing?
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="text-center">
                {/* Emoji Icon */}
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.slug)}
                </div>

                {/* Category Name */}
                <h3 className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-primary transition-colors mb-2">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {category.description}
                </p>

                {/* Request Count */}
                <div className="text-xs text-primary font-medium">
                  {category._count.repairRequests === 0
                    ? "No requests yet"
                    : category._count.repairRequests === 1
                    ? "1 active request"
                    : `${category._count.repairRequests} active requests`}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              No categories available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
