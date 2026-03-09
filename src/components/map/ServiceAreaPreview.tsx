"use client";

import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet";
import { MapPin } from "lucide-react";
import MapWrapper from "./MapWrapper";

interface ServiceAreaPreviewProps {
  lat: number;
  lng: number;
  radiusKm: number;
  city: string;
}

export default function ServiceAreaPreview({ lat, lng, radiusKm, city }: ServiceAreaPreviewProps) {
  // Choose zoom level based on radius so the circle fits nicely
  const zoom = radiusKm <= 5 ? 12 : radiusKm <= 15 ? 11 : radiusKm <= 30 ? 10 : 9;

  return (
    <MapWrapper>
      <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          className="h-[200px] w-full"
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[lat, lng]} />

          <Circle
            center={[lat, lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              fillColor: "#f97316",
              fillOpacity: 0.15,
              color: "#f97316",
              weight: 2,
            }}
          />
        </MapContainer>
      </div>

      <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5" /> {city} · {radiusKm} km service radius
      </p>
    </MapWrapper>
  );
}
