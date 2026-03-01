import { timeAgo } from "@/lib/utils";

interface JobTimelineProps {
  job: {
    createdAt: string | Date;
    startedAt?: string | Date | null;
    completedAt?: string | Date | null;
    status: string;
    repairRequest: {
      createdAt: string | Date;
    };
    reviews: any[];
  };
}

export default function JobTimeline({ job }: JobTimelineProps) {
  // Convert Date objects to ISO strings for timeAgo
  const toDateString = (date: string | Date | null | undefined): string | null => {
    if (!date) return null;
    if (date instanceof Date) return date.toISOString();
    return date;
  };

  const events = [
    {
      label: "Request posted",
      date: toDateString(job.repairRequest.createdAt),
      completed: true,
    },
    {
      label: "Offer accepted",
      date: toDateString(job.createdAt),
      completed: true,
    },
    {
      label: "Job started",
      date: toDateString(job.startedAt),
      completed: !!job.startedAt,
      current: job.status === "SCHEDULED",
    },
    {
      label: "Job completed",
      date: toDateString(job.completedAt),
      completed: !!job.completedAt,
      current: job.status === "IN_PROGRESS",
    },
  ];

  // Add review event if there are reviews
  if (job.reviews && job.reviews.length > 0) {
    const firstReview = job.reviews[0];
    events.push({
      label: "Review left",
      date: toDateString(firstReview.createdAt),
      completed: true,
      current: false,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Job timeline</h3>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Vertical line and dot */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={`w-3 h-3 rounded-full ${
                  event.completed
                    ? "bg-green-500"
                    : event.current
                    ? "bg-primary animate-pulse"
                    : "bg-gray-300"
                }`}
              />
              {/* Line to next event */}
              {index < events.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 my-1" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 -mt-0.5">
              <p
                className={`font-medium ${
                  event.completed ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {event.label}
              </p>
              {event.date && (
                <p className="text-sm text-gray-500">{timeAgo(event.date)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
