"use client";

import { useEffect } from "react";
import L from "leaflet";

// Fix for Leaflet default marker icons in Next.js
// The webpack bundler breaks the default icon paths
export function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface MapWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for Leaflet maps that fixes icon issues
 * Must be used with all map components
 */
export default function MapWrapper({ children, className = "" }: MapWrapperProps) {
  useEffect(() => {
    // Fix Leaflet icons on mount
    fixLeafletIcons();
  }, []);

  return <div className={className}>{children}</div>;
}
