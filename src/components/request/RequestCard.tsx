import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    photos: string[];
    city: string;
    status?: string;
    timeline: "URGENT" | "THIS_WEEK" | "NO_RUSH";
    createdAt: Date | string;
    category: {
      name: string;
      slug: string;
    };
    customer: {
      id?: string;
      name: string;
      avatarUrl: string | null;
      _count?: {
        reviewsReceived: number;
        jobsAsCustomer: number;
        jobsAsFixer: number;
      };
    };
    _count: {
      offers: number;
    };
    distanceKm?: number;
  };
}

export default function RequestCard({ request }: RequestCardProps) {
  const getTimelineBadge = () => {
    switch (request.timeline) {
      case "URGENT":
        return { text: "Urgent", color: "bg-red-500 text-white" };
      case "THIS_WEEK":
        return { text: "This week", color: "bg-yellow-500 text-white" };
      case "NO_RUSH":
        return { text: "No rush", color: "bg-green-500 text-white" };
      default:
        return { text: "", color: "" };
    }
  };

  const timelineBadge = getTimelineBadge();
  const coverImage = request.photos.length > 0 ? request.photos[0] : null;
  const totalJobs = request.customer._count
    ? request.customer._count.jobsAsCustomer + request.customer._count.jobsAsFixer
    : 0;
  const reviewCount = request.customer._count?.reviewsReceived ?? 0;

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Invisible card link (covers entire card) */}
      <Link
        href={`/request/${request.id}`}
        className="absolute inset-0 z-0"
        aria-label={request.title}
      />

      {/* Cover Image */}
      <div className="relative h-[100px] bg-gray-200">
        {coverImage ? (
          <img
            src={coverImage}
            alt={request.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-4xl">{getCategoryIcon(request.category.slug)}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {request.status && request.status !== "OPEN" && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                request.status === "IN_PROGRESS"
                  ? "bg-blue-500 text-white"
                  : request.status === "COMPLETED"
                  ? "bg-green-500 text-white"
                  : request.status === "CANCELLED"
                  ? "bg-gray-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {request.status === "IN_PROGRESS" && "In Progress"}
              {request.status === "COMPLETED" && "Completed"}
              {request.status === "CANCELLED" && "Cancelled"}
              {request.status === "DISPUTED" && "Disputed"}
            </span>
          )}

          {timelineBadge.text && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${timelineBadge.color}`}
            >
              {timelineBadge.text}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-primary text-xs font-medium rounded-full">
            <span>{getCategoryIcon(request.category.slug)}</span>
            <span>{request.category.name}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-800 mb-2 truncate group-hover:text-primary transition-colors">
          {request.title}
        </h3>

        {/* Customer Info Row — clickable to profile */}
        {request.customer.id ? (
          <Link
            href={`/profile/${request.customer.id}`}
            className="relative z-10 flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
          >
            {request.customer.avatarUrl ? (
              <img
                src={request.customer.avatarUrl}
                alt={request.customer.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold">
                {request.customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-700 font-medium truncate hover:text-primary transition-colors">
              {request.customer.name}
            </span>
            {request.customer._count && (
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""} · {totalJobs} job{totalJobs !== 1 ? "s" : ""}
              </span>
            )}
          </Link>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            {request.customer.avatarUrl ? (
              <img
                src={request.customer.avatarUrl}
                alt={request.customer.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold">
                {request.customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-700 font-medium truncate">
              {request.customer.name}
            </span>
            {request.customer._count && (
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""} · {totalJobs} job{totalJobs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <span>📍</span>
          <span>{request.city}</span>
          {request.distanceKm != null && (
            <span className="ml-auto text-xs font-medium text-primary">
              {request.distanceKm < 1
                ? `${Math.round(request.distanceKm * 1000)}m away`
                : `${request.distanceKm.toFixed(1)} km away`}
            </span>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span suppressHydrationWarning>{timeAgo(request.createdAt)}</span>
          <span className="font-medium text-primary">
            {request._count.offers === 0
              ? "No offers yet"
              : request._count.offers === 1
              ? "1 offer"
              : `${request._count.offers} offers`}
          </span>
        </div>
      </div>
    </div>
  );
}
