"use client";

import { MapContainer, TileLayer, Circle } from "react-leaflet";
import { MapPin } from "lucide-react";
import MapWrapper from "./MapWrapper";

interface RequestLocationMapProps {
  lat: number;
  lng: number;
  city: string;
}

export default function RequestLocationMap({ lat, lng, city }: RequestLocationMapProps) {
  return (
    <MapWrapper>
      <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <MapContainer
          center={[lat, lng]}
          zoom={12}
          className="h-[200px] w-full"
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Approximate area circle (for privacy) */}
          <Circle
            center={[lat, lng]}
            radius={1000} // 1km radius for privacy
            pathOptions={{
              fillColor: "#f97316",
              fillOpacity: 0.3,
              color: "#f97316",
              weight: 2,
            }}
          />
        </MapContainer>
      </div>

      <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5" /> Approximate location in {city}
      </p>
    </MapWrapper>
  );
}
