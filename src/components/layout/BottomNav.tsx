"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

interface BottomNavProps {
  content?: Record<string, string>;
}

export default function BottomNav({ content = {} }: BottomNavProps) {
  const pathname = usePathname();

  const t = (key: string, fallback: string) => content[key] || fallback;

  const navItems = [
    { href: "/", icon: Home, label: t("bottomnav_home", "Home"), isActive: pathname === "/" },
    { href: "/browse", icon: Search, label: t("bottomnav_search", "Zoeken"), isActive: pathname === "/browse" },
    { href: "/post", icon: Plus, label: t("bottomnav_post", "Plaats"), isActive: pathname === "/post", isCenter: true },
    { href: "/messages", icon: MessageCircle, label: t("bottomnav_messages", "Berichten"), isActive: pathname === "/messages" },
    { href: "/dashboard", icon: User, label: t("bottomnav_profile", "Profiel"), isActive: pathname === "/dashboard" || pathname.startsWith("/profile") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100/80 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          // Center "Post" button — elevated orange rounded-square
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 -mt-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-primary mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full group"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${item.isActive ? "bg-primary/[0.08]" : ""}`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    item.isActive ? "text-primary" : "text-gray-400 group-active:text-gray-600"
                  }`}
                  strokeWidth={item.isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[10px] font-semibold mt-0.5 transition-colors ${
                  item.isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
