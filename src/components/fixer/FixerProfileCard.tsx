"use client";

import Link from "next/link";
import { Star, MapPin, Shield, Wrench, CheckCircle2, Clock } from "lucide-react";

interface FixerProfileCardProps {
  fixer: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city?: string;
    bio?: string;
    rating?: number;
    reviewCount?: number;
    completedJobs?: number;
    skills?: string[];
    isVerified?: boolean;
    responseTime?: string;
  };
}

export default function FixerProfileCard({ fixer }: FixerProfileCardProps) {
  const rating = fixer.rating ?? 0;
  const reviewCount = fixer.reviewCount ?? 0;
  const completedJobs = fixer.completedJobs ?? 0;

  return (
    <Link
      href={`/profile/${fixer.id}`}
      className="block bg-white rounded-2xl border border-gray-100/60 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group card-lift"
    >
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-secondary" />

      <div className="p-5">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3.5 mb-4">
          {fixer.avatarUrl ? (
            <img
              src={fixer.avatarUrl}
              alt={fixer.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-secondary text-white flex items-center justify-center font-display font-bold text-xl">
              {fixer.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-secondary font-display truncate group-hover:text-primary transition-colors">
                {fixer.name}
              </h3>
              {fixer.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>

            {fixer.city && (
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{fixer.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating + stats row */}
        <div className="flex items-center gap-4 mb-4">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-secondary text-sm">{rating.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Wrench className="w-3.5 h-3.5" />
            <span className="font-semibold">{completedJobs} klussen</span>
          </div>
          {fixer.responseTime && (
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{fixer.responseTime}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {fixer.bio && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{fixer.bio}</p>
        )}

        {/* Skills tags */}
        {fixer.skills && fixer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {fixer.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-secondary/[0.06] text-secondary text-xs font-semibold rounded-lg"
              >
                {skill}
              </span>
            ))}
            {fixer.skills.length > 4 && (
              <span className="px-2.5 py-1 text-gray-400 text-xs font-semibold">
                +{fixer.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Verified badge */}
        {fixer.isVerified && (
          <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">Geverifieerde vakman</span>
          </div>
        )}
      </div>
    </Link>
  );
}
