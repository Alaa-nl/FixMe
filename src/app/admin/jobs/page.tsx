"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (repairRequestId: string, title: string) => {
    if (!confirm(`Delete request "${title}"? This cannot be undone.`)) return;

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

  const getStatusBadge = (status: string) => {
    const colors: any = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-orange-100 text-orange-800",
      COMPLETED: "bg-green-100 text-green-800",
      DISPUTED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
          {["All", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "DISPUTED", "REFUNDED"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s === "All" ? "" : s); setPage(1); }}
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(job.status)}`}>
                    {job.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(job.repairRequest.id, job.repairRequest.title);
                    }}
                    disabled={deleting === job.repairRequest.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete request"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg">
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
