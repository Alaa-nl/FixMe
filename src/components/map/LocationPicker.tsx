"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { LatLng } from "leaflet";
import MapWrapper from "./MapWrapper";
import { Search, MapPin } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    city: string;
    address: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Component to handle map clicks and marker updates
function LocationMarker({ position, setPosition }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} draggable={true} eventHandlers={{
    dragend: (e) => {
      setPosition(e.target.getLatLng());
    },
  }} />;
}

// Component to update map center when position changes
function MapUpdater({ center }: { center: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);

  return null;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = 52.3676,
  initialLng = 4.9041,
  initialAddress = "",
}: LocationPickerProps) {
  const [position, setPosition] = useState<LatLng | null>(
    initialLat && initialLng ? new LatLng(initialLat, initialLng) : null
  );
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [useLocationLoading, setUseLocationLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Reverse geocode when position changes
  useEffect(() => {
    if (position) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const searchAddress = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&countrycodes=nl&limit=5`,
        {
          headers: {
            "User-Agent": "FixMe App (fixme.nl)",
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "FixMe App (fixme.nl)",
          },
        }
      );
      const data = await response.json();

      const address = data.display_name || "";
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";

      setSelectedAddress(address);
      onLocationSelect({
        lat,
        lng,
        city,
        address,
      });
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = new LatLng(lat, lng);

    setPosition(newPos);
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleUseMyLocation = () => {
    setUseLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = new LatLng(latitude, longitude);
          setPosition(newPos);
          setUseLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enable location services.");
          setUseLocationLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setUseLocationLoading(false);
    }
  };

  return (
    <MapWrapper>
      <div className="w-full">
        {/* Search Box */}
        <div className="relative mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <p className="text-sm text-gray-800">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use My Location Button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={useLocationLoading}
          className="mb-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <MapPin className="w-4 h-4" />
          {useLocationLoading ? "Getting location..." : "Use my location"}
        </button>

        {/* Map */}
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <MapContainer
            center={position || [initialLat, initialLng]}
            zoom={13}
            className="h-[300px] md:h-[400px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <MapUpdater center={position} />
          </MapContainer>
        </div>

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-1">Selected location:</p>
            <p className="text-sm text-gray-800">{selectedAddress}</p>
          </div>
        )}
      </div>
    </MapWrapper>
  );
}
