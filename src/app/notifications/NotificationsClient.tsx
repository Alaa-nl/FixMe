"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Button from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedId: string | null;
  read: boolean;
  createdAt: Date | string;
}

const NOTIFICATION_ICONS: { [key: string]: string } = {
  NEW_OFFER: "💰",
  OFFER_ACCEPTED: "✅",
  OFFER_REJECTED: "❌",
  JOB_STARTED: "🔧",
  JOB_COMPLETED: "🎉",
  NEW_REVIEW: "⭐",
  DISPUTE_OPENED: "⚠️",
  DISPUTE_RESOLVED: "✅",
  NEW_MESSAGE: "💬",
};

interface NotificationsClientProps {
  content: Record<string, string>;
}

export default function NotificationsClient({ content }: NotificationsClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      const response = await fetch("/api/notifications", {
        method: "PATCH",
      });

      if (response.ok) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNavigationPath = (type: string, relatedId: string | null): string => {
    if (!relatedId) return "/dashboard";

    switch (type) {
      case "NEW_OFFER":
      case "OFFER_REJECTED":
        return `/request/${relatedId}`;
      case "OFFER_ACCEPTED":
      case "JOB_STARTED":
      case "JOB_COMPLETED":
      case "NEW_REVIEW":
        return `/jobs/${relatedId}`;
      case "DISPUTE_OPENED":
      case "DISPUTE_RESOLVED":
        return `/disputes/${relatedId}`;
      case "NEW_MESSAGE":
        return `/messages/${relatedId}`;
      default:
        return "/dashboard";
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    const path = getNavigationPath(notification.type, notification.relatedId);
    router.push(path);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{content["notifications_loading"]}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {content["notifications_title"]}
          </h1>
          {unreadCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={markAllAsRead}
              disabled={isMarkingRead}
            >
              {isMarkingRead ? content["notifications_marking"] : content["notifications_mark_all"]}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Bell size={64} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">{content["notifications_empty_title"]}</p>
              <p className="text-sm mt-2">{content["notifications_empty_desc"]}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all ${
                  !notification.read ? "ring-2 ring-orange-200" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">
                    {NOTIFICATION_ICONS[notification.type] || "📢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3
                        className={`text-lg ${
                          !notification.read
                            ? "font-bold text-gray-900"
                            : "font-semibold text-gray-800"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">
                          {content["notifications_unread_badge"]}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
