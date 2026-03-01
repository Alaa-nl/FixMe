"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface DisputeDetailProps {
  disputeId: string;
  isAdmin?: boolean;
}

export default function DisputeDetail({ disputeId, isAdmin }: DisputeDetailProps) {
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admin resolution form state
  const [resolution, setResolution] = useState<"REFUNDED" | "RELEASED">("RELEASED");
  const [adminNotes, setAdminNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  const fetchDispute = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch dispute");
      }

      setDispute(data.dispute);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolveError("");
    setIsResolving(true);

    try {
      const response = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve dispute");
      }

      // Refresh dispute data
      await fetchDispute();
      router.refresh();
    } catch (err: any) {
      setResolveError(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading dispute...</div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        {error || "Dispute not found"}
      </div>
    );
  }

  const getStatusBanner = () => {
    switch (dispute.resolution) {
      case "PENDING":
        return (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-6 py-4 mb-6">
            <p className="font-semibold">⏳ Dispute is pending admin review</p>
            <p className="text-sm">Payment is on hold until this dispute is resolved.</p>
          </div>
        );
      case "REFUNDED":
        return (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 px-6 py-4 mb-6">
            <p className="font-semibold">💰 Dispute resolved - Payment refunded to customer</p>
            <p className="text-sm">Resolved {dispute.resolvedAt ? timeAgo(dispute.resolvedAt) : "recently"}</p>
          </div>
        );
      case "RELEASED":
        return (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-800 px-6 py-4 mb-6">
            <p className="font-semibold">✅ Dispute resolved - Payment released to fixer</p>
            <p className="text-sm">Resolved {dispute.resolvedAt ? timeAgo(dispute.resolvedAt) : "recently"}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Status Banner */}
      {getStatusBanner()}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispute Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dispute Details</h2>

            {/* Job */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-1">Job:</p>
              <Link
                href={`/jobs/${dispute.job.id}`}
                className="text-lg text-primary hover:underline font-medium"
              >
                {dispute.job.repairRequest.title}
              </Link>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Customer:</p>
                <div className="flex items-center gap-3">
                  {dispute.job.customer.avatarUrl ? (
                    <img
                      src={dispute.job.customer.avatarUrl}
                      alt={dispute.job.customer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                      {dispute.job.customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{dispute.job.customer.name}</p>
                    <p className="text-sm text-gray-500">{dispute.job.customer.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Fixer:</p>
                <div className="flex items-center gap-3">
                  {dispute.job.fixer.avatarUrl ? (
                    <img
                      src={dispute.job.fixer.avatarUrl}
                      alt={dispute.job.fixer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                      {dispute.job.fixer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{dispute.job.fixer.name}</p>
                    <p className="text-sm text-gray-500">{dispute.job.fixer.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opened By */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-1">Opened by:</p>
              <p className="text-gray-800">{dispute.openedBy.name} - {timeAgo(dispute.createdAt)}</p>
            </div>

            {/* Reason */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-900 mb-2">Reason for dispute:</p>
              <p className="text-gray-800 whitespace-pre-wrap">{dispute.reason}</p>
            </div>
          </div>

          {/* Evidence Photos */}
          {dispute.evidencePhotos && dispute.evidencePhotos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Evidence Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dispute.evidencePhotos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {dispute.job.payments && dispute.job.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h3>
              {dispute.job.payments.map((payment: any) => (
                <div key={payment.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total amount:</span>
                    <span className="font-semibold">€{payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform fee (15%):</span>
                    <span className="font-semibold">€{payment.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fixer payout (85%):</span>
                    <span className="font-semibold">€{payment.fixerPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Payment status:</span>
                    <span className={`font-semibold ${
                      payment.status === "HELD" ? "text-yellow-600" :
                      payment.status === "RELEASED" ? "text-green-600" :
                      payment.status === "REFUNDED" ? "text-blue-600" :
                      "text-gray-600"
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin Resolution Notes (if resolved) */}
          {dispute.resolution !== "PENDING" && dispute.adminNotes && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Admin Resolution Notes</h3>
              <p className="text-blue-800">{dispute.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Right: Admin Actions */}
        <div className="lg:col-span-1">
          {isAdmin && dispute.resolution === "PENDING" ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resolve Dispute</h3>

              <form onSubmit={handleResolve} className="space-y-4">
                {/* Resolution Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Resolution *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="resolution"
                        value="RELEASED"
                        checked={resolution === "RELEASED"}
                        onChange={(e) => setResolution(e.target.value as "RELEASED")}
                        className="w-4 h-4 text-green-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Release to fixer</p>
                        <p className="text-sm text-gray-600">Fixer did the work properly</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="resolution"
                        value="REFUNDED"
                        checked={resolution === "REFUNDED"}
                        onChange={(e) => setResolution(e.target.value as "REFUNDED")}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Refund to customer</p>
                        <p className="text-sm text-gray-600">Issue with the work done</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin notes (optional)
                  </label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Explain your decision..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                  />
                </div>

                {/* Error */}
                {resolveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {resolveError}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isResolving}
                  className="w-full"
                >
                  {isResolving ? "Resolving..." : "Resolve dispute"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/jobs/${dispute.job.id}`}
                  className="block w-full px-4 py-2 bg-primary text-white text-center rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View job details
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-2 bg-gray-200 text-gray-800 text-center rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
