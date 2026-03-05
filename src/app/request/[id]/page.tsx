import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { timeAgo } from "@/lib/utils";
import PhotoGallery from "@/components/request/PhotoGallery";
import DiagnosisCard from "@/components/ai/DiagnosisCard";
import OffersList from "@/components/offer/OffersList";
import OfferForm from "@/components/offer/OfferForm";
import Link from "next/link";
import Button from "@/components/ui/button";
import { DiagnosisResult } from "@/lib/claude";
import { haversineDistance } from "@/lib/geo";
import SuggestedFixers from "@/components/request/SuggestedFixers";
import RequestLocationMapClient from "@/components/map/RequestLocationMapClient";

export const dynamic = "force-dynamic";

interface RequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestPage({ params }: RequestPageProps) {
  const session = await auth();
  const { id } = await params;

  // Fetch the repair request
  const request = await prisma.repairRequest.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true,
          createdAt: true,
          _count: {
            select: { reviewsReceived: true, jobsAsCustomer: true, jobsAsFixer: true },
          },
        },
      },
      offers: {
        orderBy: { createdAt: "desc" },
        include: {
          fixer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              fixerProfile: {
                select: {
                  averageRating: true,
                  totalJobs: true,
                  verifiedBadge: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  const isRequestOwner = session?.user?.id === request.customer.id;
  const isLoggedIn = !!session?.user;

  // Check if current user is a fixer
  let isFixer = false;
  let hasAlreadyOffered = false;
  if (isLoggedIn && session.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    isFixer = user?.userType === "FIXER";

    // Check if fixer has already made an offer
    if (isFixer) {
      const existingOffer = request.offers.find(
        (offer) => offer.fixer.id === session.user.id
      );
      hasAlreadyOffered = !!existingOffer;
    }
  }

  const canMakeOffer = isFixer && !hasAlreadyOffered && !isRequestOwner && request.status === "OPEN";

  // Suggest fixers for open requests visible to the customer
  let suggestedFixers: {
    id: string;
    name: string;
    avatarUrl: string | null;
    averageRating: number;
    totalJobs: number;
    distanceKm: number;
    verifiedBadge: boolean;
  }[] = [];

  if (request.status === "OPEN" && isRequestOwner) {
    const candidateFixers = await prisma.user.findMany({
      where: {
        userType: "FIXER",
        fixerProfile: {
          isActive: true,
          skills: { has: request.category.slug },
        },
        locationLat: { not: null },
        locationLng: { not: null },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        locationLat: true,
        locationLng: true,
        fixerProfile: {
          select: {
            averageRating: true,
            totalJobs: true,
            serviceRadiusKm: true,
            verifiedBadge: true,
          },
        },
      },
    });

    suggestedFixers = candidateFixers
      .map((fixer) => {
        const dist = haversineDistance(
          request.locationLat,
          request.locationLng,
          fixer.locationLat!,
          fixer.locationLng!
        );
        return {
          id: fixer.id,
          name: fixer.name,
          avatarUrl: fixer.avatarUrl,
          averageRating: fixer.fixerProfile!.averageRating,
          totalJobs: fixer.fixerProfile!.totalJobs,
          distanceKm: Math.round(dist * 10) / 10,
          verifiedBadge: fixer.fixerProfile!.verifiedBadge,
          serviceRadiusKm: fixer.fixerProfile!.serviceRadiusKm,
        };
      })
      // Only include fixers whose service radius covers this request
      .filter((f) => f.distanceKm <= f.serviceRadiusKm)
      // Score: 60% rating (normalized 0-5 → 0-1) + 40% experience (log scale)
      .sort((a, b) => {
        const scoreA = (a.averageRating / 5) * 0.6 + Math.min(Math.log10(a.totalJobs + 1) / 2, 1) * 0.4;
        const scoreB = (b.averageRating / 5) * 0.6 + Math.min(Math.log10(b.totalJobs + 1) / 2, 1) * 0.4;
        return scoreB - scoreA;
      })
      .slice(0, 3)
      // Remove serviceRadiusKm from final output
      .map(({ serviceRadiusKm, ...rest }) => rest);
  }

  // Parse AI diagnosis if available
  const aiDiagnosis = request.aiDiagnosis as DiagnosisResult | null;

  // Get timeline badge config
  const getTimelineBadge = () => {
    switch (request.timeline) {
      case "URGENT":
        return { text: "Urgent", color: "bg-red-500 text-white" };
      case "THIS_WEEK":
        return { text: "This week", color: "bg-yellow-500 text-white" };
      case "NO_RUSH":
        return { text: "No rush", color: "bg-green-500 text-white" };
    }
  };

  const timelineBadge = getTimelineBadge();

  // Get mobility text
  const mobilityText =
    request.mobility === "BRING_TO_FIXER"
      ? "Bring to fixer"
      : "Fixer comes to me";

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <PhotoGallery photos={request.photos} categorySlug={request.category.slug} />

            {/* Request Info */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-primary text-sm font-medium rounded-full">
                  <span>{getCategoryIcon(request.category.slug)}</span>
                  <span>{request.category.name}</span>
                </span>
              </div>

              {/* Status Banner */}
              {request.status !== "OPEN" && (
                <div className={`mb-6 px-4 py-3 rounded-lg border-2 ${
                  request.status === "IN_PROGRESS"
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : request.status === "COMPLETED"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : request.status === "CANCELLED"
                    ? "bg-gray-50 border-gray-200 text-gray-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {request.status === "IN_PROGRESS" && "🔧 In Progress"}
                      {request.status === "COMPLETED" && "✅ Completed"}
                      {request.status === "CANCELLED" && "❌ Cancelled"}
                      {request.status === "DISPUTED" && "⚠️ Disputed"}
                    </span>
                    <span className="text-sm">
                      {request.status === "IN_PROGRESS" && "An offer has been accepted and work is underway"}
                      {request.status === "COMPLETED" && "This repair has been completed"}
                      {request.status === "CANCELLED" && "This request has been cancelled"}
                      {request.status === "DISPUTED" && "This job is under dispute"}
                    </span>
                  </div>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {request.title}
              </h1>

              {/* Posted By */}
              <div className="flex items-center gap-3 mb-4">
                <Link href={`/profile/${request.customer.id}`}>
                  {request.customer.avatarUrl ? (
                    <img
                      src={request.customer.avatarUrl}
                      alt={request.customer.name}
                      className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold hover:ring-2 hover:ring-primary transition-all">
                      {request.customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <p className="text-sm text-gray-700">
                    Posted by{" "}
                    <Link href={`/profile/${request.customer.id}`} className="font-semibold hover:text-primary transition-colors">
                      {request.customer.name}
                    </Link>
                  </p>
                  <p className="text-xs text-gray-500">
                    <span suppressHydrationWarning>{timeAgo(request.createdAt)}</span>
                    {" · "}
                    {request.customer._count.reviewsReceived} review{request.customer._count.reviewsReceived !== 1 ? "s" : ""}
                    {" · "}
                    {request.customer._count.jobsAsCustomer + request.customer._count.jobsAsFixer} job{(request.customer._count.jobsAsCustomer + request.customer._count.jobsAsFixer) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Timeline & Mobility Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${timelineBadge.color}`}>
                  {timelineBadge.text}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                  {mobilityText}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <span>📍</span>
                <span>
                  {request.city}
                  {request.address && `, ${request.address}`}
                </span>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </p>
              </div>
            </div>

            {/* AI Diagnosis */}
            {aiDiagnosis && (
              <div>
                <DiagnosisCard diagnosis={aiDiagnosis} userType={isFixer ? "FIXER" : undefined} />
              </div>
            )}

            {/* Offers Section */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Offers ({request._count.offers})
              </h2>

              {request.offers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">💼</div>
                  <p className="text-gray-600">
                    {isRequestOwner
                      ? "No offers yet. Your request is visible to fixers in your area."
                      : "No offers yet. Be the first to make an offer!"}
                  </p>
                </div>
              ) : (
                <OffersList
                  offers={request.offers as any}
                  isRequestOwner={isRequestOwner}
                  requestStatus={request.status}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info Box */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Info</h3>

              <div className="space-y-4">
                {/* Estimated Cost — only visible to fixers */}
                {isFixer && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">💰 Estimated cost</div>
                    {aiDiagnosis ? (
                      <div className="text-lg font-semibold text-primary">
                        €{aiDiagnosis.estimatedCostMin} — €{aiDiagnosis.estimatedCostMax}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Waiting for offers</div>
                    )}
                  </div>
                )}

                {/* Location */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">📍 Location</div>
                  <div className="text-sm font-medium text-gray-800">{request.city}</div>
                </div>

                {/* Timeline */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">⏰ Timeline</div>
                  <div className="text-sm font-medium text-gray-800">{timelineBadge.text}</div>
                </div>

                {/* Mobility */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">📦 Mobility</div>
                  <div className="text-sm font-medium text-gray-800">{mobilityText}</div>
                </div>

                {/* Views (placeholder) */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">👁 Views</div>
                  <div className="text-sm font-medium text-gray-800">
                    {Math.floor(Math.random() * 100) + 20}
                  </div>
                </div>

                {/* Offers */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">💬 Offers</div>
                  <div className="text-sm font-medium text-gray-800">
                    {request._count.offers}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Fixers */}
            {isRequestOwner && request.status === "OPEN" && (
              <SuggestedFixers fixers={suggestedFixers} />
            )}

            {/* Location Map */}
            {request.locationLat && request.locationLng && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📍 Location</h3>
                <RequestLocationMapClient
                  lat={request.locationLat}
                  lng={request.locationLng}
                  city={request.city}
                />
              </div>
            )}

            {/* Make an Offer Box or Login Prompt */}
            {!isLoggedIn ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Want to make an offer?
                </h3>
                <p className="text-gray-600 mb-4">
                  Log in or register as a fixer to send an offer
                </p>
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full">
                    Log in
                  </Button>
                </Link>
              </div>
            ) : isRequestOwner ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Your Request</h3>
                <p className="text-sm text-gray-600">
                  This is your repair request. You can view and accept offers from fixers.
                </p>
                {request.status !== "OPEN" && (
                  <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
                    Status: <span className="font-semibold">{request.status}</span>
                  </div>
                )}
              </div>
            ) : !isFixer ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Want to make an offer?
                </h3>
                <p className="text-gray-600 mb-4">
                  You need to register as a fixer to make offers
                </p>
                <Link href="/register">
                  <Button variant="primary" size="lg" className="w-full">
                    Register as a fixer
                  </Button>
                </Link>
              </div>
            ) : hasAlreadyOffered ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Offer Sent</h3>
                <p className="text-sm text-gray-600">
                  You've already made an offer on this request. The customer will review it
                  and get back to you.
                </p>
              </div>
            ) : canMakeOffer ? (
              <OfferForm repairRequestId={request.id} />
            ) : (
              request.status !== "OPEN" && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">No Longer Available</h3>
                  <p className="text-sm text-gray-600">
                    This repair request is no longer accepting offers.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
