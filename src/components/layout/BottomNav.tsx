"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";

interface BottomNavProps {
  content?: Record<string, string>;
}

export default function BottomNav({ content = {} }: BottomNavProps) {
  const pathname = usePathname();

  const t = (key: string, fallback: string) => content[key] || fallback;

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: t("bottomnav_home", "Home"),
      isActive: pathname === "/",
    },
    {
      href: "/browse",
      icon: Search,
      label: t("bottomnav_search", "Search"),
      isActive: pathname === "/browse",
    },
    {
      href: "/post",
      icon: PlusCircle,
      label: t("bottomnav_post", "Post"),
      isActive: pathname === "/post",
      isSpecial: true, // Orange circle style
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: t("bottomnav_messages", "Messages"),
      isActive: pathname === "/messages",
    },
    {
      href: "/dashboard",
      icon: User,
      label: t("bottomnav_profile", "Profile"),
      isActive: pathname === "/dashboard" || pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 group"
            >
              {item.isSpecial ? (
                <div
                  className={`p-2 rounded-full transition-colors ${
                    isActive ? "bg-primary" : "bg-primary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 text-white`}
                    strokeWidth={2.5}
                  />
                </div>
              ) : (
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
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
