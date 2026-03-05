import Link from "next/link";

interface SuggestedFixer {
  id: string;
  name: string;
  avatarUrl: string | null;
  averageRating: number;
  totalJobs: number;
  distanceKm: number;
  verifiedBadge: boolean;
}

interface SuggestedFixersProps {
  fixers: SuggestedFixer[];
}

export default function SuggestedFixers({ fixers }: SuggestedFixersProps) {
  if (fixers.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Suggested Fixers
      </h3>
      <div className="space-y-3">
        {fixers.map((fixer) => (
          <Link
            key={fixer.id}
            href={`/profile/${fixer.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-orange-50/50 transition-all group"
          >
            {/* Avatar */}
            {fixer.avatarUrl ? (
              <img
                src={fixer.avatarUrl}
                alt={fixer.name}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold flex-shrink-0">
                {fixer.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-gray-800 truncate group-hover:text-primary transition-colors">
                  {fixer.name}
                </span>
                {fixer.verifiedBadge && (
                  <span title="Verified fixer">✅</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <span className="text-yellow-500">★</span>
                  {fixer.averageRating.toFixed(1)}
                </span>
                <span>
                  {fixer.totalJobs} {fixer.totalJobs === 1 ? "job" : "jobs"}
                </span>
                <span className="text-primary font-medium">
                  {fixer.distanceKm < 1
                    ? `${Math.round(fixer.distanceKm * 1000)}m`
                    : `${fixer.distanceKm.toFixed(1)} km`}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <span className="text-gray-300 group-hover:text-primary transition-colors text-sm">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
