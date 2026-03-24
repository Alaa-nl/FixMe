"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OfferCard from "./OfferCard";
import SchedulePickerModal from "@/components/scheduling/SchedulePickerModal";

interface OffersListProps {
  offers: Array<{
    id: string;
    price: number;
    estimatedTime: string;
    message: string;
    suggestedTimes?: string[] | null;
    status: string;
    createdAt: Date | string;
    fixer: {
      id: string;
      name: string;
      avatarUrl: string | null;
      fixerProfile: {
        averageRating: number;
        totalJobs: number;
        verifiedBadge: boolean;
      } | null;
    };
  }>;
  isRequestOwner: boolean;
  requestStatus: string;
  repairRequestId: string;
  currentUserId?: string;
}

export default function OffersList({ offers, isRequestOwner, requestStatus, repairRequestId, currentUserId }: OffersListProps) {
  const router = useRouter();
  const [counterProposing, setCounterProposing] = useState<{
    offerId: string;
    fixerId: string;
    fixerName: string;
  } | null>(null);

  const acceptOffer = async (offerId: string, scheduledAt?: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: scheduledAt || null }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept offer");
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const rejectOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject offer");
      }
    } catch (error) {
      console.error("Error rejecting offer:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleMessage = async (fixerId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: fixerId, repairRequestId }),
      });
      if (res.ok) {
        const { conversationId } = await res.json();
        router.push(`/messages/${conversationId}`);
      } else {
        router.push(`/messages?userId=${fixerId}`);
      }
    } catch {
      router.push(`/messages?userId=${fixerId}`);
    }
  };

  const withdrawOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/withdraw`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to withdraw offer");
      }
    } catch {
      alert("An error occurred. Please try again.");
    }
  };

  const handleCounterPropose = (offerId: string, fixerId: string, fixerName: string) => {
    setCounterProposing({ offerId, fixerId, fixerName });
  };

  return (
    <div>
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isRequestOwner={isRequestOwner}
          isOfferOwner={currentUserId === offer.fixer.id}
          requestStatus={requestStatus}
          onAccept={acceptOffer}
          onReject={rejectOffer}
          onMessage={handleMessage}
          onCounterPropose={handleCounterPropose}
          onWithdraw={withdrawOffer}
        />
      ))}

      {/* Counter-propose modal: lets customer pick from fixer's availability */}
      {counterProposing && (
        <SchedulePickerModal
          fixerId={counterProposing.fixerId}
          fixerName={counterProposing.fixerName}
          onConfirm={(scheduledAt) => {
            acceptOffer(counterProposing.offerId, scheduledAt);
            setCounterProposing(null);
          }}
          onSkip={() => {
            acceptOffer(counterProposing.offerId);
            setCounterProposing(null);
          }}
          onClose={() => setCounterProposing(null)}
        />
      )}
    </div>
  );
}
