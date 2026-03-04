"use client";

import React, { useState, useEffect } from "react";
import {
  ScrollText,
  Filter,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AdminLog {
  id: string;
  userId: string;
  action: string;
  target: string | null;
  targetType: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    userType: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  // Filters
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter options
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, selectedUser, selectedAction, startDate, endDate]);

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/admin/logs/filters");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch filters");
      }

      setAvailableActions(data.actions || []);
      setAvailableUsers(data.users || []);
    } catch (error: any) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedUser) params.append("userId", selectedUser);
      if (selectedAction) params.append("action", selectedAction);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch logs");
      }

      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(error.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedUser("");
    setSelectedAction("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getActionColor = (action: string) => {
    if (action.includes("banned") || action.includes("deleted")) {
      return "text-red-600 bg-red-50";
    }
    if (action.includes("created") || action.includes("added")) {
      return "text-green-600 bg-green-50";
    }
    if (action.includes("updated") || action.includes("changed")) {
      return "text-blue-600 bg-blue-50";
    }
    if (action.includes("resolved") || action.includes("released")) {
      return "text-purple-600 bg-purple-50";
    }
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-2 text-gray-600">
          Track all admin and staff actions for accountability
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Staff Member Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Staff Member
            </Label>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="">All Staff</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag size={16} />
              Action Type
            </Label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="">All Actions</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {formatAction(action)}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-sm"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              End Date
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            Reset Filters
          </Button>
          <div className="ml-auto text-sm text-gray-600">
            {pagination.total} total entries
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No activity logs found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.user.avatarUrl ? (
                          <img
                            src={log.user.avatarUrl}
                            alt={log.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-semibold">
                            {log.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                          log.action
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {log.targetType && log.target ? (
                        <div>
                          <div className="font-medium">{log.targetType}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            {log.target}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {log.details ? (
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.ipAddress || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span
                          className="px-2 text-gray-400"
                        >
                          ...
                        </span>
                      )}
                      <Button
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                        variant={
                          pagination.page === page ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          pagination.page === page
                            ? "bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
              <Button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
