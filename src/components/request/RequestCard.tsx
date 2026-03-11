"use client";

import Link from "next/link";
import { MapPin, Clock, AlertTriangle, CheckCircle2, CircleDot, MessageCircle } from "lucide-react";
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
  // Timeline badge styling
  const getTimelineBadge = () => {
    switch (request.timeline) {
      case "URGENT":
        return { text: "Urgent", className: "bg-red-500 text-white", icon: AlertTriangle };
      case "THIS_WEEK":
        return { text: "Deze week", className: "bg-amber-500 text-white", icon: Clock };
      case "NO_RUSH":
        return { text: "Geen haast", className: "bg-success text-white", icon: CheckCircle2 };
      default:
        return { text: "", className: "", icon: CircleDot };
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return { text: "Bezig", className: "bg-secondary text-white" };
      case "COMPLETED":
        return { text: "Voltooid", className: "bg-success text-white" };
      case "CANCELLED":
        return { text: "Geannuleerd", className: "bg-gray-400 text-white" };
      case "DISPUTED":
        return { text: "Geschil", className: "bg-amber-500 text-white" };
      default:
        return { text: status, className: "bg-gray-400 text-white" };
    }
  };

  const timelineBadge = getTimelineBadge();
  const TimelineIcon = timelineBadge.icon;
  const coverImage = request.photos.length > 0 ? request.photos[0] : null;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100/60 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group card-lift">
      {/* Full card link */}
      <Link
        href={`/request/${request.id}`}
        className="absolute inset-0 z-0"
        aria-label={request.title}
      />

      {/* Cover image with zoom on hover */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={request.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.05] to-secondary/[0.03]">
            <CategoryIcon slug={request.category.slug} className="w-12 h-12 text-primary/20" />
          </div>
        )}

        {/* Bottom gradient overlay */}
        {coverImage && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        )}

        {/* Badges — top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {request.status && request.status !== "OPEN" && (
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${getStatusBadge(request.status).className}`}>
              {getStatusBadge(request.status).text}
            </span>
          )}
          {timelineBadge.text && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${timelineBadge.className}`}>
              <TimelineIcon className="w-3 h-3" />
              {timelineBadge.text}
            </span>
          )}
        </div>

        {/* Category tag — bottom left */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-secondary text-xs font-bold rounded-lg">
            <CategoryIcon slug={request.category.slug} className="w-3.5 h-3.5 text-primary" />
            {request.category.name}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-secondary mb-2.5 truncate group-hover:text-primary transition-colors text-[15px] font-display">
          {request.title}
        </h3>

        {/* Customer info */}
        {request.customer.id ? (
          <Link
            href={`/profile/${request.customer.id}`}
            className="relative z-10 flex items-center gap-2 mb-2.5 hover:opacity-80 transition-opacity"
          >
            {request.customer.avatarUrl ? (
              <img
                src={request.customer.avatarUrl}
                alt={request.customer.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-primary/10"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold">
                {request.customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-500 font-medium truncate">
              {request.customer.name}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold">
              {request.customer.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-500 font-medium truncate">
              {request.customer.name}
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{request.city}</span>
          {request.distanceKm != null && (
            <span className="ml-auto text-xs font-bold text-primary">
              {request.distanceKm < 1
                ? `${Math.round(request.distanceKm * 1000)}m`
                : `${request.distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>

        {/* Footer — time and offer count */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
          <span className="text-xs text-gray-400" suppressHydrationWarning>{timeAgo(request.createdAt)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            <MessageCircle className="w-3.5 h-3.5" />
            {request._count.offers === 0
              ? "Geen biedingen"
              : request._count.offers === 1
              ? "1 bod"
              : `${request._count.offers} biedingen`}
          </span>
        </div>
      </div>
    </div>
  );
}
