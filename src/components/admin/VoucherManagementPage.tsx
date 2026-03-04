"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VoucherFormModal from "./VoucherFormModal";

interface Voucher {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number | null;
  usedCount: number;
  minOrderValue: number | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  applicableTo: string;
  description: string | null;
  totalDiscount: number;
  redemptionCount: number;
  createdAt: string;
}

export default function VoucherManagementPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "true" | "false">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, [filter]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/vouchers?isActive=${filter}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vouchers");
      }

      setVouchers(data.vouchers || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete voucher "${code}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete voucher");
      }

      toast.success("Voucher deleted successfully");
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete voucher");
    }
  };

  const handleToggleActive = async (voucher: Voucher) => {
    try {
      const response = await fetch(`/api/admin/vouchers/${voucher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !voucher.isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update voucher");
      }

      toast.success(
        `Voucher ${voucher.isActive ? "deactivated" : "activated"}`
      );
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update voucher");
    }
  };

  const getValueDisplay = (voucher: Voucher) => {
    if (voucher.type === "percentage") {
      return `${voucher.value}%`;
    }
    return `€${voucher.value.toFixed(2)}`;
  };

  const getUsageDisplay = (voucher: Voucher) => {
    if (voucher.maxUses === null) {
      return `${voucher.usedCount} / Unlimited`;
    }
    return `${voucher.usedCount} / ${voucher.maxUses}`;
  };

  const isExpired = (voucher: Voucher) => {
    if (!voucher.validUntil) return false;
    return new Date(voucher.validUntil) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Voucher Management
          </h1>
          <p className="mt-2 text-gray-600">
            Create and manage discount vouchers
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingVoucher(null);
            setIsFormOpen(true);
          }}
          className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
        >
          <Plus size={18} className="mr-2" />
          Create Voucher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Ticket className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Vouchers</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Active Vouchers</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter((v) => v.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Users className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.reduce((sum, v) => sum + v.usedCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-orange-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Discount</p>
              <p className="text-2xl font-bold text-gray-900">
                €
                {vouchers
                  .reduce((sum, v) => sum + v.totalDiscount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex gap-2">
          {["all", "true", "false"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-[#FF6B35] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All" : f === "true" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers List */}
      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="mx-auto text-gray-300" size={48} />
            <p className="mt-4 text-gray-600">No vouchers found</p>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            >
              Create Your First Voucher
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type / Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-[#FF6B35]">
                        {voucher.code}
                      </div>
                      {voucher.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {voucher.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">
                        {getValueDisplay(voucher)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {voucher.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getUsageDisplay(voucher)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {voucher.validUntil ? (
                        <span
                          className={
                            isExpired(voucher) ? "text-red-600" : ""
                          }
                        >
                          {new Date(voucher.validUntil).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      €{voucher.totalDiscount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(voucher)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          voucher.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {voucher.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingVoucher(voucher);
                            setIsFormOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(voucher.id, voucher.code)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voucher Form Modal */}
      {isFormOpen && (
        <VoucherFormModal
          voucher={editingVoucher}
          onClose={() => {
            setIsFormOpen(false);
            setEditingVoucher(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingVoucher(null);
            fetchVouchers();
          }}
        />
      )}
    </div>
  );
}
