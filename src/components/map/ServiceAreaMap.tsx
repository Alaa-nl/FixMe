"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
import MapWrapper from "./MapWrapper";

interface ServiceAreaMapProps {
  initialLat?: number;
  initialLng?: number;
  radiusKm?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  editable?: boolean;
}

// Component to handle map clicks
function LocationSelector({ onLocationChange }: { onLocationChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function ServiceAreaMap({
  initialLat = 52.3676,
  initialLng = 4.9041,
  radiusKm = 10,
  onLocationChange,
  editable = false,
}: ServiceAreaMapProps) {
  const [center, setCenter] = useState<[number, number]>([initialLat, initialLng]);

  const handleLocationChange = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  return (
    <MapWrapper>
      <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <MapContainer
          center={center}
          zoom={11}
          className="h-[300px] md:h-[400px] w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Center marker */}
          <Marker position={center} />

          {/* Service area circle */}
          <Circle
            center={center}
            radius={radiusKm * 1000} // Convert km to meters
            pathOptions={{
              fillColor: "#f97316",
              fillOpacity: 0.2,
              color: "#f97316",
              weight: 2,
            }}
          />

          {editable && <LocationSelector onLocationChange={handleLocationChange} />}
        </MapContainer>
      </div>

      {editable && (
        <p className="mt-2 text-sm text-gray-600">
          Click on the map to change your location
        </p>
      )}
    </MapWrapper>
  );
}
