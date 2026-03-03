import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { DiagnosisResult } from "@/lib/claude";
import JobTimeline from "@/components/job/JobTimeline";
import JobActions from "@/components/job/JobActions";
import ReviewForm from "@/components/review/ReviewForm";
import ReviewCard from "@/components/review/ReviewCard";
import DisputeForm from "@/components/dispute/DisputeForm";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/jobs/${id}`);
  }

  // Fetch job with all relations
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      repairRequest: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          conversations: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      fixer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          fixerProfile: {
            select: {
              averageRating: true,
              totalJobs: true,
            },
          },
        },
      },
      offer: {
        select: {
          id: true,
          price: true,
          estimatedTime: true,
          message: true,
        },
      },
      payments: true,
      reviews: true,
      disputes: {
        include: {
          openedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!job) {
    redirect("/dashboard");
  }

  // Validate user is either customer or fixer
  const userId = session.user.id;
  const isCustomer = job.customerId === userId;
  const isFixer = job.fixerId === userId;

  if (!isCustomer && !isFixer) {
    redirect("/dashboard");
  }

  // Get the other person's info for chat link
  const otherPerson = isCustomer ? job.fixer : job.customer;

  // Find the conversation for this job (match customer and fixer)
  const conversation = job.repairRequest.conversations?.find(
    (conv: any) => conv.customerId === job.customerId && conv.fixerId === job.fixerId
  );

  // Status banner config
  const getStatusBanner = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return {
          bg: "bg-blue-500",
          text: "🗓 Job Scheduled — waiting for the fixer to start",
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-primary",
          text: "🔧 Repair In Progress",
        };
      case "COMPLETED":
        return {
          bg: "bg-green-600",
          text: "✅ Job Completed",
        };
      case "DISPUTED":
        return {
          bg: "bg-red-600",
          text: "⚠️ Dispute Open",
        };
      case "REFUNDED":
        return {
          bg: "bg-gray-500",
          text: "💸 Refunded",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: status,
        };
    }
  };

  const statusBanner = getStatusBanner(job.status);

  // Parse AI diagnosis if available
  const aiDiagnosis = job.repairRequest.aiDiagnosis as DiagnosisResult | null;

  // Calculate payment breakdown
  const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;
  const platformFee = payment?.platformFee || job.agreedPrice * 0.15;
  const fixerPayout = payment?.fixerPayout || job.agreedPrice * 0.85;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Status Banner */}
      <div className={`${statusBanner.bg} text-white py-3`}>
        <div className="max-w-7xl mx-auto px-4 text-center font-semibold">
          {statusBanner.text}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {job.repairRequest.title}
          </h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-primary text-sm font-medium rounded-full">
            <span>{getCategoryIcon(job.repairRequest.category.slug)}</span>
            <span>{job.repairRequest.category.name}</span>
          </span>
        </div>

        {/* Main Content - Two columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Repair Request Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Repair request</h2>

              {/* Photo Gallery */}
              {job.repairRequest.photos && job.repairRequest.photos.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto">
                  {job.repairRequest.photos.slice(0, 4).map((photo: string, idx: number) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.repairRequest.description}
                </p>
              </div>

              {/* AI Diagnosis */}
              {aiDiagnosis && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <h3 className="font-semibold text-purple-900">AI Diagnosis</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-purple-900">
                      <strong>Item:</strong> {aiDiagnosis.itemIdentification}
                    </p>
                    <p className="text-purple-800">
                      <strong>Problem:</strong> {aiDiagnosis.problemDiagnosis}
                    </p>
                    <p className="text-purple-700">
                      <strong>Difficulty:</strong> {aiDiagnosis.repairDifficulty} •{" "}
                      <strong>Estimated:</strong> €{aiDiagnosis.estimatedCostMin}-€
                      {aiDiagnosis.estimatedCostMax}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Job Timeline */}
            <JobTimeline job={job} />

            {/* Messages Shortcut */}
            {conversation && (
              <Link
                href={`/messages/${conversation.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💬</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Chat with {otherPerson.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Go to messages to discuss the repair
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Reviews Section (only for completed jobs) */}
            {job.status === "COMPLETED" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>

                {/* Check if current user has reviewed */}
                {!job.reviews.some((r: any) => r.reviewerId === userId) ? (
                  <ReviewForm
                    jobId={job.id}
                    reviewedUserName={otherPerson.name}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Show all reviews */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {job.reviews.map((review: any) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dispute Section */}
            {isCustomer && (
              <div>
                {job.disputes && job.disputes.length > 0 ? (
                  /* Show existing dispute */
                  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-red-900 mb-2">
                      ⚠️ Dispute open
                    </h3>
                    <p className="text-red-800 mb-4">
                      A dispute has been opened for this job. The payment is on hold
                      pending admin review.
                    </p>
                    <Link
                      href={`/disputes/${job.disputes[0].id}`}
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      View dispute details
                    </Link>
                  </div>
                ) : (
                  /* Show dispute form option if eligible */
                  (job.status === "IN_PROGRESS" ||
                    (job.status === "COMPLETED" &&
                      job.completedAt &&
                      (Date.now() - new Date(job.completedAt).getTime()) /
                        (1000 * 60 * 60) <=
                        48)) && (
                    <DisputeForm
                      jobId={job.id}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="space-y-6">
            {/* Job Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Job details</h3>

              {/* Agreed Price */}
              <div className="mb-4">
                <div className="text-4xl font-bold text-primary mb-2">
                  €{job.agreedPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Repair cost:</span>
                    <span className="font-medium">€{job.agreedPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (15%):</span>
                    <span className="font-medium">€{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Fixer receives:</span>
                    <span className="font-medium">€{fixerPayout.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                {/* Fixer Info */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Fixer</p>
                  <div className="flex items-center gap-2">
                    {job.fixer.avatarUrl ? (
                      <img
                        src={job.fixer.avatarUrl}
                        alt={job.fixer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {job.fixer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{job.fixer.name}</p>
                      {job.fixer.fixerProfile && (
                        <p className="text-xs text-gray-600">
                          ⭐ {job.fixer.fixerProfile.averageRating.toFixed(1)} •{" "}
                          {job.fixer.fixerProfile.totalJobs} jobs
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <div className="flex items-center gap-2">
                    {job.customer.avatarUrl ? (
                      <img
                        src={job.customer.avatarUrl}
                        alt={job.customer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {job.customer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="font-medium text-gray-800">{job.customer.name}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                {/* Job Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : job.status === "IN_PROGRESS"
                        ? "bg-orange-100 text-orange-700"
                        : job.status === "SCHEDULED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <JobActions
                job={job}
                currentUserId={userId}
                currentUserType={session.user.userType || ""}
                isCustomer={isCustomer}
                isFixer={isFixer}
              />
            </div>

            {/* Offer Details (optional) */}
            {job.offer && job.offer.message && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Fixer's offer message</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {job.offer.message}
                </p>
                {job.offer.estimatedTime && (
                  <p className="text-sm text-gray-600 mt-2">
                    Estimated time: {job.offer.estimatedTime}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
