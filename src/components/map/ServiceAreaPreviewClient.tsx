"use client";

import dynamic from "next/dynamic";

const ServiceAreaPreview = dynamic(
  () => import("@/components/map/ServiceAreaPreview"),
  { ssr: false }
);

interface Props {
  lat: number;
  lng: number;
  radiusKm: number;
  city: string;
}

export default function ServiceAreaPreviewClient({ lat, lng, radiusKm, city }: Props) {
  return <ServiceAreaPreview lat={lat} lng={lng} radiusKm={radiusKm} city={city} />;
}
