"use client";

import { useEffect, useState } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";

interface TrashedRequest {
  id: string;
  title: string;
  customerId: string;
  customer: { name: string; email: string };
  deletedAt: string;
  _count: { jobs: number };
}

export default function AdminTrashPage() {
  const [items, setItems] = useState<TrashedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trash");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      console.error("Failed to fetch trash");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, title: string) => {
    if (!confirm(`Restore "${title}"? It will reappear on public pages.`))
      return;

    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/repair-requests/${id}/restore`, {
        method: "POST",
      });
      if (res.ok) {
        fetchTrash();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to restore");
      }
    } catch {
      alert("Failed to restore");
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `PERMANENTLY delete "${title}"?\n\nThis will delete all related jobs, reviews, messages, payments, and uploaded photos/videos.\n\nThis action CANNOT be undone.`
      )
    )
      return;

    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/repair-requests/${id}/permanent`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTrash();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete permanently");
      }
    } catch {
      alert("Failed to delete permanently");
    } finally {
      setActionInProgress(null);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const expiresAt = new Date(deleted);
    expiresAt.setDate(expiresAt.getDate() + 30);
    const now = new Date();
    const diff = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Trash</h1>

      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
        <p className="text-amber-800 text-sm">
          Items in trash will be permanently deleted after 30 days. Permanently
          deleted items cannot be recovered — all related data and uploaded files
          will be removed.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          <Trash2 className="mx-auto mb-3 text-gray-300" size={40} />
          <p>Trash is empty</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jobs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Deleted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Auto-delete in
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => {
                const daysLeft = getDaysRemaining(item.deletedAt);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item._count.jobs}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          daysLeft <= 3
                            ? "text-red-600"
                            : daysLeft <= 7
                              ? "text-amber-600"
                              : "text-gray-600"
                        }`}
                      >
                        {daysLeft} days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRestore(item.id, item.title)}
                          disabled={actionInProgress === item.id}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handlePermanentDelete(item.id, item.title)
                          }
                          disabled={actionInProgress === item.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
