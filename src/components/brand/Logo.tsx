import Image from "next/image";

const VARIANTS = {
  "horizontal-light": { src: "/brand/fixme-logo-horizontal-light.png", ratio: 4 },
  "horizontal-dark": { src: "/brand/fixme-logo-horizontal-dark.png", ratio: 4 },
  stacked: { src: "/brand/fixme-logo-stacked.png", ratio: 1 },
  icon: { src: "/brand/fixme-app-icon.png", ratio: 1 },
  wrench: { src: "/brand/fixme-wrench-icon.png", ratio: 1 },
} as const;

const SIZES = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 120,
  "2xl": 160,
  "3xl": 192,
} as const;

type LogoProps = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "horizontal-light",
  size = "md",
  className = "",
  priority = false,
}: LogoProps) {
  const v = VARIANTS[variant];
  const h = SIZES[size];
  const w = Math.round(h * v.ratio);

  return (
    <Image
      src={v.src}
      alt="FixMe — Don't throw it away"
      height={h}
      width={w}
      className={`w-auto ${className}`}
      style={{ height: h }}
      priority={priority}
    />
  );
}
