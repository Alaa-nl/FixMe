"use client";

import { useRouter } from "next/navigation";
import OfferCard from "./OfferCard";

interface OffersListProps {
  offers: Array<{
    id: string;
    price: number;
    estimatedTime: string;
    message: string;
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
}

export default function OffersList({ offers, isRequestOwner }: OffersListProps) {
  const router = useRouter();

  const handleAccept = async (offerId: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/accept`, {
        method: "POST",
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

  const handleMessage = (fixerId: string) => {
    router.push(`/messages?userId=${fixerId}`);
  };

  return (
    <div>
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isRequestOwner={isRequestOwner}
          onAccept={handleAccept}
          onMessage={handleMessage}
        />
      ))}
    </div>
  );
}
