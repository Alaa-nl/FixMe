"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect } from "react";
import L, { LatLngBounds } from "leaflet";
import MapWrapper from "./MapWrapper";
import Link from "next/link";

interface RepairRequest {
  id: string;
  title: string;
  locationLat: number;
  locationLng: number;
  photos: string[];
  category: {
    name: string;
  };
  _count?: {
    offers: number;
  };
  aiDiagnosis?: {
    estimatedCostMin?: number;
    estimatedCostMax?: number;
  };
}

interface MapViewProps {
  requests: RepairRequest[];
}

// Custom orange marker icon
const createOrangeIcon = () => {
  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: #f97316;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        🔧
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component to fit map bounds to markers
function FitBounds({ requests }: { requests: RepairRequest[] }) {
  const map = useMap();

  useEffect(() => {
    if (requests.length > 0) {
      const bounds = new LatLngBounds(
        requests.map((req) => [req.locationLat, req.locationLng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [requests, map]);

  return null;
}

export default function MapView({ requests }: MapViewProps) {
  // Default center (Netherlands)
  const defaultCenter: [number, number] = [52.1326, 5.2913];

  return (
    <MapWrapper>
      <div className="w-full h-full">
        <MapContainer
          center={defaultCenter}
          zoom={7}
          className="w-full h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] rounded-lg"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
          >
            {requests.map((request) => (
              <Marker
                key={request.id}
                position={[request.locationLat, request.locationLng]}
                icon={createOrangeIcon()}
              >
                <Popup maxWidth={300} minWidth={250}>
                  <div className="py-2">
                    {/* Photo */}
                    {request.photos && request.photos.length > 0 && (
                      <img
                        src={request.photos[0]}
                        alt={request.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                      {request.title}
                    </h3>

                    {/* Category */}
                    <p className="text-sm text-gray-600 mb-2">
                      {request.category.name}
                    </p>

                    {/* Price range */}
                    {request.aiDiagnosis?.estimatedCostMin && request.aiDiagnosis?.estimatedCostMax && (
                      <p className="text-sm text-primary font-semibold mb-2">
                        €{request.aiDiagnosis.estimatedCostMin} - €{request.aiDiagnosis.estimatedCostMax}
                      </p>
                    )}

                    {/* Offers count */}
                    {request._count && (
                      <p className="text-xs text-gray-500 mb-3">
                        {request._count.offers} {request._count.offers === 1 ? "offer" : "offers"}
                      </p>
                    )}

                    {/* View details link */}
                    <Link
                      href={`/request/${request.id}`}
                      className="block w-full bg-primary text-white text-center py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      View details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          <FitBounds requests={requests} />
        </MapContainer>
      </div>
    </MapWrapper>
  );
}
