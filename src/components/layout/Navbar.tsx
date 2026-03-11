"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, User, LogOut, ChevronDown, Wrench, Settings, LayoutDashboard } from "lucide-react";
import Image from "next/image";
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
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = (key: string, fallback: string) => content[key] || fallback;

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = navSearchQuery.trim();
    if (!q) return;
    router.push(`/browse?q=${encodeURIComponent(q)}`);
    setNavSearchQuery("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Poll unread messages
  useEffect(() => {
    if (session) {
      fetchUnreadCount();
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100/80 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src="/FixMe_logo_letters.svg"
            alt="FixMe"
            width={120}
            height={56}
            className="h-8 md:h-9 w-auto"
            priority
          />
        </Link>

        {/* Search bar — desktop */}
        <form onSubmit={handleNavSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${searchFocused ? "text-primary" : "text-gray-400"}`} />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={t("navbar_search_placeholder", "Zoek reparaties...")}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all text-sm"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          ) : session ? (
            <>
              {/* Post button */}
              <Link href="/post" className="hidden sm:block">
                <Button variant="primary" size="sm" className="rounded-xl font-bold text-sm px-5 shadow-sm shadow-primary/15 hover:shadow-md hover:shadow-primary/20 transition-all">
                  {t("navbar_post_request", "Plaats verzoek")}
                </Button>
              </Link>

              {/* Messages */}
              <Link
                href="/messages"
                className="hidden md:flex p-2 text-gray-500 hover:text-primary hover:bg-primary/[0.06] rounded-xl transition-all relative"
              >
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <div className="hidden md:block">
                <NotificationBell />
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {session.user?.avatarUrl ? (
                    <img
                      src={session.user.avatarUrl}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-sm">
                      {getInitials(session.user?.name)}
                    </div>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden md:block transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-elevated border border-gray-100/80 py-2 z-50 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-secondary text-sm">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-secondary transition-colors text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t("navbar_dashboard", "Dashboard")}
                      </Link>

                      <Link
                        href="/profile/edit"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-secondary transition-colors text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        {t("navbar_my_profile", "Mijn profiel")}
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-secondary transition-colors text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {t("navbar_settings", "Instellingen")}
                      </Link>

                      {session.user?.userType === "CUSTOMER" && (
                        <Link
                          href="/become-fixer"
                          className="flex items-center gap-3 px-4 py-2.5 text-primary font-bold hover:bg-primary/[0.05] transition-colors text-sm"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Wrench className="w-4 h-4" />
                          Word een Fixer
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("navbar_logout", "Uitloggen")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="text-gray-600 font-medium hover:text-primary transition-colors text-sm px-3 py-2">
                  {t("navbar_login", "Inloggen")}
                </button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="rounded-xl font-bold text-sm px-5">
                  {t("navbar_register", "Registreren")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
