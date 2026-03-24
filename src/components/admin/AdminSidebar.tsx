"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Users,
  Briefcase,
  AlertTriangle,
  CreditCard,
  FolderOpen,
  Settings,
  Home,
  Menu,
  X,
  LogOut,
  Shield,
  Ticket,
  Euro,
  FileText,
  ScrollText,
  Headset,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
  permissions: string[];
  isSuperAdmin: boolean;
}

// Navigation items with required permissions
const allNavigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    requiredPermission: null, // Always visible
    badge: null,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    requiredPermission: "users.view",
    badge: null,
  },
  {
    name: "Jobs & Requests",
    href: "/admin/jobs",
    icon: Briefcase,
    requiredPermission: "jobs.view",
    badge: null,
  },
  {
    name: "Disputes",
    href: "/admin/disputes",
    icon: AlertTriangle,
    requiredPermission: "disputes.view",
    badge: "pending_disputes", // Will show count of pending disputes
  },
  {
    name: "Support Chat",
    href: "/admin/support",
    icon: Headset,
    requiredPermission: null, // Visible to all admins/staff
    badge: "escalated_support",
  },
  {
    name: "Finance",
    href: "/admin/payments",
    icon: CreditCard,
    requiredPermission: "finance.view",
    badge: null,
  },
  {
    name: "Vouchers",
    href: "/admin/vouchers",
    icon: Ticket,
    requiredPermission: "finance.vouchers",
    badge: null,
  },
  {
    name: "Credits",
    href: "/admin/credits",
    icon: Euro,
    requiredPermission: "finance.adjust",
    badge: null,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
    requiredPermission: "categories.view",
    badge: null,
  },
  {
    name: "Website Content",
    href: "/admin/content",
    icon: FileText,
    requiredPermission: "content.edit",
    badge: null,
  },
  {
    name: "Staff & Roles",
    href: "/admin/staff",
    icon: Shield,
    requiredPermission: "staff.view",
    badge: null,
  },
  {
    name: "Platform Settings",
    href: "/admin/settings",
    icon: Settings,
    requiredPermission: "settings.view",
    badge: null,
  },
  {
    name: "Activity Log",
    href: "/admin/logs",
    icon: ScrollText,
    requiredPermission: "superadmin", // Only super admins can view
    badge: null,
  },
  {
    name: "Back to App",
    href: "/",
    icon: Home,
    requiredPermission: null, // Always visible
    badge: null,
  },
];

export default function AdminSidebar({
  user,
  permissions,
  isSuperAdmin,
}: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const pathname = usePathname();

  // Fetch badge counts on mount
  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        // Fetch counts in parallel
        const [disputeRes, supportRes] = await Promise.all([
          fetch("/api/admin/disputes/count"),
          fetch("/api/admin/support/count"),
        ]);

        const counts: Record<string, number> = {};

        if (disputeRes.ok) {
          const data = await disputeRes.json();
          counts.pending_disputes = data.count || 0;
        }
        if (supportRes.ok) {
          const data = await supportRes.json();
          counts.escalated_support = data.count || 0;
        }

        setBadgeCounts(counts);
      } catch (error) {
        console.error("Error fetching badge counts:", error);
      }
    };

    fetchBadgeCounts();
  }, []);

  // Filter navigation items based on permissions
  const navigation = useMemo(() => {
    return allNavigationItems.filter((item) => {
      // Always show items without permission requirement
      if (!item.requiredPermission) return true;

      // Super admins see everything
      if (isSuperAdmin) return true;

      // Check if user has the required permission
      return permissions.includes(item.requiredPermission);
    });
  }, [permissions, isSuperAdmin]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href) ?? false;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-secondary text-white rounded-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-secondary transition-transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Logo variant="horizontal-dark" size="sm" />
              <h1 className="text-2xl font-bold text-white">FixMe</h1>
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                {isSuperAdmin ? "ADMIN" : "STAFF"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-orange-500 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && badgeCounts[item.badge] > 0 && (
                    <span
                      className={`ml-auto px-2 py-0.5 text-white text-xs font-bold rounded-full ${
                        item.badge === "escalated_support"
                          ? "bg-primary"
                          : "bg-red-500"
                      }`}
                    >
                      {badgeCounts[item.badge]}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info + Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "Admin"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.name}</p>
                <p className="text-white/60 text-sm truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
