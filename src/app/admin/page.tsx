"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Wrench, Briefcase, CheckCircle, AlertTriangle, Euro } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import DisputeCard from "@/components/dispute/DisputeCard";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch pending disputes
      const disputesRes = await fetch("/api/admin/disputes?resolution=PENDING&limit=5");
      if (disputesRes.ok) {
        const disputesData = await disputesRes.json();
        setDisputes(disputesData.disputes || []);
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
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
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

      {/* Pending Disputes */}
      {disputes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Pending Disputes ({disputes.length})
            </h2>
            <Link
              href="/admin/disputes"
              className="text-primary hover:underline font-medium"
            >
              View all disputes →
            </Link>
          </div>
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} isAdmin={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
