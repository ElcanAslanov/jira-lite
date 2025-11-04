"use client";
import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationBell({ onTaskOpen }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🔹 Bildirişləri yüklə
  async function loadNotifications() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data.notifications || []);
    } catch {
      toast.error("Bildirişlər yüklənmədi ❌");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Oxundu kimi işarələ
  async function markAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error("Xəta baş verdi ❌");
    }
  }

  // 🔹 Bildiriş kliklənəndə (oxunur və task açılır)
  async function handleClick(notification: any) {
    await markAsRead(notification.id);
    setOpen(false);

    // Əgər task ID varsa — parent komponentə ötür
    if (notification.issueId && onTaskOpen) {
      onTaskOpen(notification.issueId);
    }
  }

  // 🔹 İlk yüklənmə və avtomatik yenilənmə (10 saniyə)
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      {/* 🔔 Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-700 hover:text-black transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Bildiriş siyahısı */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-2 font-semibold border-b text-gray-700 flex justify-between items-center">
            Bildirişlər
            <button
              onClick={loadNotifications}
              className="text-xs text-blue-500 hover:underline"
            >
              Yenilə
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm p-3">Yüklənir...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-sm p-3">Bildiriş yoxdur</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`p-2 text-sm border-b cursor-pointer hover:bg-gray-50 flex justify-between items-start ${
                    n.isRead ? "text-gray-500" : "text-black font-medium"
                  }`}
                >
                  <div>
                    {n.message}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("az-AZ")}
                    </div>
                  </div>

                  {!n.isRead && (
                    <div title="Oxundu">
                    <Check className="w-4 h-4 text-green-500 mt-1" />
                    </div>

                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
