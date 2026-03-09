"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface RepairRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  photos: string[];
  createdAt: string;
  category: {
    name: string;
    slug: string;
  };
  _count: {
    offers: number;
  };
}

interface MyRequestsClientProps {
  content: Record<string, string>;
}

export default function MyRequestsClient({ content }: MyRequestsClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    OPEN: true,
    IN_PROGRESS: true,
    SCHEDULED: true,
    COMPLETED: false,
    CANCELLED: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/my-requests");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchRequests();
    }
  }, [session]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests/my-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      [status]: !prev[status as keyof typeof filters],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-300";
      case "SCHEDULED":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{content["my_requests_loading"]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const filteredRequests = requests.filter((req) => filters[req.status as keyof typeof filters]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{content["my_requests_title"]}</h1>
          <p className="text-gray-600">{content["my_requests_subtitle"]}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">{content["my_requests_filter_heading"]}</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(filters).map(([status, checked]) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleFilterChange(status)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                    status
                  )}`}
                >
                  {status.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 mb-4">
              {requests.length === 0
                ? content["my_requests_empty_none"]
                : content["my_requests_empty_filtered"]}
            </p>
            {requests.length === 0 && (
              <Link href="/post">
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  {content["my_requests_empty_cta"]}
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Link
                key={request.id}
                href={`/request/${request.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {request.photos.length > 0 ? (
                      <img
                        src={request.photos[0]}
                        alt={request.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{getCategoryIcon(request.category.slug)}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 truncate">{request.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-primary text-xs font-medium rounded">
                        <span>{getCategoryIcon(request.category.slug)}</span>
                        <span>{request.category.name}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{timeAgo(request.createdAt)}</span>
                      <span className="font-medium text-primary">
                        {request._count.offers} {request._count.offers === 1 ? content["my_requests_offer_singular"] : content["my_requests_offer_plural"]}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {requests.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {content["my_requests_showing"]
                  .replace("{n}", filteredRequests.length.toString())
                  .replace("{total}", requests.length.toString())}
              </span>
              <span>
                {content["my_requests_total_offers"]}{" "}
                {requests.reduce((sum, req) => sum + req._count.offers, 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
