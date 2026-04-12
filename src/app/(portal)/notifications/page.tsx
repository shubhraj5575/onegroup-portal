"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CreditCard,
  Building2,
  FileText,
  MessageSquare,
  Megaphone,
  CheckCheck,
  BellRing,
  Inbox,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  PAYMENT_REMINDER: CreditCard,
  PAYMENT_CONFIRMATION: CreditCard,
  CONSTRUCTION_UPDATE: Building2,
  DOCUMENT_ADDED: FileText,
  TICKET_UPDATE: MessageSquare,
  ANNOUNCEMENT: Megaphone,
};

const typeBorderColors: Record<string, string> = {
  PAYMENT_REMINDER: "border-l-emerald-500",
  PAYMENT_CONFIRMATION: "border-l-emerald-500",
  CONSTRUCTION_UPDATE: "border-l-blue-500",
  DOCUMENT_ADDED: "border-l-purple-500",
  TICKET_UPDATE: "border-l-orange-500",
  ANNOUNCEMENT: "border-l-rose-500",
};

const typeIconColors: Record<string, { bg: string; text: string }> = {
  PAYMENT_REMINDER: { bg: "bg-emerald-100", text: "text-emerald-600" },
  PAYMENT_CONFIRMATION: { bg: "bg-emerald-100", text: "text-emerald-600" },
  CONSTRUCTION_UPDATE: { bg: "bg-blue-100", text: "text-blue-600" },
  DOCUMENT_ADDED: { bg: "bg-purple-100", text: "text-purple-600" },
  TICKET_UPDATE: { bg: "bg-orange-100", text: "text-orange-600" },
  ANNOUNCEMENT: { bg: "bg-rose-100", text: "text-rose-600" },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchNotifications();
  }, [accessToken]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <BellRing className="h-8 w-8 text-amber-500" />
              Notifications
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              Stay updated on your account activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-rose-500 text-white border-0 font-semibold px-3 py-1 text-sm shadow-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="gap-2 border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <Inbox className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No notifications
            </h3>
            <p className="text-gray-500 mt-1">
              You are all caught up
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const borderColor =
              typeBorderColors[notification.type] || "border-l-gray-400";
            const iconColor = typeIconColors[notification.type] || {
              bg: "bg-gray-100",
              text: "text-gray-500",
            };

            return (
              <Card
                key={notification.id}
                className={`
                  cursor-pointer transition-all duration-200 border-l-4 overflow-hidden
                  ${borderColor}
                  ${
                    !notification.isRead
                      ? "bg-gradient-to-r from-blue-50/60 to-white shadow-md shadow-blue-100/50 ring-1 ring-blue-100/50 hover:shadow-lg hover:shadow-blue-100/50"
                      : "bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50/50"
                  }
                `}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <CardContent className="flex items-start gap-4 p-5">
                  {/* Icon */}
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !notification.isRead
                        ? iconColor.bg + " " + iconColor.text
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`text-sm leading-snug ${
                          !notification.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-600"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap mt-0.5">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        !notification.isRead
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {notification.body}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 animate-pulse" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
