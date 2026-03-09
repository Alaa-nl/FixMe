import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import StarRating from "@/components/review/StarRating";
import ReviewList from "@/components/review/ReviewList";
import { CategoryIcon } from "@/lib/categoryIconsReact";
import { MapPin, Briefcase, Calendar, ShieldCheck, Zap, Star } from "lucide-react";
import ServiceAreaPreviewClient from "@/components/map/ServiceAreaPreviewClient";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      fixerProfile: true,
      reviewsReceived: {
        select: { rating: true },
      },
      _count: {
        select: { jobsAsCustomer: true, jobsAsFixer: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isFixer = user.userType === "FIXER" && !!user.fixerProfile;

  // Compute member-since
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Compute review stats from the included relation
  const totalReviews = user.reviewsReceived.length;
  const averageRating =
    totalReviews > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Fetch skill categories for fixers
  let skillCategories: { id: string; slug: string; name: string }[] = [];
  if (isFixer && user.fixerProfile!.skills.length > 0) {
    skillCategories = await prisma.category.findMany({
      where: { slug: { in: user.fixerProfile!.skills } },
      select: { id: true, slug: true, name: true },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* ─── Profile Header Card ─── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-100 shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-orange-400 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-orange-100 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left min-w-0">
              {/* Name + badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {user.name}
                </h1>
                {isFixer && user.fixerProfile!.kvkVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              {/* Rating row */}
              {totalReviews > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <StarRating rating={averageRating} size="md" readOnly />
                  <span className="text-sm text-gray-500">
                    ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {/* Bio */}
              {isFixer && user.fixerProfile!.bio && (
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {user.fixerProfile!.bio}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-gray-500">
                {user.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.city}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {user._count.jobsAsCustomer + user._count.jobsAsFixer} job{(user._count.jobsAsCustomer + user._count.jobsAsFixer) !== 1 ? "s" : ""} completed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Skills (fixers only) ─── */}
        {isFixer && skillCategories.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Skills &amp; Services</h2>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-primary text-sm font-medium rounded-full"
                >
                  <CategoryIcon slug={cat.slug} className="w-4 h-4" />
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Badges (fixers only) ─── */}
        {isFixer && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Badges</h2>
            <div className="flex flex-wrap gap-3">
              {user.fixerProfile!.kvkVerified && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Verified</p>
                    <p className="text-xs text-blue-700">KVK verified professional</p>
                  </div>
                </div>
              )}
              {user.fixerProfile!.totalJobs >= 10 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900 text-sm">Top Fixer</p>
                    <p className="text-xs text-yellow-700">10+ jobs completed</p>
                  </div>
                </div>
              )}
              {averageRating >= 4.5 && totalReviews >= 5 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900 text-sm">Highly Rated</p>
                    <p className="text-xs text-purple-700">4.5+ average rating</p>
                  </div>
                </div>
              )}
              {!user.fixerProfile!.kvkVerified &&
                user.fixerProfile!.totalJobs < 10 &&
                !(averageRating >= 4.5 && totalReviews >= 5) && (
                  <p className="text-gray-500 text-sm">No badges earned yet</p>
                )}
            </div>
          </div>
        )}

        {/* ─── Service Area Map (fixers with location only) ─── */}
        {isFixer && user.locationLat && user.locationLng && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Service Area</h2>
            <ServiceAreaPreviewClient
              lat={user.locationLat}
              lng={user.locationLng}
              radiusKm={user.fixerProfile!.serviceRadiusKm}
              city={user.city || "Unknown"}
            />
          </div>
        )}

        {/* ─── Reviews ─── */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews</h2>
          <ReviewList userId={user.id} />
        </div>
      </div>
    </div>
  );
}
