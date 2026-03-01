"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/categoryIcons";
import Button from "@/components/ui/Button";
import DisputeCard from "@/components/dispute/DisputeCard";

interface DashboardData {
  activeRequests: any[];
  activeJobs: any[];
  pastJobs: any[];
  disputes?: any[];
  stats: {
    activeRequestCount: number;
    completedCount: number;
    unreadMessages: number;
    moneySaved: number;
  };
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/customer");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

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
      case "DISPUTED":
        return "bg-red-100 text-red-700 border-red-300";
      case "REFUNDED":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Welcome back, {session?.user?.name}!
        </h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData.stats.activeRequestCount}
            </div>
            <div className="text-sm text-gray-600">Active requests</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData.stats.completedCount}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData.stats.unreadMessages}
            </div>
            <div className="text-sm text-gray-600">Unread messages</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-primary mb-1">
              €{dashboardData.stats.moneySaved}
            </div>
            <div className="text-sm text-gray-600">Money saved</div>
          </div>
        </div>
      </div>

      {/* My Active Requests */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My active requests</h2>

        {dashboardData.activeRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 mb-4">
              You have no active requests. Post one now!
            </p>
            <Link href="/post">
              <Button variant="primary" size="lg">
                Post a request
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {dashboardData.activeRequests.map((request: any) => (
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
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
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
                          {request._count.offers}{" "}
                          {request._count.offers === 1 ? "offer" : "offers"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link href="/my-requests" className="text-primary font-medium hover:underline">
                View all my requests →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Active Jobs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active jobs</h2>

        {dashboardData.activeJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-600">No active jobs right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.activeJobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Fixer Avatar */}
                    {job.fixer.avatarUrl ? (
                      <img
                        src={job.fixer.avatarUrl}
                        alt={job.fixer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {job.fixer.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{job.repairRequest.title}</h3>
                      <p className="text-sm text-gray-600">Fixer: {job.fixer.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                            job.status
                          )}`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">€{job.agreedPrice}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Disputes */}
      {dashboardData.disputes && dashboardData.disputes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ Disputes</h2>
          <div className="space-y-4">
            {dashboardData.disputes.map((dispute: any) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        </div>
      )}

      {/* Past Jobs */}
      {dashboardData.pastJobs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Past jobs</h2>
          <div className="space-y-3">
            {dashboardData.pastJobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{job.repairRequest.title}</h3>
                    <p className="text-sm text-gray-500">Fixer: {job.fixer.name}</p>
                    {job.reviews.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        ⭐ {job.reviews[0].rating}/5
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">€{job.agreedPrice}</div>
                    <div className="text-xs text-gray-500">{timeAgo(job.completedAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/my-jobs" className="text-primary font-medium hover:underline">
              View all →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
