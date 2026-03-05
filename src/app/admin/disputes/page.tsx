"use client";

import { useEffect, useState } from "react";
import DisputeCard from "@/components/dispute/DisputeCard";
import { useRouter } from "next/navigation";

export default function AdminDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [resolution, setResolution] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchDisputes();
  }, [resolution, page]);

  const fetchDisputes = async () => {
    const params = new URLSearchParams({
      ...(resolution && { resolution }),
      page: page.toString(),
    });

    const res = await fetch(`/api/admin/disputes?${params}`);
    if (res.ok) {
      const data = await res.json();
      setDisputes(data.disputes || []);
      setTotalPages(data.totalPages || 1);

      // Count disputes needing admin attention
      if (!resolution) {
        const needsAttention = data.disputes.filter((d: any) =>
          ["PENDING", "FIXER_REJECTED", "ESCALATED"].includes(d.resolution)
        );
        setPendingCount(needsAttention.length);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Disputes</h1>
        {pendingCount > 0 && (
          <p className="text-red-600 font-medium mt-2">
            {pendingCount} dispute{pendingCount !== 1 ? "s" : ""} need your attention
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex gap-2 flex-wrap">
          {["All", "PENDING", "FIXER_OFFERED", "FIXER_REJECTED", "ESCALATED", "REFUNDED", "PARTIAL_REFUND", "RELEASED"].map((r) => (
            <button
              key={r}
              onClick={() => { setResolution(r === "All" ? "" : r); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium ${
                (r === "All" && !resolution) || resolution === r
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <DisputeCard key={dispute.id} dispute={dispute} isAdmin={true} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white border rounded-lg">
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border rounded-lg">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
