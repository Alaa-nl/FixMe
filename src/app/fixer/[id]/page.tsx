import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import StarRating from "@/components/review/StarRating";
import ReviewList from "@/components/review/ReviewList";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface FixerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function FixerProfilePage({ params }: FixerProfilePageProps) {
  const { id } = await params;

  // Fetch fixer with profile
  const fixer = await prisma.user.findUnique({
    where: { id },
    include: {
      fixerProfile: true,
    },
  });

  // Validate user is a fixer
  if (!fixer || fixer.userType !== "FIXER" || !fixer.fixerProfile) {
    redirect("/browse");
  }

  // Get member since date
  const memberSince = new Date(fixer.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Get category names from skills (assuming skills are stored as category slugs)
  const skillCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: fixer.fixerProfile.skills || [],
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            {fixer.avatarUrl ? (
              <img
                src={fixer.avatarUrl}
                alt={fixer.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-3xl">
                {fixer.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{fixer.name}</h1>
                {fixer.fixerProfile.kvkVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                    title="Verified professional"
                  >
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating
                  rating={fixer.fixerProfile.averageRating}
                  size="md"
                  readOnly
                />
                <span className="text-sm text-gray-600">
                  ({fixer.fixerProfile.totalJobs} job{fixer.fixerProfile.totalJobs !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Bio */}
              {fixer.fixerProfile.bio && (
                <p className="text-gray-700 mb-4">{fixer.fixerProfile.bio}</p>
              )}

              {/* Info Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {fixer.city && (
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{fixer.city}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>🔧</span>
                  <span>{fixer.fixerProfile.totalJobs} jobs completed</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>💶</span>
                  <span>Member since {memberSince}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {skillCategories.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Skills & Services</h2>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-primary text-sm font-medium rounded-full"
                >
                  <span>{getCategoryIcon(category.slug)}</span>
                  <span>{category.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {fixer.fixerProfile.kvkVerified && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Verified</p>
                  <p className="text-xs text-blue-700">KVK verified professional</p>
                </div>
              </div>
            )}
            {fixer.fixerProfile.totalJobs >= 10 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-semibold text-yellow-900 text-sm">Top Fixer</p>
                  <p className="text-xs text-yellow-700">10+ jobs completed</p>
                </div>
              </div>
            )}
            {fixer.fixerProfile.averageRating >= 4.5 && fixer.fixerProfile.totalJobs >= 5 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold text-purple-900 text-sm">Highly Rated</p>
                  <p className="text-xs text-purple-700">4.5+ average rating</p>
                </div>
              </div>
            )}
            {!fixer.fixerProfile.kvkVerified && fixer.fixerProfile.totalJobs === 0 && (
              <p className="text-gray-500 text-sm">No badges earned yet</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
          <ReviewList userId={fixer.id} />
        </div>
      </div>
    </div>
  );
}
