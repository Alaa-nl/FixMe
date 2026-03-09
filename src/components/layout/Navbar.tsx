"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, Bell, User, LogOut, ChevronDown } from "lucide-react";
import Button from "@/components/ui/button";
import NotificationBell from "@/components/layout/NotificationBell";

interface NavbarProps {
  content?: Record<string, string>;
}

export default function Navbar({ content = {} }: NavbarProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = (key: string, fallback: string) => content[key] || fallback;

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = navSearchQuery.trim();
    if (!q) return;
    router.push(`/browse?q=${encodeURIComponent(q)}`);
    setNavSearchQuery("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fetch unread messages count
  useEffect(() => {
    if (session) {
      fetchUnreadCount();
      // Poll every 30 seconds for updates
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/messages/unread");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Expose refresh function globally for other components to use
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refreshUnreadCount = fetchUnreadCount;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).refreshUnreadCount;
      }
    };
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          {t("navbar_logo", "FixMe")}
        </Link>

        {/* Search Bar - Hidden on mobile, visible on md+ */}
        <form onSubmit={handleNavSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder={t("navbar_search_placeholder", "Search for repairs...")}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : session ? (
            <>
              {/* Post a Request Button - Hidden on smallest screens */}
              <Link href="/post" className="hidden sm:block">
                <Button variant="primary" size="sm" className="rounded-full font-bold">
                  {t("navbar_post_request", "Post a request")}
                </Button>
              </Link>

              {/* Messages Icon - Hidden on mobile */}
              <Link
                href="/messages"
                className="hidden md:flex p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <MessageCircle className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Notifications Icon - Hidden on mobile */}
              <div className="hidden md:block">
                <NotificationBell />
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {session.user?.avatarUrl ? (
                    <img
                      src={session.user.avatarUrl}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                      {getInitials(session.user?.name)}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t("navbar_dashboard", "Dashboard")}
                    </Link>

                    <Link
                      href="/profile/edit"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t("navbar_my_profile", "My Profile")}
                    </Link>

                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t("navbar_settings", "Settings")}
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("navbar_logout", "Log out")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login and Register Buttons */}
              <Link href="/login">
                <button className="text-gray-700 font-medium hover:text-primary transition-colors">
                  {t("navbar_login", "Log in")}
                </button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  {t("navbar_register", "Register")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
