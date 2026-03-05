"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import RequestCard from "@/components/request/RequestCard";
import DisputeCard from "@/components/dispute/DisputeCard";
import { AlertTriangle } from "lucide-react";

interface DashboardData {
  nearbyRequests: any[];
  activeJobs: any[];
  myOffers: any[];
  recentEarnings: any[];
  disputes: any[];
  stats: {
    activeJobCount: number;
    completedCount: number;
    averageRating: number;
    totalEarnings: number;
  };
}

export default function FixerDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/fixer");
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
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "ACCEPTED":
        return "bg-green-100 text-green-700 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-300";
      case "SCHEDULED":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-300";
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
            <div className="text-4xl mb-2">🔧</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData.stats.activeJobCount}
            </div>
            <div className="text-sm text-gray-600">Active jobs</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData.stats.completedCount}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData.stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-primary mb-1">
              €{dashboardData.stats.totalEarnings}
            </div>
            <div className="text-sm text-gray-600">Total earnings</div>
          </div>
        </div>
      </div>

      {/* Active Disputes */}
      {dashboardData.disputes && dashboardData.disputes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">Active Disputes</h2>
          </div>
          <div className="space-y-4">
            {dashboardData.disputes.map((dispute: any) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                currentUserId={session?.user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nearby Requests */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby requests</h2>

        {dashboardData.nearbyRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-600">No nearby requests right now. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.nearbyRequests.map((request: any) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/browse" className="text-primary font-medium hover:underline">
                Browse all requests →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* My Active Jobs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My active jobs</h2>

        {dashboardData.activeJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-600">No active jobs right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.activeJobs.map((job: any) => (
              <div
                key={job.id}
                className="relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={job.repairRequest.title} />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Customer Avatar — links to profile */}
                    <Link href={`/profile/${job.customer.id}`} className="relative z-10 shrink-0">
                      {job.customer.avatarUrl ? (
                        <img
                          src={job.customer.avatarUrl}
                          alt={job.customer.name}
                          className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold hover:ring-2 hover:ring-primary transition-all">
                          {job.customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{job.repairRequest.title}</h3>
                      <Link href={`/profile/${job.customer.id}`} className="relative z-10 text-sm text-gray-600 hover:text-primary transition-colors">
                        Customer: {job.customer.name}
                      </Link>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Offers */}
      {dashboardData.myOffers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My offers</h2>
          <div className="space-y-3">
            {dashboardData.myOffers.map((offer: any) => (
              <Link
                key={offer.id}
                href={`/request/${offer.repairRequest.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{offer.repairRequest.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          offer.status
                        )}`}
                      >
                        {offer.status}
                      </span>
                      <span className="text-sm text-gray-500">{timeAgo(offer.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">€{offer.price}</div>
                    <div className="text-xs text-gray-500">{offer.estimatedTime}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Earnings */}
      {dashboardData.recentEarnings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent earnings</h2>
          <div className="space-y-3">
            {dashboardData.recentEarnings.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{job.repairRequest.title}</h3>
                    <p className="text-sm text-gray-500">Customer: {job.customer?.name || "Unknown"}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">€{job.agreedPrice}</div>
                    <div className="text-xs text-gray-500">{timeAgo(job.completedAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
