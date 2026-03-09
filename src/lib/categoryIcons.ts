// Legacy string-based category icons — kept for backward compatibility
// For React components, prefer using CategoryIcon from "@/lib/categoryIcons.tsx"

export const categoryIcons: Record<string, string> = {
  "bikes-scooters": "bike",
  "phones-tablets": "smartphone",
  "laptops-computers": "laptop",
  "kitchen-appliances": "cooking-pot",
  "laundry-appliances": "shirt",
  "home-electronics": "tv",
  furniture: "armchair",
  "clothing-shoes": "scissors",
  plumbing: "droplets",
  electrical: "zap",
  "musical-instruments": "guitar",
  "garden-outdoor": "tree-pine",
  "cameras-optics": "camera",
  "toys-games": "gamepad-2",
  other: "package",
};

export function getCategoryIcon(slug: string): string {
  return categoryIcons[slug] || "package";
}
