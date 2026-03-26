"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

const ALL_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "DISPUTED",
  "REFUNDED",
  "CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  DISPUTED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-yellow-100 text-yellow-800",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingJob, setDeletingJob] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [status, page]);

  const fetchJobs = async () => {
    const params = new URLSearchParams({
      ...(status && { status }),
      page: page.toString(),
    });

    const res = await fetch(`/api/admin/jobs?${params}`);
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    }
  };

  const handleDeleteRequest = async (repairRequestId: string, title: string) => {
    if (
      !confirm(
        `Delete repair request "${title}" and ALL related data (jobs, reviews, payments, messages)? This cannot be undone.`
      )
    )
      return;

    setDeleting(repairRequestId);
    try {
      const res = await fetch(`/api/admin/repair-requests/${repairRequestId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete request");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (
      !confirm(
        `Delete this job and all its reviews, disputes, and payments? The repair request "${title}" will remain. This cannot be undone.`
      )
    )
      return;

    setDeletingJob(jobId);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete job");
      }
    } catch {
      alert("Failed to delete job");
    } finally {
      setDeletingJob(null);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return;
    if (
      !confirm(
        `Change job status from ${currentStatus.replace("_", " ")} to ${newStatus.replace("_", " ")}? This is an admin override.`
      )
    )
      return;

    setChangingStatus(jobId);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to change status");
      }
    } catch {
      alert("Failed to change status");
    } finally {
      setChangingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Jobs & Repair Requests</h1>
        <Link href="/admin/jobs/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors">
            <Plus size={20} />
            Create Request
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex gap-2 flex-wrap">
          {["All", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s === "All" ? "" : s);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                (s === "All" && !status) || status === s
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fixer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/jobs/${job.id}`} className="text-primary hover:underline font-medium">
                    {job.repairRequest.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm">{job.customer.name}</td>
                <td className="px-6 py-4 text-sm">{job.fixer.name}</td>
                <td className="px-6 py-4 text-sm font-semibold">€{job.agreedPrice.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value, job.status)}
                    disabled={changingStatus === job.id}
                    className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer disabled:opacity-50 ${
                      STATUS_COLORS[job.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Delete job only */}
                    <button
                      onClick={() => handleDeleteJob(job.id, job.repairRequest.title)}
                      disabled={deletingJob === job.id}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete this job (keeps the repair request)"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* Delete entire repair request */}
                    <button
                      onClick={() => handleDeleteRequest(job.repairRequest.id, job.repairRequest.title)}
                      disabled={deleting === job.repairRequest.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete entire repair request and all data"
                    >
                      <AlertTriangle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
