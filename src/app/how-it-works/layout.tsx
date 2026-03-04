import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How FixMe Works",
  description: "Learn how FixMe connects customers with local repair professionals. Post your broken item, receive offers, pick a fixer, and get it fixed safely.",
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
