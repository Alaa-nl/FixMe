"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Wrench, Briefcase, CheckCircle, AlertTriangle, Euro, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalFixers: number;
  totalJobs: number;
  completedJobs: number;
  openDisputes: number;
  totalRevenue: number;
  revenueThisMonth: number;
  jobsThisMonth: number;
}

interface Activity {
  type: string;
  id: string;
  title: string;
  description: string;
  timestamp: string;
  link: string;
}

interface ChartDataPoint {
  week: string;
  revenue: number;
  totalAmount: number;
  jobs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch stats, activity feed, and chart data in parallel
      const [statsRes, activityRes, chartRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/activity?limit=20"),
        fetch("/api/admin/revenue-chart"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      }

      if (chartRes.ok) {
        const chartDataResponse = await chartRes.json();
        setChartData(chartDataResponse.chartData || []);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
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

  const avgJobValue = stats && stats.jobsThisMonth > 0
    ? (stats.revenueThisMonth / 0.15 / stats.jobsThisMonth).toFixed(2)
    : "0.00";

  // Get activity icon and color
  const getActivityStyle = (type: string) => {
    switch (type) {
      case "user_registered":
        return { icon: "👤", color: "bg-blue-100 text-blue-600" };
      case "request_posted":
        return { icon: "📝", color: "bg-purple-100 text-purple-600" };
      case "offer_accepted":
        return { icon: "🤝", color: "bg-green-100 text-green-600" };
      case "job_completed":
        return { icon: "✅", color: "bg-green-100 text-green-600" };
      case "dispute_opened":
        return { icon: "⚠️", color: "bg-red-100 text-red-600" };
      case "review_left":
        return { icon: "⭐", color: "bg-yellow-100 text-yellow-600" };
      default:
        return { icon: "📌", color: "bg-gray-100 text-gray-600" };
    }
  };

  // Calculate max value for chart bars
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor platform activity and manage operations</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Wrench size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalFixers || 0}</p>
              <p className="text-sm text-gray-600">Total Fixers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalJobs || 0}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats?.completedJobs || 0}</p>
              <p className="text-sm text-gray-600">Completed Jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats?.openDisputes || 0}</p>
              <p className="text-sm text-gray-600">Open Disputes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Euro size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">€{(stats?.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue This Month */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Platform Revenue</p>
            <p className="text-2xl font-bold text-primary">€{(stats?.revenueThisMonth || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.jobsThisMonth || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Job Value</p>
            <p className="text-2xl font-bold text-gray-800">€{avgJobValue}</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Revenue Trend (Last 12 Weeks)</h2>
          </div>

          <div className="space-y-3">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-sm text-gray-600">{data.week}</div>
                <div className="flex-1">
                  <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-sm font-semibold text-gray-800">
                        €{data.revenue.toFixed(2)}
                      </span>
                      <span className="ml-auto text-xs text-gray-600">
                        {data.jobs} {data.jobs === 1 ? "job" : "jobs"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Shows platform commission (15%) from completed jobs
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Activity Feed + Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
            <span className="text-sm text-gray-500">{activities.length} events</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              activities.map((activity, index) => {
                const style = getActivityStyle(activity.type);
                return (
                  <Link
                    key={`${activity.type}-${activity.id}-${index}`}
                    href={activity.link}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.color} flex items-center justify-center text-lg`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.timestamp)}</p>
                    </div>
                    <ArrowRight size={16} className="flex-shrink-0 text-gray-400 mt-2" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Needs Attention</h2>

          <div className="space-y-4">
            {/* Pending Disputes */}
            <Link
              href="/admin/disputes"
              className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-red-800">Pending Disputes</span>
                <span className="text-2xl font-bold text-red-600">{stats?.openDisputes || 0}</span>
              </div>
              <p className="text-xs text-red-700">Require admin resolution</p>
            </Link>

            {/* Quick Links */}
            <Link
              href="/admin/users?filter=FIXER&verified=false"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-blue-800">Unverified Fixers</span>
                <AlertTriangle size={20} className="text-blue-600" />
              </div>
              <p className="text-xs text-blue-700">Awaiting KVK verification</p>
            </Link>

            <Link
              href="/admin/jobs?status=IN_PROGRESS"
              className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-yellow-800">Jobs in Progress</span>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <p className="text-xs text-yellow-700">Monitor active repairs</p>
            </Link>

            <Link
              href="/admin/payments?status=HELD"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-green-800">Payments Held</span>
                <Euro size={20} className="text-green-600" />
              </div>
              <p className="text-xs text-green-700">Awaiting release or review</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
