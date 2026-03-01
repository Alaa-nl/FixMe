"use client";

import { useEffect, useState } from "react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [status, page]);

  const fetchPayments = async () => {
    const params = new URLSearchParams({
      ...(status && { status }),
      page: page.toString(),
    });

    const res = await fetch(`/api/admin/payments?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPayments(data.payments || []);
      setSummary(data.summary || {});
      setTotalPages(data.totalPages || 1);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Payments</h1>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-600 mb-1">Total Held</p>
            <p className="text-2xl font-bold text-yellow-600">€{summary.totalHeld?.toFixed(2) || "0.00"}</p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-600 mb-1">Total Released</p>
            <p className="text-2xl font-bold text-green-600">€{summary.totalReleased?.toFixed(2) || "0.00"}</p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-600 mb-1">Total Refunded</p>
            <p className="text-2xl font-bold text-blue-600">€{summary.totalRefunded?.toFixed(2) || "0.00"}</p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-600 mb-1">Platform Revenue</p>
            <p className="text-2xl font-bold text-primary">€{summary.totalPlatformFees?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex gap-2 flex-wrap">
          {["All", "HELD", "RELEASED", "REFUNDED"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s === "All" ? "" : s); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium ${
                (s === "All" && !status) || status === s
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fixer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{payment.job?.repairRequest?.title}</td>
                <td className="px-6 py-4 text-sm">{payment.customer.name}</td>
                <td className="px-6 py-4 text-sm">{payment.fixer.name}</td>
                <td className="px-6 py-4 text-sm font-semibold">€{payment.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">€{payment.platformFee.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    payment.status === "HELD" ? "bg-yellow-100 text-yellow-800" :
                    payment.status === "RELEASED" ? "bg-green-100 text-green-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {payment.status}
                  </span>
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
