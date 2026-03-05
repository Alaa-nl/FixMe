"use client";

import dynamic from "next/dynamic";

const RequestLocationMap = dynamic(
  () => import("@/components/map/RequestLocationMap"),
  { ssr: false }
);

interface Props {
  lat: number;
  lng: number;
  city: string;
}

export default function RequestLocationMapClient({ lat, lng, city }: Props) {
  return <RequestLocationMap lat={lat} lng={lng} city={city} />;
}
