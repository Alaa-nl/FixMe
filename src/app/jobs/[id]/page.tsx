import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platformSettings";
import Link from "next/link";
import { CheckCircle2, Star, Calendar, Wrench, AlertTriangle, RefreshCcw, Bot, MessageCircle } from "lucide-react";
import { CategoryIcon } from "@/lib/categoryIconsReact";
import { DiagnosisResult } from "@/lib/claude";
import JobTimeline from "@/components/job/JobTimeline";
import JobActions from "@/components/job/JobActions";
import ReviewForm from "@/components/review/ReviewForm";
import ReviewCard from "@/components/review/ReviewCard";
import DisputeForm from "@/components/dispute/DisputeForm";

export const dynamic = "force-dynamic";

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
          _count: {
            select: { reviewsReceived: true, jobsAsCustomer: true, jobsAsFixer: true },
          },
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
          _count: {
            select: { reviewsReceived: true, jobsAsCustomer: true, jobsAsFixer: true },
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
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          job: {
            select: {
              repairRequest: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
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

  if (!job || job.deletedAt) {
    redirect("/dashboard");
  }

  // Fetch platform settings for dispute window
  const settings = await getPlatformSettings();
  const disputeWindowHours = settings.disputeWindowHours;

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
          text: job.scheduledAt
            ? <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Scheduled for {new Date(job.scheduledAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at {new Date(job.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
            : <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Job Scheduled — waiting for the fixer to start</span>,
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-primary",
          text: <span className="inline-flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Repair In Progress</span>,
        };
      case "COMPLETED":
        return {
          bg: "bg-green-600",
          text: <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Job Completed</span>,
        };
      case "DISPUTED":
        return {
          bg: "bg-red-600",
          text: <span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Dispute Open</span>,
        };
      case "REFUNDED":
        return {
          bg: "bg-gray-500",
          text: <span className="inline-flex items-center gap-1.5"><RefreshCcw className="w-4 h-4" /> Refunded</span>,
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
            <CategoryIcon slug={job.repairRequest.category.slug} className="w-4 h-4" />
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
                    <Bot className="w-6 h-6 text-purple-700" />
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
                      <strong>Difficulty:</strong> {aiDiagnosis.repairDifficulty}
                      {isFixer && (
                        <>
                          {" "}• <strong>Estimated:</strong> €{aiDiagnosis.estimatedCostMin}-€
                          {aiDiagnosis.estimatedCostMax}
                        </>
                      )}
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
                  <MessageCircle className="w-7 h-7 text-primary" />
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

            {/* Dispute Section — visible to both customer and fixer */}
            {(isCustomer || isFixer) && (
              <div>
                {job.disputes && job.disputes.length > 0 ? (
                  /* Show existing dispute */
                  <div className={`${isFixer && job.disputes[0].resolution === "PENDING" ? "bg-yellow-50 border-l-4 border-yellow-500" : "bg-red-50 border-l-4 border-red-500"} p-6 rounded-lg`}>
                    <h3 className={`text-xl font-bold ${isFixer && job.disputes[0].resolution === "PENDING" ? "text-yellow-900" : "text-red-900"} mb-2`}>
                      {isFixer && job.disputes[0].resolution === "PENDING"
                        ? "A customer opened a dispute — your response is needed"
                        : "Dispute open"}
                    </h3>
                    <p className={`${isFixer && job.disputes[0].resolution === "PENDING" ? "text-yellow-800" : "text-red-800"} mb-4`}>
                      {isFixer && job.disputes[0].resolution === "PENDING"
                        ? `Please review the dispute and respond with your decision within ${disputeWindowHours} hours.`
                        : "A dispute has been opened for this job. The payment is on hold."}
                    </p>
                    <Link
                      href={`/disputes/${job.disputes[0].id}`}
                      className={`inline-block px-4 py-2 ${isFixer && job.disputes[0].resolution === "PENDING" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"} text-white rounded-lg transition-colors font-medium`}
                    >
                      {isFixer && job.disputes[0].resolution === "PENDING" ? "Respond to dispute" : "View dispute details"}
                    </Link>
                  </div>
                ) : (
                  /* Show dispute form option for customers only */
                  isCustomer &&
                  (job.status === "IN_PROGRESS" ||
                    (job.status === "COMPLETED" &&
                      job.completedAt &&
                      (Date.now() - new Date(job.completedAt).getTime()) /
                        (1000 * 60 * 60) <=
                        disputeWindowHours)) && (
                    <DisputeForm
                      jobId={job.id}
                      disputeWindowHours={disputeWindowHours}
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
                  <Link href={`/profile/${job.fixer.id}`} className="flex items-center gap-2 group">
                    {job.fixer.avatarUrl ? (
                      <img
                        src={job.fixer.avatarUrl}
                        alt={job.fixer.name}
                        className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold group-hover:ring-2 group-hover:ring-primary transition-all">
                        {job.fixer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-primary transition-colors">{job.fixer.name}</p>
                      <p className="text-xs text-gray-500">
                        {job.fixer.fixerProfile && (
                          <><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" /> {job.fixer.fixerProfile.averageRating.toFixed(1)} · </>
                        )}
                        {job.fixer._count.reviewsReceived} review{job.fixer._count.reviewsReceived !== 1 ? "s" : ""}
                        {" · "}
                        {job.fixer._count.jobsAsCustomer + job.fixer._count.jobsAsFixer} job{(job.fixer._count.jobsAsCustomer + job.fixer._count.jobsAsFixer) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Customer Info */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <Link href={`/profile/${job.customer.id}`} className="flex items-center gap-2 group">
                    {job.customer.avatarUrl ? (
                      <img
                        src={job.customer.avatarUrl}
                        alt={job.customer.name}
                        className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold group-hover:ring-2 group-hover:ring-primary transition-all">
                        {job.customer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-primary transition-colors">{job.customer.name}</p>
                      <p className="text-xs text-gray-500">
                        {job.customer._count.reviewsReceived} review{job.customer._count.reviewsReceived !== 1 ? "s" : ""}
                        {" · "}
                        {job.customer._count.jobsAsCustomer + job.customer._count.jobsAsFixer} job{(job.customer._count.jobsAsCustomer + job.customer._count.jobsAsFixer) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Scheduled Appointment */}
              {job.scheduledAt && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Calendar className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Scheduled appointment</p>
                      <p className="text-sm text-blue-800 mt-0.5">
                        {new Date(job.scheduledAt).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-medium text-blue-700">
                        {new Date(job.scheduledAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
