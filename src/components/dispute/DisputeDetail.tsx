"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";
import Button from "@/components/ui/button";

interface DisputeDetailProps {
  disputeId: string;
  isAdmin?: boolean;
}

export default function DisputeDetail({ disputeId, isAdmin }: DisputeDetailProps) {
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [userRole, setUserRole] = useState<"admin" | "fixer" | "customer">("customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admin resolution form state
  const [resolution, setResolution] = useState<"REFUNDED" | "RELEASED" | "PARTIAL_REFUND">("RELEASED");
  const [adminNotes, setAdminNotes] = useState("");
  const [adminRefundAmount, setAdminRefundAmount] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  // Fixer response form state
  const [fixerResponseType, setFixerResponseType] = useState<"PARTIAL_REFUND" | "FULL_REFUND" | "REJECT">("FULL_REFUND");
  const [fixerRefundAmount, setFixerRefundAmount] = useState("");
  const [fixerMessage, setFixerMessage] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [respondError, setRespondError] = useState("");

  // Customer response state
  const [customerMessage, setCustomerMessage] = useState("");
  const [isCustomerResponding, setIsCustomerResponding] = useState(false);
  const [customerRespondError, setCustomerRespondError] = useState("");

  // Platform settings
  const [windowHours, setWindowHours] = useState(72);

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
      setUserRole(data.userRole || (isAdmin ? "admin" : "customer"));
      if (data.disputeWindowHours) setWindowHours(data.disputeWindowHours);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResolve = async (e: React.FormEvent) => {
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
          refundAmount: resolution === "PARTIAL_REFUND" ? parseFloat(adminRefundAmount) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to resolve dispute");

      await fetchDispute();
      router.refresh();
    } catch (err: any) {
      setResolveError(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleFixerRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    setRespondError("");
    setIsResponding(true);

    try {
      const response = await fetch(`/api/disputes/${disputeId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseType: fixerResponseType,
          refundAmount: fixerResponseType === "PARTIAL_REFUND" ? parseFloat(fixerRefundAmount) : undefined,
          message: fixerMessage.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to respond");

      await fetchDispute();
      router.refresh();
    } catch (err: any) {
      setRespondError(err.message);
    } finally {
      setIsResponding(false);
    }
  };

  const handleCustomerRespond = async (accepted: boolean) => {
    setCustomerRespondError("");
    setIsCustomerResponding(true);

    try {
      const response = await fetch(`/api/disputes/${disputeId}/customer-respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted,
          message: customerMessage.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to respond");

      await fetchDispute();
      router.refresh();
    } catch (err: any) {
      setCustomerRespondError(err.message);
    } finally {
      setIsCustomerResponding(false);
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

  // Compute hours remaining for PENDING disputes
  const hoursElapsed = (Date.now() - new Date(dispute.createdAt).getTime()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, windowHours - hoursElapsed);
  const isExpired = hoursRemaining <= 0 && dispute.resolution === "PENDING";

  const payment = dispute.job.payments?.[0];
  const maxRefundAmount = payment?.amount || dispute.job.agreedPrice || 0;

  const isFinalState = ["REFUNDED", "PARTIAL_REFUND", "RELEASED"].includes(dispute.resolution);

  const getStatusBanner = () => {
    switch (dispute.resolution) {
      case "PENDING":
        return (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-6 py-4 mb-6">
            <p className="font-semibold">Awaiting fixer response</p>
            <p className="text-sm">
              {isExpired
                ? `The ${windowHours}-hour response window has expired. This dispute will be escalated to admin.`
                : `The fixer has ${Math.floor(hoursRemaining)}h ${Math.floor((hoursRemaining % 1) * 60)}m to respond. Payment is on hold.`}
            </p>
          </div>
        );
      case "FIXER_OFFERED":
        return (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 px-6 py-4 mb-6">
            <p className="font-semibold">Fixer made an offer</p>
            <p className="text-sm">
              {dispute.fixerResponseType === "FULL_REFUND"
                ? "The fixer offered a full refund. Awaiting customer decision."
                : `The fixer offered a partial refund of €${dispute.fixerRefundAmount?.toFixed(2)}. Awaiting customer decision.`}
            </p>
          </div>
        );
      case "FIXER_REJECTED":
        return (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 px-6 py-4 mb-6">
            <p className="font-semibold">Escalated to admin — fixer rejected dispute</p>
            <p className="text-sm">The fixer rejected this dispute. It is now under admin review.</p>
          </div>
        );
      case "ESCALATED":
        return (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 px-6 py-4 mb-6">
            <p className="font-semibold">Escalated to admin</p>
            <p className="text-sm">
              {dispute.escalationReason === "TIMEOUT"
                ? `The fixer did not respond within ${windowHours} hours.`
                : dispute.escalationReason === "CUSTOMER_REJECTED"
                ? "The customer rejected the fixer's offer."
                : "This dispute is under admin review."}
            </p>
          </div>
        );
      case "REFUNDED":
        return (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 px-6 py-4 mb-6">
            <p className="font-semibold">Resolved — Payment refunded to customer</p>
            <p className="text-sm">Resolved {dispute.resolvedAt ? timeAgo(dispute.resolvedAt) : "recently"}</p>
          </div>
        );
      case "PARTIAL_REFUND":
        return (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-800 px-6 py-4 mb-6">
            <p className="font-semibold">Resolved — Partial refund issued</p>
            <p className="text-sm">
              €{dispute.fixerRefundAmount?.toFixed(2)} refunded. Resolved {dispute.resolvedAt ? timeAgo(dispute.resolvedAt) : "recently"}
            </p>
          </div>
        );
      case "RELEASED":
        return (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-800 px-6 py-4 mb-6">
            <p className="font-semibold">Resolved — Payment released to fixer</p>
            <p className="text-sm">Resolved {dispute.resolvedAt ? timeAgo(dispute.resolvedAt) : "recently"}</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Build timeline events
  const timelineEvents: { label: string; detail: string; time: string; color: string }[] = [
    {
      label: "Dispute opened",
      detail: `${dispute.openedBy.name} opened a dispute`,
      time: dispute.createdAt,
      color: "bg-red-500",
    },
  ];

  if (dispute.fixerRespondedAt) {
    const responseLabel =
      dispute.fixerResponseType === "REJECT"
        ? "Fixer rejected dispute"
        : dispute.fixerResponseType === "FULL_REFUND"
        ? "Fixer offered full refund"
        : `Fixer offered partial refund (€${dispute.fixerRefundAmount?.toFixed(2)})`;

    timelineEvents.push({
      label: responseLabel,
      detail: dispute.fixerMessage || "No message provided",
      time: dispute.fixerRespondedAt,
      color: dispute.fixerResponseType === "REJECT" ? "bg-red-500" : "bg-blue-500",
    });
  }

  if (dispute.customerRespondedAt) {
    timelineEvents.push({
      label: dispute.customerAccepted ? "Customer accepted offer" : "Customer rejected offer",
      detail: dispute.customerMessage || "No message provided",
      time: dispute.customerRespondedAt,
      color: dispute.customerAccepted ? "bg-green-500" : "bg-orange-500",
    });
  }

  if (dispute.escalatedAt) {
    const reasonMap: Record<string, string> = {
      TIMEOUT: `${windowHours}-hour response window expired`,
      FIXER_REJECTED: "Fixer rejected the dispute",
      CUSTOMER_REJECTED: "Customer rejected fixer's offer",
      ADMIN_OVERRIDE: "Admin stepped in",
    };
    timelineEvents.push({
      label: "Escalated to admin",
      detail: reasonMap[dispute.escalationReason] || "Escalated for review",
      time: dispute.escalatedAt,
      color: "bg-orange-500",
    });
  }

  if (dispute.resolvedAt) {
    const resMap: Record<string, string> = {
      REFUNDED: "Full refund issued to customer",
      PARTIAL_REFUND: `Partial refund of €${dispute.fixerRefundAmount?.toFixed(2)} issued`,
      RELEASED: "Payment released to fixer",
    };
    timelineEvents.push({
      label: "Dispute resolved",
      detail: resMap[dispute.resolution] || "Resolved",
      time: dispute.resolvedAt,
      color: "bg-green-500",
    });
  }

  // Check if admin can resolve (dispute is in a resolvable state)
  const canAdminResolve = userRole === "admin" && ["PENDING", "FIXER_OFFERED", "FIXER_REJECTED", "ESCALATED"].includes(dispute.resolution);
  const canFixerRespond = userRole === "fixer" && dispute.resolution === "PENDING" && !isExpired;
  const canCustomerRespond = userRole === "customer" && dispute.resolution === "FIXER_OFFERED";

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
                <Link href={`/profile/${dispute.job.customer.id}`} className="flex items-center gap-3 group">
                  {dispute.job.customer.avatarUrl ? (
                    <img
                      src={dispute.job.customer.avatarUrl}
                      alt={dispute.job.customer.name}
                      className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold group-hover:ring-2 group-hover:ring-primary transition-all">
                      {dispute.job.customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-primary transition-colors">{dispute.job.customer.name}</p>
                  </div>
                </Link>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Fixer:</p>
                <Link href={`/profile/${dispute.job.fixer.id}`} className="flex items-center gap-3 group">
                  {dispute.job.fixer.avatarUrl ? (
                    <img
                      src={dispute.job.fixer.avatarUrl}
                      alt={dispute.job.fixer.name}
                      className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold group-hover:ring-2 group-hover:ring-primary transition-all">
                      {dispute.job.fixer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-primary transition-colors">{dispute.job.fixer.name}</p>
                  </div>
                </Link>
              </div>
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
                  <div key={index} className="relative group h-32">
                    <Image
                      src={photo}
                      alt={`Evidence ${index + 1}`}
                      fill
                      className="object-cover rounded-lg border border-gray-200"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Timeline</h3>
            <div className="space-y-0">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex gap-4">
                  {/* Dot + Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${event.color} shrink-0 mt-1.5`} />
                    {index < timelineEvents.length - 1 && (
                      <div className="w-0.5 bg-gray-200 flex-1 min-h-[40px]" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-6">
                    <p className="font-semibold text-gray-800 text-sm">{event.label}</p>
                    <p className="text-gray-600 text-sm">{event.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          {payment && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h3>
              <div className="space-y-2">
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
            </div>
          )}

          {/* Admin Notes (if resolved) */}
          {isFinalState && dispute.adminNotes && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Admin Resolution Notes</h3>
              <p className="text-blue-800">{dispute.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Fixer Response Form */}
          {canFixerRespond && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Respond to Dispute</h3>
              <p className="text-sm text-gray-500 mb-4">
                You have {Math.floor(hoursRemaining)}h {Math.floor((hoursRemaining % 1) * 60)}m to respond
              </p>

              <form onSubmit={handleFixerRespond} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Your response *</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="fixerResponse"
                        value="FULL_REFUND"
                        checked={fixerResponseType === "FULL_REFUND"}
                        onChange={() => setFixerResponseType("FULL_REFUND")}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Offer full refund</p>
                        <p className="text-sm text-gray-600">Refund €{maxRefundAmount.toFixed(2)} to customer</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="fixerResponse"
                        value="PARTIAL_REFUND"
                        checked={fixerResponseType === "PARTIAL_REFUND"}
                        onChange={() => setFixerResponseType("PARTIAL_REFUND")}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Offer partial refund</p>
                        <p className="text-sm text-gray-600">Propose an amount to refund</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="fixerResponse"
                        value="REJECT"
                        checked={fixerResponseType === "REJECT"}
                        onChange={() => setFixerResponseType("REJECT")}
                        className="w-4 h-4 text-red-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Reject dispute</p>
                        <p className="text-sm text-gray-600">Dispute will be escalated to admin</p>
                      </div>
                    </label>
                  </div>
                </div>

                {fixerResponseType === "PARTIAL_REFUND" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Refund amount (max €{maxRefundAmount.toFixed(2)}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={maxRefundAmount}
                        value={fixerRefundAmount}
                        onChange={(e) => setFixerRefundAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message (optional)</label>
                  <textarea
                    value={fixerMessage}
                    onChange={(e) => setFixerMessage(e.target.value)}
                    placeholder="Explain your decision..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[80px]"
                  />
                </div>

                {respondError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {respondError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isResponding}
                  className="w-full"
                >
                  {isResponding ? "Submitting..." : "Submit response"}
                </Button>
              </form>
            </div>
          )}

          {/* Customer Response to Fixer Offer */}
          {canCustomerRespond && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Fixer&apos;s Offer</h3>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                {dispute.fixerResponseType === "FULL_REFUND" ? (
                  <p className="font-semibold text-blue-900">Full refund of €{maxRefundAmount.toFixed(2)}</p>
                ) : (
                  <p className="font-semibold text-blue-900">
                    Partial refund of €{dispute.fixerRefundAmount?.toFixed(2)}
                  </p>
                )}
                {dispute.fixerMessage && (
                  <p className="text-blue-800 text-sm mt-2">{dispute.fixerMessage}</p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message (optional)</label>
                  <textarea
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    placeholder="Add a message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[60px]"
                  />
                </div>

                {customerRespondError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {customerRespondError}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isCustomerResponding}
                    className="flex-1"
                    onClick={() => handleCustomerRespond(true)}
                  >
                    {isCustomerResponding ? "Processing..." : "Accept offer"}
                  </Button>
                  <button
                    type="button"
                    disabled={isCustomerResponding}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                    onClick={() => handleCustomerRespond(false)}
                  >
                    Reject & escalate
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Rejecting will escalate the dispute to admin review
                </p>
              </div>
            </div>
          )}

          {/* Admin Resolution Form */}
          {canAdminResolve && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Admin: Resolve Dispute</h3>

              <form onSubmit={handleAdminResolve} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Resolution *</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="adminResolution"
                        value="RELEASED"
                        checked={resolution === "RELEASED"}
                        onChange={() => setResolution("RELEASED")}
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
                        name="adminResolution"
                        value="REFUNDED"
                        checked={resolution === "REFUNDED"}
                        onChange={() => setResolution("REFUNDED")}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Full refund to customer</p>
                        <p className="text-sm text-gray-600">Refund €{maxRefundAmount.toFixed(2)}</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="adminResolution"
                        value="PARTIAL_REFUND"
                        checked={resolution === "PARTIAL_REFUND"}
                        onChange={() => setResolution("PARTIAL_REFUND")}
                        className="w-4 h-4 text-yellow-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Partial refund</p>
                        <p className="text-sm text-gray-600">Specify an amount to refund</p>
                      </div>
                    </label>
                  </div>
                </div>

                {resolution === "PARTIAL_REFUND" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Refund amount (max €{maxRefundAmount.toFixed(2)}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={maxRefundAmount}
                        value={adminRefundAmount}
                        onChange={(e) => setAdminRefundAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admin notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Explain your decision..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                  />
                </div>

                {resolveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {resolveError}
                  </div>
                )}

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
          )}

          {/* Quick Actions (for resolved disputes or non-actionable states) */}
          {!canFixerRespond && !canCustomerRespond && !canAdminResolve && (
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
