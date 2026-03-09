import Link from "next/link";
import { MapPin, Clock, AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CategoryIcon } from "@/lib/categoryIconsReact";

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
        return { text: "Urgent", className: "bg-red-50 text-red-700 border border-red-200", icon: AlertTriangle };
      case "THIS_WEEK":
        return { text: "This week", className: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock };
      case "NO_RUSH":
        return { text: "No rush", className: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle2 };
      default:
        return { text: "", className: "", icon: CircleDot };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return { text: "In Progress", className: "bg-blue-50 text-blue-700 border border-blue-200" };
      case "COMPLETED":
        return { text: "Completed", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
      case "CANCELLED":
        return { text: "Cancelled", className: "bg-gray-100 text-gray-600 border border-gray-200" };
      case "DISPUTED":
        return { text: "Disputed", className: "bg-amber-50 text-amber-700 border border-amber-200" };
      default:
        return { text: status, className: "bg-gray-100 text-gray-600 border border-gray-200" };
    }
  };

  const timelineBadge = getTimelineBadge();
  const TimelineIcon = timelineBadge.icon;
  const coverImage = request.photos.length > 0 ? request.photos[0] : null;
  const totalJobs = request.customer._count
    ? request.customer._count.jobsAsCustomer + request.customer._count.jobsAsFixer
    : 0;
  const reviewCount = request.customer._count?.reviewsReceived ?? 0;

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Invisible card link (covers entire card) */}
      <Link
        href={`/request/${request.id}`}
        className="absolute inset-0 z-0"
        aria-label={request.title}
      />

      {/* Cover Image */}
      <div className="relative h-40 bg-gray-50">
        {coverImage ? (
          <img
            src={coverImage}
            alt={request.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50/50">
            <CategoryIcon slug={request.category.slug} className="w-10 h-10 text-primary/40" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          {request.status && request.status !== "OPEN" && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(request.status).className}`}>
              {getStatusBadge(request.status).text}
            </span>
          )}

          {timelineBadge.text && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${timelineBadge.className}`}>
              <TimelineIcon className="w-3 h-3" />
              {timelineBadge.text}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-primary text-xs font-medium rounded-full">
            <CategoryIcon slug={request.category.slug} className="w-3.5 h-3.5" />
            <span>{request.category.name}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-primary transition-colors text-[15px]">
          {request.title}
        </h3>

        {/* Customer Info Row */}
        {request.customer.id ? (
          <Link
            href={`/profile/${request.customer.id}`}
            className="relative z-10 flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
          >
            {request.customer.avatarUrl ? (
              <img
                src={request.customer.avatarUrl}
                alt={request.customer.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-100"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {request.customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600 font-medium truncate hover:text-primary transition-colors">
              {request.customer.name}
            </span>
            {request.customer._count && (
              <span className="text-[11px] text-gray-400 ml-auto whitespace-nowrap">
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
                className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-100"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {request.customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600 font-medium truncate">
              {request.customer.name}
            </span>
            {request.customer._count && (
              <span className="text-[11px] text-gray-400 ml-auto whitespace-nowrap">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""} · {totalJobs} job{totalJobs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
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
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-400">
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
