"use client";

import { useState, useEffect } from "react";

type Notification = {
  id: number;
  type: "like" | "comment" | "follow" | "event" | "announcement";
  message: string;
  time: string;
  read: boolean;
};

const NOTIFICATIONS: Notification[] = [
  { id: 1, type: "like", message: "Sarah Chen liked your post", time: "5m ago", read: false },
  { id: 2, type: "comment", message: "Marcus Johnson commented on your photo", time: "15m ago", read: false },
  { id: 3, type: "follow", message: "Emily Rodriguez started following you", time: "1h ago", read: false },
  { id: 4, type: "event", message: "Career Fair starts in 2 days", time: "2h ago", read: true },
  { id: 5, type: "announcement", message: "New library hours for exam week", time: "3h ago", read: true },
  { id: 6, type: "like", message: "David Kim liked your comment", time: "5h ago", read: true },
  { id: 7, type: "comment", message: "Lisa Thompson replied to your thread", time: "8h ago", read: true },
  { id: 8, type: "follow", message: "Alex Wong started following you", time: "1d ago", read: true },
  { id: 9, type: "announcement", message: "Spring break registration now open", time: "2d ago", read: true },
  { id: 10, type: "event", message: "Photography club meeting tomorrow", time: "2d ago", read: true },
];

const TYPE_ICONS: Record<string, { bg: string; icon: string }> = {
  like: { bg: "bg-red-100", icon: "" },
  comment: { bg: "bg-blue-100", icon: "" },
  follow: { bg: "bg-green-100", icon: "" },
  event: { bg: "bg-base-200", icon: "" },
  announcement: { bg: "bg-purple-100", icon: "" },
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(NOTIFICATIONS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Notifications</h1>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-base-100 rounded-2xl border border-base-200 p-4 flex gap-3">
            <div className="w-10 h-10 rounded-full skeleton-loader shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 skeleton-loader" />
              <div className="h-2.5 w-16 skeleton-loader" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-medium text-white bg-primary px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-accent hover:text-primary/80 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
              filter === f
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {f} {f === "unread" && `(${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
            <p className="text-sm font-medium text-base-content/60">No notifications yet</p>
            <p className="text-xs text-base-content/40 mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          filtered.map((notification) => {
            const icon = TYPE_ICONS[notification.type];
            return (
              <div
                key={notification.id}
                className={`rounded-2xl p-4 transition-all hover:shadow-sm ${
                  notification.read
                    ? "bg-base-100 border border-base-200"
                    : "bg-base-200/50 border border-base-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${icon.bg} flex items-center justify-center text-lg shrink-0`}>
                    {notification.type === "like" && <span className="text-red-500"></span>}
                    {notification.type === "comment" && <span className="text-blue-500"></span>}
                    {notification.type === "follow" && <span className="text-green-500"></span>}
                    {notification.type === "event" && <span className="text-primary"></span>}
                    {notification.type === "announcement" && <span className="text-purple-500"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-base-content/70" : "text-base-content font-semibold"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-base-content/40 mt-0.5">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
