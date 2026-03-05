import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReviewForm from "@/components/review/ReviewForm";
import ReviewCard from "@/components/review/ReviewCard";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/jobs/${id}/review`);
  }

  const userId = session.user.id;

  // Fetch job with minimal data needed for the review page
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      repairRequest: {
        select: {
          title: true,
          category: { select: { name: true, slug: true } },
        },
      },
      customer: {
        select: { id: true, name: true, avatarUrl: true },
      },
      fixer: {
        select: { id: true, name: true, avatarUrl: true },
      },
      reviews: {
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true },
          },
          job: {
            select: {
              repairRequest: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!job) {
    redirect("/dashboard");
  }

  const isCustomer = job.customerId === userId;
  const isFixer = job.fixerId === userId;

  // Must be part of this job
  if (!isCustomer && !isFixer) {
    redirect("/dashboard");
  }

  // Must be a completed job
  if (job.status !== "COMPLETED") {
    redirect(`/jobs/${id}`);
  }

  // The person being reviewed
  const otherPerson = isCustomer ? job.fixer : job.customer;
  const userHasReviewed = job.reviews.some(
    (r: any) => r.reviewerId === userId
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back link */}
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to job
        </Link>

        {/* Job context header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Review for
          </p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {job.repairRequest.title}
          </h1>
          <div className="flex items-center gap-3">
            {otherPerson.avatarUrl ? (
              <img
                src={otherPerson.avatarUrl}
                alt={otherPerson.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-orange-400 flex items-center justify-center text-white font-bold">
                {otherPerson.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-800">{otherPerson.name}</p>
              <p className="text-xs text-gray-500">
                {isCustomer ? "Fixer" : "Customer"}
              </p>
            </div>
          </div>
        </div>

        {/* Review Form or existing reviews */}
        {!userHasReviewed ? (
          <ReviewForm jobId={job.id} reviewedUserName={otherPerson.name} />
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="font-semibold text-green-800">
                You already left a review
              </p>
            </div>

            {/* Show all reviews for this job */}
            {job.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  Reviews on this job
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {job.reviews.map((review: any) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
