export const categoryIcons: Record<string, string> = {
  "bikes-scooters": "🚲",
  "phones-tablets": "📱",
  "laptops-computers": "💻",
  "kitchen-appliances": "🍳",
  "laundry-appliances": "👕",
  "home-electronics": "📺",
  furniture: "🪑",
  "clothing-shoes": "👗",
  plumbing: "🚿",
  electrical: "💡",
  "musical-instruments": "🎸",
  "garden-outdoor": "🌿",
  "cameras-optics": "📷",
  "toys-games": "🧸",
  other: "📦",
};

export function getCategoryIcon(slug: string): string {
  return categoryIcons[slug] || "📦";
}
