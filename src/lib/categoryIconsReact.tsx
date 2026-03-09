import {
  Bike,
  Smartphone,
  Laptop,
  CookingPot,
  Shirt,
  Tv,
  Armchair,
  Scissors,
  Droplets,
  Zap,
  Guitar,
  TreePine,
  Camera,
  Gamepad2,
  Package,
  type LucideIcon,
} from "lucide-react";

// Map category slugs to Lucide icons
export const categoryIconMap: Record<string, LucideIcon> = {
  "bikes-scooters": Bike,
  "phones-tablets": Smartphone,
  "laptops-computers": Laptop,
  "kitchen-appliances": CookingPot,
  "laundry-appliances": Shirt,
  "home-electronics": Tv,
  furniture: Armchair,
  "clothing-shoes": Scissors,
  plumbing: Droplets,
  electrical: Zap,
  "musical-instruments": Guitar,
  "garden-outdoor": TreePine,
  "cameras-optics": Camera,
  "toys-games": Gamepad2,
  other: Package,
};

export function getCategoryLucideIcon(slug: string): LucideIcon {
  return categoryIconMap[slug] || Package;
}

// Render a category icon as a React element
export function CategoryIcon({
  slug,
  className = "w-5 h-5",
}: {
  slug: string;
  className?: string;
}) {
  const Icon = getCategoryLucideIcon(slug);
  return <Icon className={className} />;
}
