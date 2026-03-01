import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    photos: string[];
    city: string;
    timeline: "URGENT" | "THIS_WEEK" | "NO_RUSH";
    createdAt: Date | string;
    category: {
      name: string;
      slug: string;
    };
    customer: {
      name: string;
      avatarUrl: string | null;
    };
    _count: {
      offers: number;
    };
  };
}

export default function RequestCard({ request }: RequestCardProps) {
  // Get timeline badge config
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

  // Get first photo or placeholder
  const coverImage = request.photos.length > 0 ? request.photos[0] : null;

  return (
    <Link
      href={`/request/${request.id}`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-gray-200">
        {coverImage ? (
          <img
            src={coverImage}
            alt={request.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-6xl">{getCategoryIcon(request.category.slug)}</span>
          </div>
        )}

        {/* Timeline Badge */}
        {timelineBadge.text && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${timelineBadge.color}`}
            >
              {timelineBadge.text}
            </span>
          </div>
        )}
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

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <span>📍</span>
          <span>{request.city}</span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{timeAgo(request.createdAt)}</span>
          <span className="font-medium text-primary">
            {request._count.offers === 0
              ? "No offers yet"
              : request._count.offers === 1
              ? "1 offer"
              : `${request._count.offers} offers`}
          </span>
        </div>
      </div>
    </Link>
  );
}
