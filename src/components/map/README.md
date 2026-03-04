# Map Components Documentation

This folder contains all map-related components for the FixMe app using Leaflet and OpenStreetMap.

## 📦 Installed Packages

```bash
npm install leaflet react-leaflet react-leaflet-cluster
npm install -D @types/leaflet
```

## 🗺️ Components

### 1. MapWrapper

**File:** `MapWrapper.tsx`

Base wrapper component that fixes Leaflet icon issues in Next.js. All map components should be wrapped with this.

**Usage:**
```tsx
import MapWrapper from "@/components/map/MapWrapper";

<MapWrapper>
  {/* Your map content */}
</MapWrapper>
```

---

### 2. LocationPicker

**File:** `LocationPicker.tsx`

Interactive map for selecting a location. Used in the post repair request form.

**Features:**
- Address search using Nominatim API
- Click to place marker
- Draggable marker
- "Use my location" button
- Reverse geocoding
- Returns: `{ lat, lng, city, address }`

**Usage:**
```tsx
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
  ssr: false,
});

<LocationPicker
  onLocationSelect={(location) => {
    setCity(location.city);
    setAddress(location.address);
    setLocationLat(location.lat);
    setLocationLng(location.lng);
  }}
  initialLat={52.3676}
  initialLng={4.9041}
  initialAddress=""
/>
```

**Props:**
- `onLocationSelect`: `(location: { lat, lng, city, address }) => void`
- `initialLat?`: `number` (default: 52.3676 - Amsterdam)
- `initialLng?`: `number` (default: 4.9041 - Amsterdam)
- `initialAddress?`: `string`

---

### 3. MapView

**File:** `MapView.tsx`

Displays multiple repair requests as markers on a map. Used on the browse page.

**Features:**
- Marker clustering
- Custom orange markers
- Popups with request details
- Auto-fit bounds to show all markers
- Click marker to see details

**Usage:**
```tsx
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
});

<MapView requests={requests} />
```

**Props:**
- `requests`: Array of repair requests with:
  - `id`, `title`, `photos`, `locationLat`, `locationLng`
  - `category: { name }`
  - `_count?: { offers }`
  - `aiDiagnosis?: { estimatedCostMin, estimatedCostMax }`

---

### 4. ServiceAreaMap

**File:** `ServiceAreaMap.tsx`

Shows a fixer's service area as a circle on the map. Can be editable or read-only.

**Features:**
- Center marker
- Radius circle
- Editable: click to change center location
- Read-only: just displays service area

**Usage:**
```tsx
import dynamic from "next/dynamic";

const ServiceAreaMap = dynamic(() => import("@/components/map/ServiceAreaMap"), {
  ssr: false,
});

// Editable (for fixer profile edit)
<ServiceAreaMap
  initialLat={fixer.locationLat}
  initialLng={fixer.locationLng}
  radiusKm={fixer.serviceRadiusKm}
  onLocationChange={(lat, lng) => {
    setLocationLat(lat);
    setLocationLng(lng);
  }}
  editable={true}
/>

// Read-only (for public fixer profile)
<ServiceAreaMap
  initialLat={fixer.locationLat}
  initialLng={fixer.locationLng}
  radiusKm={fixer.serviceRadiusKm}
  editable={false}
/>
```

**Props:**
- `initialLat?`: `number` (default: 52.3676)
- `initialLng?`: `number` (default: 4.9041)
- `radiusKm?`: `number` (default: 10)
- `onLocationChange?`: `(lat: number, lng: number) => void`
- `editable?`: `boolean` (default: false)

---

### 5. RequestLocationMap

**File:** `RequestLocationMap.tsx`

Shows the approximate location of a repair request (for privacy).

**Features:**
- Shows city area, not exact address
- 1km radius circle
- Non-interactive (no dragging/zooming)
- Small compact display

**Usage:**
```tsx
import dynamic from "next/dynamic";

const RequestLocationMap = dynamic(() => import("@/components/map/RequestLocationMap"), {
  ssr: false,
});

<RequestLocationMap
  lat={request.locationLat}
  lng={request.locationLng}
  city={request.city}
/>
```

**Props:**
- `lat`: `number`
- `lng`: `number`
- `city`: `string`

---

## ⚠️ Important: SSR Handling

**Leaflet does NOT work with Server-Side Rendering (SSR).**

Always import map components using Next.js `dynamic` with `ssr: false`:

```tsx
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
});
```

---

## 🌍 Geocoding API

All components use the free **Nominatim API** (OpenStreetMap):

**Search (Address → Coordinates):**
```
https://nominatim.openstreetmap.org/search?q=ADDRESS&format=json&countrycodes=nl&limit=5
```

**Reverse Geocoding (Coordinates → Address):**
```
https://nominatim.openstreetmap.org/reverse?lat=LAT&lon=LNG&format=json
```

**Rate Limits:**
- Maximum 1 request per second
- Must include User-Agent header
- Search is debounced to 500ms in components

**Headers:**
```javascript
{
  "User-Agent": "FixMe App (fixme.nl)"
}
```

---

## 🎨 Styling

All map components use:
- **Border:** `border-2 border-gray-200`
- **Rounded corners:** `rounded-lg`
- **Shadow:** `shadow-sm`
- **Primary color:** `#f97316` (orange) for markers and circles

Map heights:
- LocationPicker: `300px` mobile, `400px` desktop
- MapView: `calc(100vh-200px)` responsive
- ServiceAreaMap: `300px` mobile, `400px` desktop
- RequestLocationMap: `200px` fixed

---

## 📍 Default Location

Default center for maps (Amsterdam):
- **Latitude:** 52.3676
- **Longitude:** 4.9041

---

## 🔧 Map Tiles

Using OpenStreetMap tiles:
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

Attribution (required):
```
&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
```

---

## 📱 Mobile Responsiveness

All components are fully responsive:
- Touch-friendly markers and controls
- Responsive heights
- Mobile-optimized UI elements

---

## 🚀 Where Maps Are Used

1. **Post Form** (`/post`) - LocationPicker
2. **Browse Page** (`/browse`) - MapView with list/map toggle
3. **Fixer Profile Edit** - ServiceAreaMap (editable)
4. **Public Fixer Profile** (`/fixer/[id]`) - ServiceAreaMap (read-only)
5. **Request Detail** (`/request/[id]`) - RequestLocationMap

---

## 🐛 Troubleshooting

**Map not loading:**
- Check that component is imported with `dynamic` and `ssr: false`
- Verify Leaflet CSS is loaded in `layout.tsx`
- Check browser console for errors

**Markers not showing:**
- Icon fix is applied in MapWrapper component
- Ensure MapWrapper wraps all map content

**Geocoding not working:**
- Check network tab for Nominatim API responses
- Verify User-Agent header is present
- Check rate limiting (max 1 req/sec)

---

## 📝 Notes

- All coordinates use decimal degrees format
- Radius measurements are in kilometers
- Privacy: Request locations show approximate area, not exact address
- All maps support Dutch addresses via `countrycodes=nl` parameter
